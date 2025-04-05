

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


