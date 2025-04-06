# Add uuid import at the top of the file
import os
import uuid  # Add this import
import base64
import json
import logging
import random
import traceback
# Add these imports at the top
import requests
from datetime import datetime
from flask_cors import CORS


from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from receipt_scanner import process_receipt

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes

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

# Add this function to handle sending receipt data to MockBank API
def send_receipt_to_mockbank(extracted_data):
    """
    Convert receipt data to transaction format and send to MockBank API
    """
    try:
        # Use the same credentials as in gen.py
        BASE_URL = "https://api.mockbank.io"
        CLIENT_ID = "ramaiah3316"
        CLIENT_SECRET = "12345678"
        USERNAME = "1ms23cy027@msrit.edu"
        PASSWORD = "karteek**05U"
        
        # Get access token using the same method as in gen.py
        auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
        data = {
            "grant_type": "password",
            "username": USERNAME,
            "password": PASSWORD
        }
        token_response = requests.post(f"{BASE_URL}/oauth/token", auth=auth, data=data)
        token_response.raise_for_status()
        access_token = token_response.json()["access_token"]
        
        # Load customer and account IDs from mockbank_data.json
        try:
            with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'mockbank_data.json')) as f:
                mockbank_data = json.load(f)
                customer_id = mockbank_data.get("customer")
                account_id = mockbank_data.get("account")
                
                if not customer_id or not account_id:
                    raise ValueError("Missing customer or account ID in mockbank_data.json")
                    
                app.logger.info(f"Loaded customer_id: {customer_id}, account_id: {account_id} from mockbank_data.json")
        except Exception as e:
            app.logger.error(f"Error loading mockbank_data.json: {str(e)}")
            raise ValueError(f"Could not load customer/account data: {str(e)}")
        
        # Convert amount to paise (assuming amount is in rupees)
        try:
            amount_value = float(extracted_data.get("amount", "0"))
            # Receipts are expenses, so amount should be negative
            amount_paise = int(-abs(amount_value) * 100)
        except:
            amount_paise = -1000  # Default to 10 rupees if conversion fails
        
        # Get merchant name
        merchant = extracted_data.get("merchant", "Unknown Merchant")
        
        # Get date or use current date
        try:
            date_str = extracted_data.get("date")
            if date_str:
                # Try to parse the date
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            else:
                date_obj = datetime.now()
            booking_date = date_obj.isoformat()[:10]
        except:
            booking_date = datetime.now().isoformat()[:10]
        
        # Create transaction payload exactly like in gen.py
        transaction = {
            "accountId": account_id,
            "amount": amount_paise,
            "currency": "INR",
            "bookingDate": booking_date,
            "valueDate": datetime.now().isoformat()[:10],
            "operationId": f"OP-{uuid.uuid4().hex[:8]}",
            "entryReference": f"REF-{uuid.uuid4().hex[:6]}",
            "endToEndId": f"E2E-{uuid.uuid4().hex[:8]}",
            "remittanceInformationUnstructured": f"Receipt - {merchant}",
            "purposeCode": "OTHR",
            "bankTransactionCode": "PMT",
            "proprietaryBankTransactionCode": "DEBT"
        }
        
        # Add debtor account reference exactly like in gen.py
        transaction.update({
            "debtorAccount": {
                "iban": f"IN{random.randint(1000000000000000, 9999999999999999)}",
                "bban": str(random.randint(10000000000000, 99999999999999)),
                "currency": "INR"
            },
            "debtorBic": "MOCKINBBXXX"
        })
        
        # Log the transaction data for debugging
        app.logger.info(f"Sending transaction to MockBank: {json.dumps(transaction)}")
        
        # Send transaction to MockBank API using the exact same endpoint as in gen.py
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
        response = requests.post(
            f"{BASE_URL}/customers/{customer_id}/transactions",
            headers=headers,
            json=transaction
        )
        
        # Check response
        response.raise_for_status()
        
        # Return success response
        return {
            "success": True, 
            "transaction_id": response.json().get("id", "unknown"),
            "amount": abs(amount_paise/100),
            "merchant": merchant,
            "date": booking_date
        }
            
    except Exception as e:
        app.logger.error(f"Error sending receipt to MockBank: {str(e)}")
        error_details = traceback.format_exc()
        app.logger.error(f"Error details: {error_details}")
        return {"success": False, "error": str(e)}
@app.route('/api/recent_receipt')
def recent_receipt():
    """Return the most recent processed receipt"""
    try:
        if os.path.exists(app.config['OUTPUT_FOLDER']):
            # Get all document jpg files
            jpg_files = [f for f in os.listdir(app.config['OUTPUT_FOLDER']) if f.endswith('_document.jpg')]
            
            if not jpg_files:
                return jsonify({"error": "No receipts found"}), 404
                
            # Sort by creation time (most recent first)
            jpg_files.sort(key=lambda x: os.path.getctime(os.path.join(app.config['OUTPUT_FOLDER'], x)), reverse=True)
            
            # Get the most recent file
            most_recent = jpg_files[0]
            text_file = most_recent.replace('_document.jpg', '_text.txt')
            
            # Extract receipt ID if available
            receipt_id = most_recent.split('_')[0] if '_' in most_recent else ''
            
            return jsonify({
                "jpg_filename": most_recent,
                "text_filename": text_file,
                "receipt_id": receipt_id
            })
        
        return jsonify({"error": "No output directory found"}), 404
    
    except Exception as e:
        app.logger.error(f"Error getting recent receipt: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/transaction_status')
def transaction_status():
    """Return the transaction status for a receipt"""
    receipt_id = request.args.get('receipt_id', '')
    
    # This is a placeholder - in a real app, you would look up the transaction
    # status in your database based on the receipt ID
    return jsonify({
        "success": True,
        "transaction_id": f"TX-{receipt_id[:8] if receipt_id else uuid.uuid4().hex[:8]}",
        "amount": 1250.75,
        "merchant": "Sample Merchant",
        "date": datetime.now().isoformat()[:10]
    })
# Update the API endpoint for receipt scanning and transaction creation
@app.route('/api/receipt_to_transaction', methods=['POST'])
def api_receipt_to_transaction():
    """API endpoint to scan a receipt and create a transaction"""
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
            extracted_data = result.get('extracted_data', {})
            
            # Send to MockBank
            mockbank_result = send_receipt_to_mockbank(extracted_data)
            
            # Return the results
            return jsonify({
                "status": "success",
                "receipt_data": extracted_data,
                "transaction_added": mockbank_result.get('success', False),
                "transaction_id": mockbank_result.get('transaction_id', None),
                "error": mockbank_result.get('error', None),
                "document_url": url_for('download_file', filename=os.path.basename(result['document_path']), _external=True),
                "text_url": url_for('download_file', filename=os.path.basename(result['text_path']), _external=True)
            })
            
        except Exception as e:
            app.logger.error(f"Error in receipt_to_transaction: {str(e)}")
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "File type not allowed"}), 400
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

# Add the missing show_result route
@app.route('/result')
def show_result():
    """Show the results of receipt processing"""
    jpg_filename = request.args.get('jpg_filename')
    text_filename = request.args.get('text_filename')
    
    if not jpg_filename or not text_filename:
        flash('Missing result files')
        return redirect(url_for('index'))
    
    # Try to read the extracted data from the text file
    extracted_data = {}
    try:
        with open(os.path.join(app.config['OUTPUT_FOLDER'], text_filename), 'r', encoding='utf-8') as f:
            content = f.read()
            try:
                # Try to parse as JSON
                extracted_data = json.loads(content)
            except json.JSONDecodeError:
                # If not valid JSON, just use empty dict
                pass
    except Exception as e:
        app.logger.error(f"Error reading text file: {str(e)}")
    
    # Send to MockBank if we have data
    mockbank_result = {"success": False}
    if extracted_data:
        mockbank_result = send_receipt_to_mockbank(extracted_data)
    
    return render_template('result.html', 
                          jpg_filename=jpg_filename, 
                          text_filename=text_filename,
                          extracted_data=extracted_data,
                          mockbank_result=mockbank_result)

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