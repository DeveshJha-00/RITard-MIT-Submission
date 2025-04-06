# Add uuid import at the top of the file
import os
import uuid  # Add this import
import base64
import json
import logging
from datetime import datetime
from PIL import Image
import io
import traceback  # Add this import
import uuid
# Rest of your code remains the same
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from receipt_scanner import process_receipt

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For flash messages
app.config['UPLOAD_FOLDER'] = 'input'
app.config['OUTPUT_FOLDER'] = 'output'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Ensure input and output directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    """Home page with upload form"""
    # Get list of processed files for display in the UI
    processed_files = []
    if os.path.exists(app.config['OUTPUT_FOLDER']):
        for filename in os.listdir(app.config['OUTPUT_FOLDER']):
            if filename.endswith('_document.jpg'):
                file_info = {
                    'jpg_name': filename,
                    'text_name': filename.replace('_document.jpg', '_text.txt')
                }
                processed_files.append(file_info)
    
    return render_template('index.html', processed_files=processed_files)

@app.route('/camera')
def camera():
    """Camera-based receipt capture page"""
    return render_template('camera.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and process the receipt"""
    # Check if a file was uploaded
    if 'file' not in request.files:
        flash('No file part')
        return redirect(url_for('index'))
    
    file = request.files['file']
    
    # Check if the user submitted an empty form
    if file.filename == '':
        flash('No selected file')
        return redirect(url_for('index'))
    
    # Check if the file is allowed
    if file and allowed_file(file.filename):
        try:
            # Generate a unique filename to avoid conflicts
            original_filename = secure_filename(file.filename)
            base_name = os.path.splitext(original_filename)[0]
            unique_id = str(uuid.uuid4().hex[:8])
            unique_filename = f"{base_name}_{unique_id}{os.path.splitext(original_filename)[1]}"
            
            # Save the uploaded file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            app.logger.info(f"File saved to {file_path}, starting processing...")
            
            try:
                # Process the receipt with Groq Vision LLM
                result = process_receipt(file_path)
                
                # Extract filenames for rendering
                document_path = result['document_path']
                jpg_filename = os.path.basename(document_path)
                text_filename = os.path.basename(result['text_path'])
                
                # Get the extracted data
                extracted_data = result.get('extracted_data', {})
                
                app.logger.info(f"Processing complete. JPG: {jpg_filename}, Text: {text_filename}")
                flash('Receipt processed successfully!')
                
                # Redirect to the results page
                return redirect(url_for('show_result', 
                                        jpg_filename=jpg_filename, 
                                        text_filename=text_filename))
            
            except Exception as e:
                error_details = traceback.format_exc()
                app.logger.error(f"Error processing receipt: {str(e)}\n{error_details}")
                flash(f'Error processing receipt: {str(e)}. Please try a different image.')
                return redirect(url_for('index'))
        
        except Exception as e:
            app.logger.error(f"Error saving file: {str(e)}")
            flash(f'Error saving file: {str(e)}')
            return redirect(url_for('index'))
    
    # If the file is not allowed
    flash('File type not allowed. Please upload a JPG, JPEG, or PNG image.')
    return redirect(url_for('index'))

@app.route('/upload_image', methods=['POST'])
def upload_image():
    """Handle base64 image data from camera capture"""
    try:
        # Get the base64 image data
        image_data = request.form.get('image')
        if not image_data:
            flash('No image data received')
            return redirect(url_for('index'))
        
        # Remove data URL prefix (if present)
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        try:
            # Decode base64 data
            image_bytes = base64.b64decode(image_data)
            
            # Generate a unique filename
            unique_id = str(uuid.uuid4().hex[:8])
            unique_filename = f"camera_capture_{unique_id}.jpg"
            
            # Save the image to a file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            with open(file_path, 'wb') as f:
                f.write(image_bytes)
            
            app.logger.info(f"Camera image saved to {file_path}, starting processing...")
            
            # Process the receipt with Groq Vision LLM
            try:
                result = process_receipt(file_path)
                
                # Extract filenames for rendering
                document_path = result['document_path']
                jpg_filename = os.path.basename(document_path)
                text_filename = os.path.basename(result['text_path'])
                
                # Get the extracted data
                extracted_data = result.get('extracted_data', {})
                
                app.logger.info(f"Processing complete. JPG: {jpg_filename}, Text: {text_filename}")
                flash('Receipt processed successfully!')
                
                # Redirect to the results page
                return redirect(url_for('show_result', 
                                        jpg_filename=jpg_filename, 
                                        text_filename=text_filename))
            
            except Exception as e:
                error_details = traceback.format_exc()
                app.logger.error(f"Error processing receipt: {str(e)}\n{error_details}")
                flash(f'Error processing receipt: {str(e)}. Please try a different image.')
                return redirect(url_for('index'))
                
        except Exception as e:
            app.logger.error(f"Error decoding/saving image: {str(e)}")
            flash(f'Error processing image: {str(e)}')
            return redirect(url_for('index'))
        
    except Exception as e:
        app.logger.error(f"Error in upload_image: {str(e)}")
        flash(f'Error processing receipt: {str(e)}')
        return redirect(url_for('index'))

@app.route('/result')
def show_result():
    """Display the processing results"""
    jpg_filename = request.args.get('jpg_filename')
    text_filename = request.args.get('text_filename')
    
    # Verify the files exist
    jpg_path = os.path.join(app.config['OUTPUT_FOLDER'], jpg_filename)
    text_path = os.path.join(app.config['OUTPUT_FOLDER'], text_filename)
    
    if not os.path.exists(jpg_path) or not os.path.exists(text_path):
        flash('Output files not found. Please try processing the receipt again.')
        return redirect(url_for('index'))
    
    # Read the extracted data
    with open(text_path, 'r', encoding='utf-8') as f:
        try:
            extracted_data = json.loads(f.read())
        except json.JSONDecodeError:
            extracted_data = {"error": "Invalid JSON format in output file"}
    
    return render_template('result.html', 
                           jpg_filename=jpg_filename, 
                           text_filename=text_filename,
                           extracted_data=extracted_data)

@app.route('/api/extract', methods=['POST'])
def api_extract():
    """API endpoint for receipt extraction"""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Generate a unique filename
            original_filename = secure_filename(file.filename)
            base_name = os.path.splitext(original_filename)[0]
            unique_id = str(uuid.uuid4().hex[:8])
            unique_filename = f"{base_name}_{unique_id}{os.path.splitext(original_filename)[1]}"
            
            # Save the uploaded file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Process the receipt
            result = process_receipt(file_path)
            
            # Return the extracted data
            return jsonify({
                "status": "success",
                "data": result.get('extracted_data', {}),
                "document_url": url_for('download_file', filename=os.path.basename(result['document_path']), _external=True),
                "text_url": url_for('download_file', filename=os.path.basename(result['text_path']), _external=True)
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/download/<filename>')
def download_file(filename):
    """Download a file from the output directory"""
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

@app.route('/view/<filename>')
def view_file(filename):
    """View a file from the output directory"""
    if filename.endswith('.txt'):
        # Read the text file content
        with open(os.path.join(app.config['OUTPUT_FOLDER'], filename), 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Try to parse as JSON for better display
            try:
                parsed_content = json.loads(content)
                content = json.dumps(parsed_content, indent=2)
            except json.JSONDecodeError:
                # Keep as is if not valid JSON
                pass
                
        return render_template('view_text.html', filename=filename, content=content)
    else:
        # For image files, show the image
        return render_template('view_image.html', filename=filename)

@app.route('/debug')
def debug_info():
    """Route to provide debug information"""
    input_files = os.listdir(app.config['UPLOAD_FOLDER']) if os.path.exists(app.config['UPLOAD_FOLDER']) else []
    output_files = os.listdir(app.config['OUTPUT_FOLDER']) if os.path.exists(app.config['OUTPUT_FOLDER']) else []
    
    return render_template('debug.html', 
                          input_files=input_files,
                          output_files=output_files)

if __name__ == '__main__':
    # Run the server on all network interfaces so it's accessible from other devices
    app.run(debug=True, host='0.0.0.0', port=5000)