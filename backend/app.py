from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from pymongo import MongoClient
from finance_bot import ChatModel
import uuid
from dotenv import load_dotenv
import os
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from PIL import Image
import io
import requests

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Secure key for the app
app.secret_key = 'your-secure-financial-key-here'  # Replace with a secure secret key

# Store chat sessions
finance_chat_sessions = {}

# Create transactions folder if it doesn't exist
if not os.path.exists('transactions'):
    os.makedirs('transactions', mode=0o755)

@app.route('/', methods=['GET'])
def index():
    """Root endpoint to verify API is running"""
    return jsonify({
        'status': 'success',
        'message': 'FinWise API is running. Use /api/finance/start to begin a chat session.'
    })

@app.route('/api/finance/start', methods=['POST'])
def start_finance_chat():
    """Initialize a new finance chat session or resume an existing one"""
    try:
        # Get the session ID from the frontend if provided
        incoming_session_id = request.json.get('session_id')

        # Reuse the session if it exists
        if incoming_session_id and incoming_session_id in finance_chat_sessions:
            print(f"Reusing existing finance session: session_id={incoming_session_id}")
            return jsonify({
                'status': 'success',
                'session_id': incoming_session_id,
                'message': "Welcome back to FinWise! How can I assist with your financial questions today?",
                'suggestions': [
                    "I need help with budgeting",
                    "How can I reduce my debt?",
                    "What investment options should I consider?",
                    "I want to start saving for retirement"
                ]
            })

        # Otherwise, create a new session
        session_id = str(uuid.uuid4())
        finance_chat_sessions[session_id] = {
            'messages': [],
            'user_info': request.json.get('user_info', {})
        }

        print(f"New finance session initialized: session_id={session_id}")
        return jsonify({
            'status': 'success',
            'session_id': session_id,
            'message': "Hi! I'm FinWise, your financial assistant. I can help with budgeting, investing, debt management, and more. What financial topic can I assist you with today?",
            'suggestions': [
                "I need help with budgeting",
                "How can I reduce my debt?",
                "What investment options should I consider?",
                "I want to start saving for retirement"
            ]
        })

    except Exception as e:
        print(f"Error in start_finance_chat: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/finance/message', methods=['POST'])
def finance_chat_message():
    """Handle finance chat messages"""
    try:
        data = request.json
        session_id = data.get('session_id')
        message = data.get('message')

        # Debug: Log incoming request
        print(f"Incoming finance request: session_id={session_id}, message={message}")

        # Validate input
        if not session_id or not message:
            print("Error: Missing session_id or message")
            return jsonify({
                'status': 'error',
                'message': 'Missing session_id or message'
            }), 400

        # Check if session exists
        if session_id not in finance_chat_sessions:
            print("Error: Invalid session")
            return jsonify({
                'status': 'error',
                'message': 'Invalid session'
            }), 404

        # Get response from finance bot model
        response = ChatModel(
            session_id,
            message,
            finance_chat_sessions[session_id]['messages']
        )

        # Debug: Log LLM response
        print(f"FinWise Response: {response['res']['msg']}")

        suggestions = extract_financial_suggestions(response['info'])

        return jsonify({
            'status': 'success',
            'message': response['res']['msg'],
            'suggestions': suggestions
        })

    except Exception as e:
        print(f"Error in finance_chat_message: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/finance/history', methods=['GET'])
def finance_chat_history():
    """Retrieve chat history for a finance session"""
    try:
        session_id = request.args.get('session_id')

        if not session_id or session_id not in finance_chat_sessions:
            return jsonify({
                'status': 'error',
                'message': 'Invalid session'
            }), 404

        messages = finance_chat_sessions[session_id]['messages']

        return jsonify({
            'status': 'success',
            'messages': messages
        })

    except Exception as e:
        print(f"Error in finance_chat_history: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/finance/end', methods=['POST'])
def end_finance_chat():
    """End a finance chat session"""
    try:
        session_id = request.json.get('session_id')

        if session_id in finance_chat_sessions:
            del finance_chat_sessions[session_id]

        return jsonify({
            'status': 'success',
            'message': 'Finance chat session ended'
        })

    except Exception as e:
        print(f"Error in end_finance_chat: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/whatsapp-webhook', methods=['POST'])
def whatsapp_webhook():
    """Handle incoming WhatsApp messages and images"""
    try:
        # Get basic info
        sender_number = request.values.get('From', '').replace('whatsapp:', '')
        num_media = int(request.values.get('NumMedia', 0))

        # Remove +91 prefix from sender number
        clean_number = sender_number.replace('+91', '')

        # Create transactions folder with absolute path
        full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'transactions')
        if not os.path.exists(full_path):
            os.makedirs(full_path, mode=0o755)
            print(f"Created transactions folder at: {full_path}")

        # Check if message contains an image
        if num_media > 0:
            try:
                # Get media URL directly
                media_url = request.values.get('MediaUrl0')
                print(f"Got media URL: {media_url}")

                # Get Twilio credentials
                account_sid = 'ACe255088910ba6398c9ca24a50d84f797'
                auth_token = '784a53c0495fdd494cc800b4bd97de1d'

                # Configure proxy for PythonAnywhere
                proxies = None
                if 'http_proxy' in os.environ:
                    proxies = {
                        'http': os.environ['http_proxy'],
                        'https': os.environ['https_proxy']
                    }

                # Download the image with authentication
                response = requests.get(
                    media_url,
                    auth=(account_sid, auth_token),
                    proxies=proxies
                )

                # Check if download was successful
                if response.status_code == 200:
                    # Create timestamp for filename
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

                    # Save image as JPG first
                    jpg_path = os.path.join(full_path, f"{clean_number}_{timestamp}.jpg")
                    with open(jpg_path, 'wb') as f:
                        f.write(response.content)
                    print(f"Saved JPG to {jpg_path}")
                    twilio_response = MessagingResponse()
                    twilio_response.message("Your image has been saved successfully!")
                    return str(twilio_response)
                    
                else:
                    # Failed to download image
                    print(f"Failed to download image. Status code: {response.status_code}")
                    twilio_response = MessagingResponse()
                    twilio_response.message(f"Could not download image. Status code: {response.status_code}")
                    return str(twilio_response)

            except Exception as img_error:
                print(f"Image processing error: {img_error}")
                twilio_response = MessagingResponse()
                twilio_response.message("Sorry, couldn't process your image")
                return str(twilio_response)

        # Handle text messages with existing chat logic
        incoming_msg = request.values.get('Body', '').strip()
        session_id = f"whatsapp_{clean_number}"

        # Initialize session if it doesn't exist
        if session_id not in finance_chat_sessions:
            finance_chat_sessions[session_id] = {
                'messages': [],
                'user_info': {'phone': clean_number}
            }

        # Process message with finance bot
        response = ChatModel(
            id=session_id,
            msg=incoming_msg,
            messages=finance_chat_sessions[session_id]['messages']
        )

        # Create Twilio response
        twilio_response = MessagingResponse()
        twilio_response.message(response['res']['msg'])
        return str(twilio_response)

    except Exception as e:
        print(f"Error in whatsapp_webhook: {e}")
        twilio_response = MessagingResponse()
        twilio_response.message("Sorry, I encountered an error processing your request.")
        return str(twilio_response)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
