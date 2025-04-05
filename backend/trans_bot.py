import requests
import json
import os
from datetime import datetime, timedelta
import argparse
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import pandas as pd
import math # Added for ceiling function in chunking

# API Configuration
AUTH_URL = "https://api.mockbank.io/oauth/token"
CUSTOMER_ID = "52436e7d-c62e-4c85-9fab-4ba5108d0798"  # From your app.py
BASE_URL = "https://api.mockbank.io"

# Credentials - Keep these secure, consider environment variables or a config file
username = "ramaiah3316"
password = "12345678"
user_username = "1ms23cy027@msrit.edu"
user_password = "karteek**05U"

# LLM Configuration
LLM_API_KEY = "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" # Use your actual key
LLM_MODEL = "llama-3.2-90b-vision-preview" # Or choose another suitable model like llama3-70b-8192 if vision isn't needed and token limits are a concern
llm = ChatGroq(
    model=LLM_MODEL,
    temperature=0.4,
    max_tokens=None, # Let the model decide, but be mindful of limits
    timeout=None,
    max_retries=2,
    api_key=LLM_API_KEY
)

# Chunking Configuration
CHUNK_SIZE = 25  # Adjust based on typical transaction size and token limits

class BankingDataAssistant:
    def __init__(self):
        self.access_token = None
        self.transaction_data = None
        self.account_data = None
        self.personal_data = None
        self.last_analysis = None # Cache the analysis
        # Debug flag
        self.debug = True

    def debug_print(self, message, obj=None):
        """Helper for conditional debug printing"""
        if self.debug:
            print(f"[DEBUG] {message}")
            if obj is not None:
                if isinstance(obj, (dict, list)):
                    print(json.dumps(obj, indent=2, default=str))
                else:
                    print(obj)

    def get_access_token(self):
        """Retrieve access token using OAuth credentials"""
        auth_data = {
            "grant_type": "password",
            "username": user_username,
            "password": user_password
        }
        try:
            self.debug_print(f"Requesting access token from {AUTH_URL}")
            response = requests.post(
                AUTH_URL,
                auth=(username, password),
                data=auth_data
            )
            response.raise_for_status() # Raises HTTPError for bad responses (4xx or 5xx)
            self.access_token = response.json()["access_token"]
            self.debug_print("Access token received successfully")
            return self.access_token
        except requests.exceptions.RequestException as e:
            print(f"Authentication failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                self.debug_print("Error response:", e.response.text)
            raise Exception(f"Authentication failed: {e}") from e
        except KeyError:
            print(f"Authentication failed: 'access_token' not found in response.")
            raise Exception("Authentication failed: Malformed response from auth server.")


    def get_auth_header(self):
        """Get authorization header for API requests"""
        if not self.access_token:
            self.get_access_token()
        return {"Authorization": f"Bearer {self.access_token}"}

    def _make_api_request(self, url, params=None):
        """Helper function for making authenticated API requests."""
        try:
            self.debug_print(f"Making API request to: {url} with params: {params}")
            response = requests.get(
                url,
                headers=self.get_auth_header(),
                params=params
            )
            self.debug_print(f"Response status code: {response.status_code}")
            response.raise_for_status() # Check for HTTP errors
            data = response.json()
            self.debug_print(f"Response data received, length: {len(str(data))}")
            return data
        except requests.exceptions.RequestException as e:
            # Handle potential token expiry or other request issues
            if hasattr(e, 'response') and e.response is not None and e.response.status_code == 401:
                print("Access token might be expired or invalid. Attempting to refresh...")
                try:
                    self.access_token = None # Force token refresh
                    response = requests.get(
                        url,
                        headers=self.get_auth_header(),
                        params=params
                    )
                    response.raise_for_status()
                    return response.json()
                except Exception as retry_e:
                    print(f"Retry failed: {retry_e}")
                    if hasattr(retry_e, 'response') and retry_e.response is not None:
                        self.debug_print("Error response:", retry_e.response.text)
                    raise Exception(f"API request failed after retry: {retry_e}") from retry_e
            else:
                print(f"API request failed: {e}")
                if hasattr(e, 'response') and e.response is not None:
                    self.debug_print("Error response:", e.response.text)
                raise Exception(f"API request failed: {e}") from e
        except json.JSONDecodeError as jde:
            print(f"Failed to decode JSON response from {url}")
            self.debug_print("Raw response:", response.text if 'response' in locals() else "No response available")
            raise Exception(f"Invalid JSON response from API endpoint: {url}. Error: {jde}")


    def fetch_transactions(self, start_date=None, end_date=None, limit=100): # Increased limit slightly
        """Fetch transactions from the API"""
        if not start_date:
            start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        params = {"start_date": start_date, "end_date": end_date, "limit": limit}
        url = f"{BASE_URL}/customers/{CUSTOMER_ID}/transactions"

        try:
            # Make the API request
            self.debug_print(f"Fetching transactions from {start_date} to {end_date}, limit: {limit}")
            response_dict = self._make_api_request(url, params)
            self.debug_print("Raw Transaction API Response:", response_dict)

            # Handle empty response
            if not response_dict:
                print("Received empty response from transactions API")
                self.transaction_data = []
                return []

            # Try to load from sample data for testing if API fails
            if self.debug and (not response_dict or "transactions" not in response_dict):
                try:
                    self.debug_print("Attempting to load sample transaction data...")
                    if os.path.exists("sample_transactions.json"):
                        with open("sample_transactions.json", "r") as f:
                            sample_data = json.load(f)
                            if "transactions" in sample_data and isinstance(sample_data["transactions"], list):
                                self.debug_print("Loaded sample transactions successfully")
                                self.transaction_data = sample_data["transactions"]
                                return self.transaction_data
                except Exception as e:
                    self.debug_print(f"Failed to load sample data: {e}")

            # Try different keys - maybe the API response structure varies
            # First try the expected structure with "transactions" key
            if "transactions" in response_dict and isinstance(response_dict["transactions"], list):
                self.transaction_data = response_dict["transactions"]
                self.debug_print(f"Successfully extracted {len(self.transaction_data)} transactions from 'transactions' key.")
            # If not, check if the response itself is a list of transactions
            elif isinstance(response_dict, list) and len(response_dict) > 0 and isinstance(response_dict[0], dict):
                self.transaction_data = response_dict
                self.debug_print(f"Response is directly a list of {len(self.transaction_data)} transactions.")
            # Look for any key that might contain a list of transactions
            else:
                found = False
                for key, value in response_dict.items():
                    if isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
                        self.transaction_data = value
                        self.debug_print(f"Found transactions in key '{key}': {len(self.transaction_data)} items")
                        found = True
                        break
                
                if not found:
                    self.debug_print("Could not find transactions in any expected format")
                    self.transaction_data = []

            # Create sample data if needed for testing
            if self.debug and (not self.transaction_data or len(self.transaction_data) == 0):
                self.debug_print("Creating mock transaction data for testing...")
                # Generate some sample transactions
                self.transaction_data = [
                    {
                        "transactionId": f"tx-{i}",
                        "accountId": "account-123",
                        "transactionDate": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
                        "bookingDate": (datetime.now() - timedelta(days=i-1)).strftime("%Y-%m-%d"),
                        "amount": round((-1 if i % 3 == 0 else 1) * (100 + i * 10), 2),
                        "currency": "INR",
                        "description": f"Sample Transaction {i}",
                        "category": "Food" if i % 3 == 0 else "Transport" if i % 3 == 1 else "Shopping",
                        "type": "debit" if i % 3 == 0 else "credit",
                        "status": "completed"
                    } for i in range(1, 21)
                ]
                self.debug_print(f"Created {len(self.transaction_data)} sample transactions")
                # Save for future use
                try:
                    with open("sample_transactions.json", "w") as f:
                        json.dump({"transactions": self.transaction_data}, f, indent=2)
                        self.debug_print("Saved sample transactions to sample_transactions.json")
                except Exception as e:
                    self.debug_print(f"Failed to save sample data: {e}")

            # Final verification
            if not isinstance(self.transaction_data, list):
                self.debug_print(f"Transaction data is not a list but {type(self.transaction_data)}, setting to empty list")
                self.transaction_data = []

            return self.transaction_data
        except Exception as e:
            print(f"Error fetching or processing transactions: {e}")
            self.debug_print(f"Transaction fetch exception: {e}")
            # Create mock data for testing if debug is on
            if self.debug:
                self.debug_print("Creating mock transaction data after error...")
                self.transaction_data = [
                    {
                        "transactionId": f"tx-{i}",
                        "accountId": "account-123",
                        "transactionDate": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
                        "bookingDate": (datetime.now() - timedelta(days=i-1)).strftime("%Y-%m-%d"),
                        "amount": round((-1 if i % 3 == 0 else 1) * (100 + i * 10), 2),
                        "currency": "INR",
                        "description": f"Sample Transaction {i}",
                        "category": "Food" if i % 3 == 0 else "Transport" if i % 3 == 1 else "Shopping",
                        "type": "debit" if i % 3 == 0 else "credit",
                        "status": "completed"
                    } for i in range(1, 21)
                ]
                self.debug_print(f"Created {len(self.transaction_data)} mock transactions after error")
                return self.transaction_data
            else:
                self.transaction_data = [] # Ensure it's an empty list on error
                return None # Return None to indicate failure upstream if needed

    def fetch_account_details(self):
        """Fetch account details from the API"""
        url = f"{BASE_URL}/customers/{CUSTOMER_ID}/accounts"
        try:
            self.debug_print(f"Fetching account details from {url}")
            self.account_data = self._make_api_request(url)
            self.debug_print("Account data received", self.account_data)
            
            # Create sample data for testing if needed
            if self.debug and (not self.account_data or (isinstance(self.account_data, dict) and not self.account_data)):
                self.debug_print("Creating mock account data...")
                self.account_data = {
                    "accounts": [
                        {
                            "accountId": "account-123",
                            "accountName": "Primary Account",
                            "accountType": "CASH",
                            "iban": "IN3568250058046576",
                            "balance": 3865.12,
                            "availableBalance": 3865.12,
                            "currency": "INR",
                            "status": "ENABLED"
                        }
                    ]
                }
                self.debug_print("Mock account data created")
            
            return self.account_data
        except Exception as e:
            print(f"Error fetching account details: {e}")
            self.debug_print(f"Account fetch exception: {e}")
            
            # Create mock data for testing if debug is on
            if self.debug:
                self.debug_print("Creating mock account data after error...")
                self.account_data = {
                    "accounts": [
                        {
                            "accountId": "account-123",
                            "accountName": "Primary Account",
                            "accountType": "CASH",
                            "iban": "IN3568250058046576",
                            "balance": 3865.12,
                            "availableBalance": 3865.12,
                            "currency": "INR",
                            "status": "ENABLED"
                        }
                    ]
                }
                self.debug_print("Mock account data created after error")
                return self.account_data
            else:
                self.account_data = None
                return None

    def fetch_personal_info(self):
        """Fetch personal information from the API"""
        url = f"{BASE_URL}/customers/{CUSTOMER_ID}"
        try:
            self.debug_print(f"Fetching personal info from {url}")
            self.personal_data = self._make_api_request(url)
            self.debug_print("Personal data received", self.personal_data)
            
            # Create sample data for testing if needed
            if self.debug and (not self.personal_data or (isinstance(self.personal_data, dict) and not self.personal_data)):
                self.debug_print("Creating mock personal data...")
                self.personal_data = {
                    "customerId": CUSTOMER_ID,
                    "username": "rahul.sharma@example.com",
                    "fullName": "Rahul Sharma",
                    "countryCode": "IN",
                    "address": "MG Road, Bangalore",
                    "zipCode": "560001",
                    "city": "Bangalore",
                    "phoneNumber": "+919876543210"
                }
                self.debug_print("Mock personal data created")
            
            return self.personal_data
        except Exception as e:
            print(f"Error fetching personal information: {e}")
            self.debug_print(f"Personal info fetch exception: {e}")
            
            # Create mock data for testing if debug is on
            if self.debug:
                self.debug_print("Creating mock personal data after error...")
                self.personal_data = {
                    "customerId": CUSTOMER_ID,
                    "username": "rahul.sharma@example.com",
                    "fullName": "Rahul Sharma",
                    "countryCode": "IN",
                    "address": "MG Road, Bangalore",
                    "zipCode": "560001",
                    "city": "Bangalore",
                    "phoneNumber": "+919876543210"
                }
                self.debug_print("Mock personal data created after error")
                return self.personal_data
            else:
                self.personal_data = None
                return None

    def fetch_all_data(self):
        """Fetch all available data from the API"""
        print("Fetching personal info...")
        self.fetch_personal_info()
        print("Fetching account details...")
        self.fetch_account_details()
        print("Fetching transactions...")
        self.fetch_transactions() # Fetch default range/limit first

        # Save data to JSON files for reference
        self.save_to_json(self.personal_data, "personal_info.json")
        self.save_to_json(self.account_data, "account_details.json")
        self.save_to_json(self.transaction_data, "transactions.json")

        return {
            "transactions": self.transaction_data,
            "accounts": self.account_data,
            "personal": self.personal_data
        }

    def save_to_json(self, data, filename):
        """Save data to a JSON file"""
        if data is not None: # Check if data exists before saving
            try:
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=4, default=str)
                print(f"Data saved to {filename}")
            except IOError as e:
                print(f"Error saving data to {filename}: {e}")
        else:
            print(f"No data to save for {filename}.")

    def analyze_transactions(self):
        """Analyze transaction data to provide insights. Caches the result."""
        if self.last_analysis:
            self.debug_print("Returning cached analysis")
            return self.last_analysis

        if not self.transaction_data:
            print("Attempting to fetch transactions for analysis...")
            self.fetch_transactions()

        self.debug_print(f"Starting transaction analysis with {len(self.transaction_data) if isinstance(self.transaction_data, list) else 'None'} transactions")

        if not self.transaction_data or not isinstance(self.transaction_data, list) or len(self.transaction_data) == 0:
            self.debug_print("No transaction data available for analysis")
            self.last_analysis = {"error": "No transaction data available to analyze."}
            return self.last_analysis

        try:
            # Ensure data is suitable for DataFrame (list of dicts)
            if not all(isinstance(item, dict) for item in self.transaction_data):
                 raise ValueError("Transaction data is not a list of dictionaries.")
            
            self.debug_print(f"Creating DataFrame from {len(self.transaction_data)} transactions")
            df = pd.DataFrame(self.transaction_data)
            self.debug_print(f"DataFrame columns: {df.columns.tolist()}")

            # --- Data Cleaning and Type Conversion ---
            if 'transactionDate' in df.columns:
                self.debug_print("Converting transactionDate to datetime")
                df['transactionDate'] = pd.to_datetime(df['transactionDate'], errors='coerce')
                # Drop rows where date conversion failed
                bad_dates = df['transactionDate'].isna().sum()
                if bad_dates > 0:
                    self.debug_print(f"Dropping {bad_dates} rows with invalid dates")
                df.dropna(subset=['transactionDate'], inplace=True)
            elif 'date' in df.columns:
                self.debug_print("Converting 'date' column to datetime")
                df['transactionDate'] = pd.to_datetime(df['date'], errors='coerce') 
                df.dropna(subset=['transactionDate'], inplace=True)
            else:
                self.debug_print("No transaction date column found")
            
            if 'amount' in df.columns:
                self.debug_print("Converting amount to numeric")
                df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
                bad_amounts = df['amount'].isna().sum()
                if bad_amounts > 0:
                    self.debug_print(f"Found {bad_amounts} rows with invalid amounts")
            
            # Standardize 'type' column if it exists (e.g., lowercase)
            if 'type' in df.columns:
                 self.debug_print("Standardizing transaction type column")
                 df['type'] = df['type'].astype(str).str.lower()

            # --- Basic Analysis ---
            self.debug_print("Performing basic analysis")
            analysis = {
                "total_transactions": len(df),
                "date_range": {
                    "from": df['transactionDate'].min().strftime('%Y-%m-%d') if 'transactionDate' in df.columns and not df.empty else "N/A",
                    "to": df['transactionDate'].max().strftime('%Y-%m-%d') if 'transactionDate' in df.columns and not df.empty else "N/A"
                }
            }

            # --- Analysis by Transaction Type ---
            if 'type' in df.columns:
                self.debug_print("Analyzing by transaction type")
                type_counts = df['type'].value_counts().to_dict()
                analysis["transaction_types"] = type_counts

            # --- Amount Analysis ---
            if 'amount' in df.columns and pd.api.types.is_numeric_dtype(df['amount']):
                self.debug_print("Analyzing transaction amounts")
                # Filter out potential NaN amounts before aggregation
                valid_amounts = df['amount'].dropna()
                if not valid_amounts.empty:
                    analysis["amount_stats"] = {
                        "total_value": round(valid_amounts.sum(), 2),
                        "average": round(valid_amounts.mean(), 2),
                        "min": round(valid_amounts.min(), 2),
                        "max": round(valid_amounts.max(), 2)
                    }

                    # --- Debits vs Credits ---
                    # Define what constitutes credit/debit based on 'type' column
                    if 'type' in df.columns:
                        self.debug_print("Analyzing credits and debits")
                        credits_df = df[df['type'] == 'credit']['amount'].dropna()
                        debits_df = df[df['type'] == 'debit']['amount'].dropna() # Assuming debits are positive numbers

                        credits_total = round(credits_df.sum(), 2) if not credits_df.empty else 0
                        debits_total = round(debits_df.sum(), 2) if not debits_df.empty else 0 # Sum of positive debit amounts

                        analysis["credits_total"] = credits_total
                        analysis["debits_total"] = debits_total
                        analysis["net_cashflow"] = round(credits_total - debits_total, 2)
                    else:
                         analysis["credits_total"] = "N/A (type column missing)"
                         analysis["debits_total"] = "N/A (type column missing)"
                         analysis["net_cashflow"] = "N/A (type column missing)"
                else:
                     analysis["amount_stats"] = "No valid numeric amounts found."
                     analysis["credits_total"] = 0
                     analysis["debits_total"] = 0
                     analysis["net_cashflow"] = 0
            else:
                analysis["amount_stats"] = "N/A (amount column missing or not numeric)"
                analysis["credits_total"] = "N/A"
                analysis["debits_total"] = "N/A"
                analysis["net_cashflow"] = "N/A"

            self.debug_print("Analysis complete:", analysis)
            self.last_analysis = analysis
            return analysis

        except Exception as e:
            print(f"Error during transaction analysis: {e}")
            self.debug_print(f"Analysis error: {e}")
            self.last_analysis = {"error": f"Analysis failed: {e}"}
            return self.last_analysis


    def get_account_balance(self):
        """Get current account balance(s)"""
        if not self.account_data:
            print("Attempting to fetch account details for balance...")
            self.fetch_account_details()

        if not self.account_data:
            self.debug_print("No account data available for balance check")
            return {"error": "Unable to retrieve account balance due to missing account data."}

        try:
            self.debug_print("Processing account data for balance", self.account_data)
            balances = []
            if isinstance(self.account_data, list):
                # Multiple accounts
                for account in self.account_data:
                    if isinstance(account, dict):
                         acc_info = {
                            "account_id": account.get('accountId', 'N/A'),
                            "account_type": account.get('accountType', 'N/A'),
                            "balance": account.get('balance', 'N/A'),
                            "currency": account.get('currency', 'N/A')
                         }
                         balances.append(acc_info)
                    else:
                         balances.append({"error": "Invalid account item format found in list."})
                return balances if balances else {"info": "No account details found in the list."}

            elif isinstance(self.account_data, dict):
                 # Single account or maybe a wrapper dict
                 if 'balance' in self.account_data: # Direct balance info
                      return {
                          "account_id": self.account_data.get('accountId', 'N/A'),
                          "account_type": self.account_data.get('accountType', 'N/A'),
                          "balance": self.account_data.get('balance', 'N/A'),
                          "currency": self.account_data.get('currency', 'N/A')
                      }
                 # Check if it's a dict containing a list of accounts (e.g., {"accounts": [...]})
                 elif 'accounts' in self.account_data and isinstance(self.account_data['accounts'], list):
                      for account in self.account_data['accounts']:
                           if isinstance(account, dict):
                               acc_info = {
                                   "account_id": account.get('accountId', 'N/A'),
                                   "account_type": account.get('accountType', 'N/A'),
                                   "balance": account.get('balance', 'N/A'),
                                   "currency": account.get('currency', 'N/A')
                               }
                               balances.append(acc_info)
                           else:
                               balances.append({"error": "Invalid account item format found in nested list."})
                      return balances if balances else {"info": "No account details found in the nested list."}
                 else:
                      return {"error": "Account balance information not found in the expected format within the dictionary."}
            else:
                return {"error": f"Account data is in an unexpected format: {type(self.account_data)}"}
        except Exception as e:
            print(f"Error extracting account balance: {e}")
            self.debug_print(f"Balance extraction error: {e}")
            return {"error": f"Error retrieving account balance: {e}"}


    # --- Helper Functions for Chunking ---

    def _chunk_data(self, data, chunk_size):
        """Splits a list into chunks of specified size."""
        if not isinstance(data, list):
             self.debug_print(f"Warning: Data provided to _chunk_data is not a list but {type(data)}. Returning as is.")
             return [data] # Return as a single chunk if not a list
        if chunk_size <= 0:
             return [data] # Return the whole list if chunk size is invalid

        num_chunks = math.ceil(len(data) / chunk_size)
        chunks = [data[i * chunk_size:(i + 1) * chunk_size] for i in range(num_chunks)]
        self.debug_print(f"Split data into {len(chunks)} chunks of size ~{chunk_size}")
        return chunks

    def _summarize_analysis(self, analysis_data):
        """Creates a brief summary of the transaction analysis."""
        if not analysis_data or isinstance(analysis_data.get("error"), str):
            self.debug_print("Analysis not available for summary")
            return {"summary": "Analysis not available or failed."}

        summary = {
            "total_transactions": analysis_data.get("total_transactions", "N/A"),
            "date_range": analysis_data.get("date_range", "N/A"),
            "net_cashflow": analysis_data.get("net_cashflow", "N/A"),
            "total_credits": analysis_data.get("credits_total", "N/A"),
            "total_debits": analysis_data.get("debits_total", "N/A"),
            # Add other key stats if needed
        }
        self.debug_print("Analysis summary created", summary)
        return summary

    def _synthesize_results(self, original_query, partial_responses):
        """Combines partial LLM responses into a final answer using another LLM call."""
        print("Synthesizing final answer from partial responses...")
        self.debug_print(f"Synthesizing {len(partial_responses)} partial responses")

        valid_responses = [resp for resp in partial_responses if resp] # Filter out None/failed responses
        if not valid_responses:
            return "I couldn't gather enough information from your transactions to answer the question. There might have been issues retrieving or analyzing the data."

        # Prepare context for the synthesis call
        synthesis_context = f"""
        The user asked the following original question:
        "{original_query}"

        I analyzed the user's transaction data in chunks. Here are the findings from each chunk:
        --- Start of Partial Findings ---
        """
        for i, resp in enumerate(valid_responses):
            synthesis_context += f"\nChunk {i+1} Findings:\n{resp}\n---\n"
        synthesis_context += "--- End of Partial Findings ---"

        synthesis_prompt = f"""
        {synthesis_context}

        Based *only* on the partial findings provided above, synthesize a single, comprehensive, and accurate final answer to the user's original question: "{original_query}".

        Combine information where appropriate (e.g., summing up totals mentioned in different chunks).
        Avoid repeating information unless necessary for clarity.
        If the partial findings are contradictory or insufficient to fully answer the original question, state that clearly.
        Maintain a helpful and professional tone.
        """
        
        self.debug_print("Synthesis prompt:", synthesis_prompt)

        try:
            messages = [
                # System message guides the synthesis process
                SystemMessage(content="You are an AI assistant responsible for synthesizing a final answer from partial analyses of banking data chunks."),
                HumanMessage(content=synthesis_prompt)
            ]
            synthesis_response = llm.invoke(messages)
            self.debug_print("Synthesis response received")
            return synthesis_response.content
        except Exception as e:
            print(f"Error during synthesis LLM call: {e}")
            self.debug_print(f"Synthesis error: {e}")
            # Fallback: Return concatenated results (less ideal)
            fallback_response = "I processed your request in parts. Here's a summary of the findings:\n" + "\n".join(valid_responses)
            return fallback_response + f"\n\n(Note: There was an issue combining these results fully due to an error: {e})"


    # --- Main Chat Function with Chunking ---

    def _determine_query_context(self, user_input):
        """Determine which data sources are relevant for the query"""
        user_input = user_input.lower()
        context = {
            'personal': False,
            'account': False,
            'transactions': False
        }
        
        # Personal info triggers
        personal_keywords = ['name', 'address', 'phone', 'city', 'zip code', 'personal']
        if any(kw in user_input for kw in personal_keywords):
            context['personal'] = True
            
        # Account balance triggers
        account_keywords = ['balance', 'account', 'iban', 'limit', 'available']
        if any(kw in user_input for kw in account_keywords):
            context['account'] = True
            
        # Transaction triggers
        transaction_keywords = ['spent', 'spend', 'transaction', 'payment', 'purchase']
        if any(kw in user_input for kw in transaction_keywords):
            context['transactions'] = True
            
        # If no clear context, use all sources
        if not any(context.values()):
            return {'personal': True, 'account': True, 'transactions': True}
            
        return context

    def chat(self, user_input):
        """Process user input with enhanced context handling"""
        # Refresh data if needed
        if not all([self.transaction_data, self.account_data, self.personal_data]):
            self.fetch_all_data()

        # Determine query context
        context = self._determine_query_context(user_input)
        self.debug_print("Query context", context)

        # Handle personal info queries
        if context['personal'] and not context['account'] and not context['transactions']:
            system_prompt = f"""You are a banking assistant answering personal information questions.
            
            FULL PERSONAL DATA:
            {json.dumps(self.personal_data, indent=2)}
            
            Only answer questions using this verified data. If asked for sensitive information, politely decline."""
            messages = [SystemMessage(content=system_prompt), HumanMessage(content=user_input)]
            return llm.invoke(messages).content

        # Handle account balance queries
        if context['account'] and not context['transactions']:
            system_prompt = f"""You are a banking assistant answering account-related questions.
            
            ACCOUNT DETAILS:
            {json.dumps(self.account_data, indent=2)}
            
            Provide exact balances and account status from this data. Flag any discrepancies."""
            messages = [SystemMessage(content=system_prompt), HumanMessage(content=user_input)]
            return llm.invoke(messages).content

        # Transaction-heavy queries with enhanced chunking
        CHUNK_SIZE = 15  # Reduced chunk size for better accuracy
        transaction_chunks = self._chunk_data(self.transaction_data, CHUNK_SIZE)
        
        # Process chunks with retries and detailed context
        partial_responses = []
        for chunk_idx, chunk in enumerate(transaction_chunks):
            try:
                chunk_context = {
                    "chunk_number": chunk_idx + 1,
                    "total_chunks": len(transaction_chunks),
                    "account_summary": self.get_account_balance(),
                    "personal_context": {
                        "name": self.personal_data.get('fullName'),
                        "location": self.personal_data.get('city')
                    },
                    "transactions": chunk
                }

                system_prompt = f"""Analyze transactions with full context:
                
                1. Account Status: {chunk_context['account_summary']}
                2. Customer: {chunk_context['personal_context']['name']} in {chunk_context['personal_context']['location']}
                3. Transactions ({len(chunk)} of {len(self.transaction_data)} total):
                {json.dumps(chunk, indent=2)}
                
                Provide detailed analysis of amounts, dates, and patterns. Include exact numbers."""
                
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"{user_input} (Chunk {chunk_idx+1}/{len(transaction_chunks)})")
                ]
                
                # Process with retry and timeout
                response = self._process_chunk_with_retry(messages)
                partial_responses.append(response)
                
            except Exception as e:
                print(f"Error processing chunk {chunk_idx+1}: {e}")
                partial_responses.append(f"Partial analysis unavailable for chunk {chunk_idx+1}")

        return self._synthesize_results(user_input, partial_responses)

    def _process_chunk_with_retry(self, messages, retries=3):
        """Process a chunk with retries and size reduction"""
        try:
            return llm.invoke(messages).content
        except Exception as e:
            if "too large" in str(e).lower() and retries > 0:
                # Reduce context size and retry
                reduced_content = "\n".join(messages[0].content.split("\n")[:10])
                messages[0].content = reduced_content + "\n[Context truncated due to size constraints]"
                return self._process_chunk_with_retry(messages, retries-1)
            raise

def main():
    """Main entry point for the banking data assistant"""
    parser = argparse.ArgumentParser(description="Banking Data Assistant CLI")
    parser.add_argument("--fetch", action="store_true", help="Fetch all banking data")
    parser.add_argument("--chat", action="store_true", help="Start interactive chat")
    parser.add_argument("--analyze", action="store_true", help="Run transaction analysis")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    
    args = parser.parse_args()
    
    assistant = BankingDataAssistant()
    
    if args.fetch:
        print("Fetching banking data...")
        try:
            data = assistant.fetch_all_data()
            print("Data fetched successfully!")
        except Exception as e:
            print(f"Error fetching data: {e}")
    
    if args.chat:
        print("Welcome to Banking Data Assistant!")
        print("I can answer questions about your transactions, account details, and personal banking information.")
        print("Type 'exit' to end the conversation.\n")
        
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() == 'exit':
                print("Thank you for using Banking Data Assistant. Goodbye!")
                break
            
            response = assistant.chat(user_input)
            print(f"\nAssistant: {response}")
    
    if args.analyze:
        print("Analyzing transactions...")
        analysis = assistant.analyze_transactions()
        print(json.dumps(analysis, indent=2))
    
    # If no arguments provided, show help
    if not (args.fetch or args.chat or args.analyze):
        parser.print_help()

if __name__ == "__main__":
    main()