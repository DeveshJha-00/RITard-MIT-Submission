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
import json
from trans_bot import BankingDataAssistant
from flask_cors import cross_origin
from flask_socketio import SocketIO
import os
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
                    # Create timestamp and unique ID for filename
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    unique_id = str(uuid.uuid4().hex[:8])
                    filename = f"{clean_number}_{timestamp}_{unique_id}"
                    
                    # Save image to input folder for processing
                    input_folder = app.config['UPLOAD_FOLDER']
                    if not os.path.exists(input_folder):
                        os.makedirs(input_folder, mode=0o755)
                    
                    # Determine file extension based on content type or default to jpg
                    content_type = response.headers.get('Content-Type', 'image/jpeg')
                    extension = content_type.split('/')[-1] if '/' in content_type else 'jpg'
                    if extension not in app.config['ALLOWED_EXTENSIONS']:
                        extension = 'jpg'
                    
                    # Full path for saved image
                    file_path = os.path.join(input_folder, f"{filename}.{extension}")
                    
                    # Save the image
                    with open(file_path, 'wb') as f:
                        f.write(response.content)
                    print(f"Saved image to {file_path}")
                    
                    # Process the receipt with receipt_scanner
                    try:
                        print(f"Processing receipt from {file_path}")
                        result = process_receipt(file_path)
                        
                        # Get extracted data
                        extracted_data = result.get('extracted_data', {})
                        
                        # Send to MockBank
                        mockbank_result = send_receipt_to_mockbank(extracted_data)
                        
                        # Format a nice response message
                        if mockbank_result.get('success', False):
                            # Success message with formatted details
                            message_parts = [
                                "✅ Receipt processed successfully!",
                                "",
                                "📝 Receipt Details:",
                            ]
                            
                            # Add merchant if available
                            if "merchant" in extracted_data:
                                message_parts.append(f"🏬 Merchant: {extracted_data['merchant']}")
                            
                            # Add amount if available
                            if "amount" in extracted_data:
                                message_parts.append(f"💰 Amount: ₹{extracted_data['amount']}")
                            
                            # Add date if available
                            if "date" in extracted_data:
                                message_parts.append(f"📅 Date: {extracted_data['date']}")
                            
                            # Add transaction details
                            message_parts.extend([
                                "",
                                "🏦 Transaction created!",
                                f"🔖 ID: {mockbank_result.get('transaction_id', 'Unknown')}"
                            ])
                            
                            # Join all parts
                            response_message = "\n".join(message_parts)
                        else:
                            # Error message
                            response_message = "❌ Could not process receipt properly. Please try again with a clearer image."
                            if "error" in mockbank_result:
                                response_message += f"\n\nError: {mockbank_result['error']}"
                    
                    except Exception as proc_error:
                        print(f"Receipt processing error: {proc_error}")
                        response_message = "❌ Sorry, I couldn't process your receipt image. Please make sure it's clear and try again."
                    
                    # Create Twilio response
                    twilio_response = MessagingResponse()
                    twilio_response.message(response_message)
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
        traceback_details = traceback.format_exc()
        print(f"Traceback: {traceback_details}")
        twilio_response = MessagingResponse()
        twilio_response.message("Sorry, I encountered an error processing your request.")
        return str(twilio_response)
def extract_financial_suggestions(info):
    """Extract contextual suggestions for finance based on the conversation"""
    suggestions = []
    
    # Add suggestions based on primary financial concern
    if info.get('primary_concern'):
        suggestions.append(f"Tell me more about your {info['primary_concern']} situation")
    
    # Add suggestions based on financial goals
    financial_goals = info.get('financial_goals', [])
    if financial_goals and len(financial_goals) > 0:
        suggestions.append(f"How can I help with your goal to {financial_goals[0]}?")
    
    # Add suggestions based on recommended strategies
    strategies = info.get('recommended_strategies', [])
    if strategies and len(strategies) > 0:
        suggestions.append(f"Would you like more details about {strategies[0]}?")
    
    # Add general financial suggestions
    suggestions.extend([
        "How can I improve my budget?",
        "What should I know about investing in mutual funds?",
        "How can I reduce my personal loan debt?",
        "What are some tax-saving investment options in India?"
    ])
    
    return suggestions[:4]  # Return max 4 suggestions

def is_financial_emergency(message):
    """Check if the message indicates a financial emergency"""
    emergency_keywords = [
        'bankruptcy', 'foreclosure', 'eviction', 'debt collector',
        'loan shark', 'garnishment', 'repossession', 'urgent financial',
        'unable to pay EMI', 'loan default', 'credit card debt'
    ]
    
    return any(keyword in message.lower() for keyword in emergency_keywords)

def get_emergency_financial_resources():
    """Return emergency financial resources for Indian population"""
    return {
        'message': 'For urgent financial situations in India, consider these resources:',
        'resources': [
            {
                'name': 'National Consumer Helpline',
                'contact': '1800-11-4000',
                'available': 'Monday to Saturday, 9:30 AM to 5:30 PM'
            },
            {
                'name': 'RBI Banking Ombudsman',
                'contact': 'https://cms.rbi.org.in',
                'available': 'Online complaint system'
            },
            {
                'name': 'SEBI SCORES for investment complaints',
                'contact': 'https://scores.gov.in',
                'available': '24/7 online portal'
            },
            {
                'name': 'Debt Recovery Tribunal Information',
                'contact': 'https://drt.gov.in',
                'available': 'Business hours'
            }
        ]
    }
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")) as f:
    config = json.load(f)
    CUSTOMER_ID = config["customer_id"]
    ACCOUNT_ID = config["account_id"]

BASE_URL = "https://api.mockbank.io"
CLIENT_CREDENTIALS = ('ramaiah3316','12345678')  # Add your credentials here

def get_auth_header():
    token = get_access_token()
    return {"Authorization": f"Bearer {token}"}

def get_access_token():
    auth = requests.auth.HTTPBasicAuth(*CLIENT_CREDENTIALS)
    data = {
        "grant_type": "password",
        "username": "1ms23cy027@msrit.edu",
        "password": "karteek**05U"
    }
    response = requests.post(f"{BASE_URL}/oauth/token", auth=auth, data=data)
    return response.json()["access_token"]

@app.route("/transactions", methods=["GET"])
def get_transactions():
    try:
        response = requests.get(
            f"{BASE_URL}/customers/{CUSTOMER_ID}/transactions",
            headers=get_auth_header()
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/transactions", methods=["POST"])
def create_transaction():
    try:
        data = request.json
        data["accountId"] = ACCOUNT_ID
        
        response = requests.post(
            f"{BASE_URL}/customers/{CUSTOMER_ID}/transactions",
            headers={**get_auth_header(), "Content-Type": "application/json"},
            json=data
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/transactions/<transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    try:
        response = requests.put(
            f"{BASE_URL}/transactions/{transaction_id}",  # Verify actual endpoint
            headers={**get_auth_header(), "Content-Type": "application/json"},
            json=request.json
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/transactions/<transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    try:
        response = requests.delete(
            f"{BASE_URL}/transactions/{transaction_id}",  # Verify actual endpoint
            headers=get_auth_header()
        )
        return jsonify({"message": "Transaction deleted"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transactions/chat', methods=['POST'])
def transaction_chat():
    session_id = request.json.get('session_id')
    message = request.json.get('message')
    
    if not session_id or not message:
        return jsonify({"status": "error", "message": "Missing session_id or message"}), 400

    try:
        # Get or create assistant session
        if session_id not in finance_chat_sessions:
            finance_chat_sessions[session_id] = {
                'assistant': BankingDataAssistant(debug=True),
                'history': []
            }
            
        assistant = finance_chat_sessions[session_id]['assistant']
        response = assistant.chat(message)
        
        # Store interaction history
        finance_chat_sessions[session_id]['history'].append({
            'query': message,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            "status": "success",
            "message": response,
            "session_id": session_id
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Chat error: {str(e)}"
        }), 500

@app.route('/api/transactions/data', methods=['POST'])
@cross_origin()
def get_transaction_data():
    session_id = request.json.get('session_id')
    
    if not session_id:
        return jsonify({"status": "error", "message": "Missing session_id"}), 400

    try:
        # Initialize session if not exists
        if session_id not in finance_chat_sessions:
            print(f"Creating new transaction session: {session_id}")
            finance_chat_sessions[session_id] = {
                'assistant': BankingDataAssistant(),
                'history': []
            }
            
        assistant = finance_chat_sessions[session_id]['assistant']
        
        # Ensure data is fetched
        if not assistant.transaction_data or not assistant.account_data:
            print(f"Fetching data for session: {session_id}")
            assistant.fetch_all_data()
        
        # Create fallback data if fetch failed
        if not assistant.transaction_data:
            assistant.transaction_data = []
        if not assistant.account_data:
            assistant.account_data = {"data": [{"mainBalance": 0, "currency": "INR"}]}
            
        analysis = assistant.analyze_transactions()
        
        return jsonify({
            "status": "success",
            "data": {
                "transactions": assistant.transaction_data,
                "account": assistant.account_data,
                "analysis": analysis
            }
        })
        
    except Exception as e:
        print(f"Data retrieval error: {str(e)}")
        # Return minimal data structure to prevent frontend errors
        return jsonify({
            "status": "success",
            "data": {
                "transactions": [],
                "account": {"data": [{"mainBalance": 0, "currency": "INR"}]},
                "analysis": {
                    "total_transactions": 0,
                    "total_credits": 0,
                    "total_debits": 0,
                    "average_transaction": 0
                }
            }
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
