import json
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from langchain_core.tools import tool
import requests
from datetime import datetime, timedelta
import os

# LLM Configuration
llm = ChatGroq(
    model="llama-3.2-90b-vision-preview",
    temperature=0.4,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key="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"
)

extractionLLM = ChatGroq(
    model="llama-3.2-90b-vision-preview",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key="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"
)

memory = MemorySaver()

# MockBank API Configuration
BASE_URL = "https://api.mockbank.io"
CLIENT_CREDENTIALS = ('ramaiah3316','12345678')

# Assuming these are stored securely in configuration
with open("config.json") as f:
    config = json.load(f)
    CUSTOMER_ID = config["customer_id"]
    ACCOUNT_ID = config["account_id"]

def get_auth_header():
    """Get authentication header for MockBank API"""
    token = get_access_token()
    return {"Authorization": f"Bearer {token}"}

def get_access_token():
    """Get access token from MockBank API"""
    auth = requests.auth.HTTPBasicAuth(*CLIENT_CREDENTIALS)
    data = {
        "grant_type": "password",
        "username": "1ms23cy027@msrit.edu",
        "password": "karteek**05U"
    }
    response = requests.post(f"{BASE_URL}/oauth/token", auth=auth, data=data)
    return response.json()["access_token"]

@tool
def get_transactions(start_date: str = None, end_date: str = None, limit: int = 50) -> dict:
    """
    Get recent transactions from the user's account with optional date filters.
    
    Args:
        start_date: Start date in 'YYYY-MM-DD' format (optional)
        end_date: End date in 'YYYY-MM-DD' format (optional)
        limit: Maximum number of transactions to retrieve (default: 50)
        
    Returns:
        List of transaction data
    """
    # Default to last 30 days if no dates provided
    if not end_date:
        end_date = datetime.now().strftime('%Y-%m-%d')
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    try:
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "limit": limit
        }
        
        response = requests.get(
            f"{BASE_URL}/customers/{CUSTOMER_ID}/transactions",
            headers=get_auth_header(),
            params=params
        )
        
        if response.status_code == 200:
            transactions = response.json()
            # Convert amounts from paise to rupees for better readability
            for tx in transactions:
                if "amount" in tx:
                    tx["amount_inr"] = tx["amount"] / 100
            return {"transactions": transactions, "count": len(transactions)}
        else:
            return {"error": f"Failed to retrieve transactions: {response.status_code}", "transactions": []}
    except Exception as e:
        return {"error": str(e), "transactions": []}

@tool
def analyze_spending(period: str = "month") -> dict:
    """
    Analyze spending patterns across different categories.
    
    Args:
        period: Time period for analysis - 'week', 'month', 'quarter', or 'year'
        
    Returns:
        Spending analysis by category
    """
    # Map period to days
    period_days = {
        "week": 7,
        "month": 30,
        "quarter": 90,
        "year": 365
    }
    days = period_days.get(period.lower(), 30)
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    
    try:
        # Get transactions for the specified period
        transactions_response = get_transactions(start_date, end_date, 500)
        if "error" in transactions_response:
            return {"error": transactions_response["error"]}
        
        transactions = transactions_response["transactions"]
        
        # Initialize categories
        categories = {
            "groceries": 0,
            "dining": 0,
            "transport": 0,
            "rent": 0,
            "utilities": 0,
            "entertainment": 0,
            "shopping": 0,
            "health": 0,
            "education": 0,
            "other": 0
        }
        
        # Categorize transactions based on description
        total_expense = 0
        total_income = 0
        for tx in transactions:
            amount = tx.get("amount", 0) / 100  # Convert paise to rupees
            description = tx.get("remittanceInformationUnstructured", "").lower()
            
            # Income vs Expense
            if amount > 0:
                total_income += amount
                continue
                
            # Expense (amount is negative)
            expense = abs(amount)
            total_expense += expense
            
            # Categorize based on description
            if any(keyword in description for keyword in ["grocery", "groceries", "bigbasket", "d-mart"]):
                categories["groceries"] += expense
            elif any(keyword in description for keyword in ["restaurant", "dining", "swiggy", "zomato", "food"]):
                categories["dining"] += expense
            elif any(keyword in description for keyword in ["uber", "ola", "transport", "metro", "bus", "train", "cab"]):
                categories["transport"] += expense
            elif any(keyword in description for keyword in ["rent", "landlord", "housing"]):
                categories["rent"] += expense
            elif any(keyword in description for keyword in ["electricity", "water", "gas", "internet", "phone", "bill"]):
                categories["utilities"] += expense
            elif any(keyword in description for keyword in ["movie", "netflix", "amazon", "entertainment"]):
                categories["entertainment"] += expense
            elif any(keyword in description for keyword in ["shopping", "amazon", "flipkart", "clothes"]):
                categories["shopping"] += expense
            elif any(keyword in description for keyword in ["doctor", "hospital", "medical", "pharmacy", "health"]):
                categories["health"] += expense
            elif any(keyword in description for keyword in ["school", "college", "tuition", "course", "education"]):
                categories["education"] += expense
            else:
                categories["other"] += expense
        
        # Round to 2 decimal places for readability
        for category in categories:
            categories[category] = round(categories[category], 2)
        
        return {
            "period": period,
            "date_range": f"{start_date} to {end_date}",
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "net_cashflow": round(total_income - total_expense, 2),
            "categories": categories,
            "transaction_count": len(transactions)
        }
    except Exception as e:
        return {"error": str(e)}

@tool
def get_account_balance() -> dict:
    """
    Get the current balance of the user's account.
    
    Returns:
        Account balance information
    """
    try:
        response = requests.get(
            f"{BASE_URL}/customers/{CUSTOMER_ID}/accounts/{ACCOUNT_ID}",
            headers=get_auth_header()
        )
        
        if response.status_code == 200:
            account_info = response.json()
            # Convert from paise to rupees if needed
            balance = account_info.get("balance", 0)
            return {
                "balance": balance / 100,
                "currency": account_info.get("currency", "INR"),
                "account_type": account_info.get("type", ""),
                "account_name": account_info.get("name", "Primary Account")
            }
        else:
            return {"error": f"Failed to retrieve account information: {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

@tool
def get_personal_info() -> dict:
    """
    Get personal information about the account holder.
    
    Returns:
        Customer profile information
    """
    try:
        response = requests.get(
            f"{BASE_URL}/customers/{CUSTOMER_ID}",
            headers=get_auth_header()
        )
        
        if response.status_code == 200:
            customer_info = response.json()
            return {
                "name": customer_info.get("fullName", "Rahul Sharma"),
                "address": customer_info.get("address", "MG Road, Bangalore"),
                "city": customer_info.get("city", "Bangalore"),
                "zip": customer_info.get("zip", "560001"),
                "country": customer_info.get("countryCode", "IN"),
                "phone": customer_info.get("msisdn", "+919876543210"),
                "email": customer_info.get("username", "rahul.sharma@example.com")
            }
        else:
            # Fallback to default profile since this might be a mock environment
            return {
                "name": "Rahul Sharma",
                "address": "MG Road, Bangalore",
                "city": "Bangalore",
                "zip": "560001", 
                "country": "IN",
                "phone": "+919876543210",
                "email": "rahul.sharma@example.com"
            }
    except Exception as e:
        # Fallback to default profile in case of errors
        return {
            "name": "Rahul Sharma",
            "address": "MG Road, Bangalore",
            "city": "Bangalore",
            "zip": "560001", 
            "country": "IN",
            "phone": "+919876543210",
            "email": "rahul.sharma@example.com"
        }

@tool
def get_spending_insights(category: str = None) -> dict:
    """
    Get spending insights for a specific category or overall spending.
    
    Args:
        category: Specific spending category to analyze (optional)
        
    Returns:
        Spending insights and trends
    """
    # Get current month spending
    current_month = datetime.now().strftime('%Y-%m')
    current_month_start = f"{current_month}-01"
    current_month_end = datetime.now().strftime('%Y-%m-%d')
    
    # Get previous month spending
    prev_month = (datetime.now().replace(day=1) - timedelta(days=1)).strftime('%Y-%m')
    prev_month_start = f"{prev_month}-01"
    prev_month_end = f"{prev_month}-{(datetime.now().replace(day=1) - timedelta(days=1)).day}"
    
    try:
        # Get current month analysis
        current_analysis = analyze_spending("month")
        
        # Get transactions from previous month for comparison
        transactions_response = get_transactions(prev_month_start, prev_month_end, 500)
        transactions = transactions_response.get("transactions", [])
        
        # Calculate category-specific insights
        if category:
            category = category.lower()
            current_spending = current_analysis.get("categories", {}).get(category, 0)
            
            # Calculate previous month's spending in this category
            prev_spending = 0
            for tx in transactions:
                if category in tx.get("remittanceInformationUnstructured", "").lower():
                    amount = abs(tx.get("amount", 0) / 100)  # Convert paise to rupees
                    if tx.get("amount", 0) < 0:  # Only count expenses
                        prev_spending += amount
            
            # Calculate change percentage
            if prev_spending > 0:
                change_pct = ((current_spending - prev_spending) / prev_spending) * 100
            else:
                change_pct = 100 if current_spending > 0 else 0
                
            return {
                "category": category,
                "current_month_spending": round(current_spending, 2),
                "previous_month_spending": round(prev_spending, 2),
                "change_percentage": round(change_pct, 2),
                "trend": "up" if change_pct > 0 else "down" if change_pct < 0 else "unchanged",
                "period": f"{current_month_start} to {current_month_end}"
            }
        else:
            # Calculate overall spending change
            current_expense = current_analysis.get("total_expense", 0)
            
            # Calculate previous month's total expense
            prev_expense = 0
            for tx in transactions:
                amount = tx.get("amount", 0) / 100  # Convert paise to rupees
                if amount < 0:  # Only count expenses
                    prev_expense += abs(amount)
            
            # Calculate change percentage
            if prev_expense > 0:
                change_pct = ((current_expense - prev_expense) / prev_expense) * 100
            else:
                change_pct = 100 if current_expense > 0 else 0
            
            # Get top spending categories
            categories = current_analysis.get("categories", {})
            sorted_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)
            top_categories = [{"category": cat, "amount": amt} for cat, amt in sorted_categories[:3]]
            
            return {
                "current_month_expense": round(current_expense, 2),
                "previous_month_expense": round(prev_expense, 2),
                "change_percentage": round(change_pct, 2),
                "trend": "up" if change_pct > 0 else "down" if change_pct < 0 else "unchanged",
                "top_spending_categories": top_categories,
                "period": f"{current_month_start} to {current_month_end}"
            }
    except Exception as e:
        return {"error": str(e)}

@tool
def get_finance_advice(concern: str) -> dict:
    """
    Get personalized financial advice based on transaction history and specified concerns.
    
    Args:
        concern: Financial concern area (budgeting, saving, investing, debt)
        
    Returns:
        Personalized financial advice based on transaction data
    """
    try:
        # Get spending analysis
        analysis = analyze_spending("month")
        balance_info = get_account_balance()
        
        # Default advice if specific concern not recognized
        default_advice = {
            "general": [
                "Track your expenses regularly",
                "Build an emergency fund",
                "Pay off high-interest debt first",
                "Save at least 20% of your income",
                "Review your financial goals quarterly"
            ]
        }
        
        # Generate specific advice based on transaction analysis and concern
        concern = concern.lower()
        advice = {
            "concern": concern,
            "recommendations": [],
            "context": {}
        }
        
        # Add relevant context based on transaction analysis
        advice["context"]["monthly_income"] = analysis.get("total_income", 0)
        advice["context"]["monthly_expense"] = analysis.get("total_expense", 0)
        advice["context"]["current_balance"] = balance_info.get("balance", 0)
        
        if concern == "budgeting":
            # Calculate spending ratio
            total_income = analysis.get("total_income", 0)
            total_expense = analysis.get("total_expense", 0)
            if total_income > 0:
                expense_ratio = (total_expense / total_income) * 100
                advice["context"]["expense_ratio"] = round(expense_ratio, 2)
                
                recommendations = []
                if expense_ratio > 80:
                    recommendations.append("Your expenses are high relative to income. Consider reducing non-essential spending.")
                
                # Check category-specific advice
                categories = analysis.get("categories", {})
                for category, amount in categories.items():
                    if total_expense > 0:
                        category_pct = (amount / total_expense) * 100
                        if category_pct > 30 and category not in ["rent"]:
                            recommendations.append(f"Your {category} expenses are {round(category_pct, 1)}% of total spending. Consider ways to reduce this category.")
                
                recommendations.extend([
                    "Create a 50/30/20 budget: 50% for needs, 30% for wants, and 20% for savings",
                    "Track all expenses with a budgeting app",
                    "Review and adjust your budget monthly"
                ])
                
                advice["recommendations"] = recommendations
                
        elif concern == "saving":
            # Calculate savings rate
            total_income = analysis.get("total_income", 0)
            total_expense = analysis.get("total_expense", 0)
            if total_income > 0:
                savings_rate = ((total_income - total_expense) / total_income) * 100
                advice["context"]["savings_rate"] = round(savings_rate, 2)
                
                recommendations = []
                if savings_rate < 20:
                    recommendations.append("Your current savings rate is below the recommended 20%. Consider increasing your savings.")
                
                recommendations.extend([
                    "Set up automatic transfers to a savings account",
                    "Look for high-yield savings accounts or fixed deposits",
                    "Build an emergency fund of 3-6 months of expenses",
                    "Use the 30-day rule for non-essential purchases"
                ])
                
                advice["recommendations"] = recommendations
                
        elif concern == "investing":
            recommendations = [
                "Consider mutual funds for long-term goals",
                "Look into index funds for passive investing",
                "Diversify investments across asset classes",
                "Start with small SIPs (Systematic Investment Plans)",
                "Consider tax-saving investment options like ELSS"
            ]
            advice["recommendations"] = recommendations
            
        elif concern == "debt":
            recommendations = [
                "Prioritize paying off high-interest debt first",
                "Consider debt consolidation for multiple loans",
                "Maintain a good credit score by paying bills on time",
                "Avoid taking on new debt until existing debt is managed",
                "Consider the debt snowball method for psychological wins"
            ]
            advice["recommendations"] = recommendations
            
        else:
            advice["recommendations"] = default_advice["general"]
            
        return advice
    except Exception as e:
        return {"error": str(e), "recommendations": default_advice["general"]}

# Combine all tools
tools = [
    get_transactions,
    analyze_spending,
    get_account_balance,
    get_personal_info,
    get_spending_insights,
    get_finance_advice
]

def extract_financial_concerns(content, msg):
    prompt = f"""
    Extract financial information and concerns from the following conversation:
    {content}
    Last message from the user: {msg}

    IMPORTANT: Always return a COMPLETE, VALID JSON with these exact keys:
    {{
        "primary_concern": "",
        "financial_situation": "",
        "financial_goals": [],
        "assistance_needed": "",
        "urgency_level": "",
        "recommended_strategies": [],
        "follow_up_topics": [],
        "resources_relevant": [],
        "transaction_related": false,
        "category_of_interest": "",
        "date_range_mentioned": "",
        "personal_info_requested": false
    }}
    """
    
    response = extractionLLM.invoke(prompt)
    
    try:
        extracted_info = json.loads(response.content)
    except json.JSONDecodeError:
        try:
            json_start = response.content.index('{')
            json_end = response.content.rindex('}') + 1
            json_str = response.content[json_start:json_end]
            extracted_info = json.loads(json_str)
        except (ValueError, json.JSONDecodeError):
            extracted_info = {
                "primary_concern": "",
                "financial_situation": "",
                "financial_goals": [],
                "assistance_needed": "",
                "urgency_level": "",
                "recommended_strategies": [],
                "follow_up_topics": [],
                "resources_relevant": [],
                "transaction_related": False,
                "category_of_interest": "",
                "date_range_mentioned": "",
                "personal_info_requested": False
            }
    
    return extracted_info

def print_stream(graph, inputs, config):
    msg = ""
    toolCall = {}
    for s in graph.stream(inputs, config, stream_mode="values"):
        message = s["messages"][-1]
        
        if message.type == "ai":
            msg += message.content
        elif message.type == "tool":
            try:
                toolCall = json.loads(message.content)
            except json.JSONDecodeError:
                toolCall = {}
        
    if not msg:
        msg = "I'm here to help with your financial questions and transaction analysis. What would you like to know about your finances today?"
    return {"msg": msg, "toolCall": toolCall}

def ChatModel(id, msg, messages):
    try:
        config = {"configurable": {"thread_id": id}}
        inputs = {"messages": [("user", msg)]}
        response = print_stream(graph, inputs, config)

        messages.append({"send": "user", "content": msg, "toolCall": {}, "options": []})
        messages.append({"send": "bot", "content": response["msg"], "toolCall": {}, "options": []})

        extraction = extract_financial_concerns(messages, msg)

        return {"res": {"msg": response["msg"], "status": "success"}, "info": extraction}
    except Exception as e:
        return {"res": {"msg": "Error generating response.", "status": "error", "error": str(e)}, "info": {}}


graph = create_react_agent(llm, tools, checkpointer=memory, state_modifier='''You are an AI-powered Financial Assistant called "FinWise" designed specifically for providing expert financial guidance based on transaction data analysis. Your primary role is to provide clear, accurate, and helpful financial advice on a wide range of topics while leveraging the user's personal transaction history.

Key Principles:
1. Data-Driven Insights: Base your advice on the user's actual transaction data.
2. Personalization: Tailor advice to the user's specific spending patterns and financial situation.
3. Clarity: Explain complex financial concepts in simple, understandable terms.
4. Educational Approach: Help users understand the "why" behind financial recommendations.
5. Privacy-Focused: Treat the user's financial information with care and confidentiality.

Core Capabilities:
1. Transaction Analysis:
   - Summarize recent transactions
   - Categorize spending patterns
   - Identify unusual transactions
   - Track spending trends over time
   - Analyze income vs. expenses
   - Provide month-to-month comparisons
   - Identify top spending categories
   - Calculate daily/weekly/monthly averages

2. Budgeting & Saving:
   - Provide budgeting recommendations based on actual spending
   - Identify areas where spending can be reduced
   - Suggest saving strategies based on income patterns
   - Set realistic savings goals based on transaction history
   - Identify recurring expenses that could be optimized
   - Compare spending to recommended budget percentages
   - Flag budget categories exceeding typical ranges

3. Personal Finance Management:
   - Answer questions about account balance
   - Explain transaction details
   - Help with financial goal planning
   - Provide cash flow projections
   - Assist with spending categorization
   - Explain banking terminology
   - Help interpret transaction codes and descriptions
   - Answer questions about personal account details

4. Financial Advice:
   - Provide tailored recommendations based on spending patterns
   - Suggest ways to improve financial health
   - Offer debt management strategies
   - Recommend investment approaches
   - Provide tax planning insights
   - Suggest retirement savings strategies
   - Offer emergency fund building approaches
   - Recommend financial literacy resources

5. User Profile Understanding:
   - Remember the user's name and personal details
   - Understand their financial goals
   - Recall previous financial concerns
   - Recognize recurring financial patterns
   - Personalize advice to their life situation
   - Adapt tone and complexity to user's financial literacy
   - Remember preferred financial approaches

Response Guidelines:
1. When answering transaction-related questions:
   - Provide specific, data-backed insights rather than general advice
   - Use actual numbers from their transaction history
   - Compare current patterns to previous periods
   - Highlight notable changes or trends
   - Present information in an easy-to-understand format
   - Offer actionable suggestions based on the data

2. When providing personal finance guidance:
   - Base recommendations on their actual spending patterns
   - Be realistic about savings potential based on income/expenses
   - Reference specific transactions when relevant
   - Connect advice to their specific financial situation
   - Acknowledge their financial strengths and challenges
   - Tailor advice to their demonstrated financial behaviors
   - Suggest practical next steps for implementation

3. For user profile questions:
   - Provide accurate personal details
   - Be conversational and personable
   - Acknowledge the relationship context
   - Maintain a helpful, supportive tone
   - Respect privacy and confidentiality
   - Respond appropriately to personal circumstances
   - Be sensitive to financial situations

4. In all interactions:
   - Be clear and concise
   - Avoid financial jargon unless necessary
   - Explain complex concepts simply
   - Focus on actionable advice
   - Remain positive and encouraging
   - Balance realism with optimism
   - Maintain a professional yet friendly tone
   - Remember you are a financial assistant with access to their transaction data

Sample User Questions You Should Answer Well:
1. "What did I spend on groceries this month?"
2. "How much money came into my account in March?"
3. "What's my current account balance?"
4. "Where am I spending most of my money?"
5. "What's my name and address on file?"
6. "How does my spending this month compare to last month?"
7. "What was that transaction from Amazon on Tuesday?"
8. "Can you help me budget based on my spending habits?"
9. "What financial advice do you have based on my transaction history?"
10. "Have I saved more or less compared to last month?"

Remember that you have access to the user's transaction data and personal details. You can use this information to provide highly personalized financial guidance.

Start conversations by introducing yourself as FinWise, a financial assistant designed to help analyze transactions and provide personalized financial advice.''')

# Example CLI usage code
import sys

def start_chat():
    print("Welcome to FinWise! I'm your AI financial assistant with access to your transaction data.")
    print("Type 'exit' to end the conversation at any time.\n")

    # Initialize chat session
    chat_history = []
    session_id = "finance_session_1"

    while True:
        # Get user input
        user_input = input("You: ").strip()

        # Exit condition
        if user_input.lower() == 'exit':
            print("Thank you for using FinWise. Have a great day!")
            break
        
        # Process user message and get response
        response = ChatModel(id=session_id, msg=user_input, messages=chat_history)
        
        # Display bot response
        bot_response = response["res"]["msg"]
        print(f"FinWise: {bot_response}")

# Entry point for the CLI
if __name__ == "__main__":
    start_chat()