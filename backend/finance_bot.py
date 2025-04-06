import json
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from langchain_core.tools import tool

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

@tool
def assess_financial_situation() -> dict:
    '''Tool to help assess user's current financial situation and patterns'''
    return {
        "categories": [
            "income",
            "expenses",
            "debt",
            "savings",
            "investments",
            "financial_goals",
            "credit_score",
            "tax_situation",
            "retirement_planning",
            "insurance_coverage",
            "estate_planning",
            "business_finances"
        ],
        "assessment_questions": [
            "What is your current income situation?",
            "What are your major monthly expenses?",
            "Do you have any outstanding debts?",
            "What are your savings goals?",
            "Are you currently investing in any assets?",
            "What are your long-term financial goals?",
            "Do you have adequate insurance coverage?",
            "Have you started planning for retirement?"
        ]
    }

@tool
def provide_financial_strategies(concern: str) -> dict:
    '''Provides relevant financial strategies based on the specific concern'''
    strategies = {
        "budgeting": [
            "50/30/20 rule (needs/wants/savings)",
            "Zero-based budgeting",
            "Envelope system",
            "Expense tracking apps",
            "Monthly budget reviews",
            "Cash flow management",
            "Discretionary spending limits",
            "Needs vs wants prioritization"
        ],
        "debt": [
            "Debt snowball method",
            "Debt avalanche method",
            "Debt consolidation options",
            "Balance transfer strategies",
            "Student loan repayment plans",
            "Loan refinancing",
            "Debt settlement considerations",
            "Bankruptcy as a last resort",
            "Debt-to-income ratio improvement"
        ],
        "saving": [
            "Emergency fund building",
            "Automatic savings transfers",
            "High-yield savings accounts",
            "Certificate of deposits (CDs)",
            "Money market accounts",
            "Savings buckets for specific goals",
            "No-spend challenges",
            "Windfall management strategies"
        ],
        "investing": [
            "Index fund investing",
            "Retirement account options (401k, IRA)",
            "Dollar-cost averaging",
            "Asset allocation strategies",
            "Diversification principles",
            "Tax-efficient investing",
            "ESG/sustainable investing",
            "Real estate investment options",
            "Risk management techniques"
        ],
        "retirement": [
            "Retirement savings calculators",
            "Social Security optimization",
            "Pension plan considerations",
            "Required Minimum Distributions (RMDs)",
            "Catch-up contributions",
            "Roth conversion strategies",
            "Sequence of returns risk management",
            "Retirement income planning"
        ],
        "taxes": [
            "Tax-advantaged account utilization",
            "Tax-loss harvesting",
            "Charitable giving strategies",
            "Tax credit optimization",
            "Estimated tax payments",
            "Tax filing status optimization",
            "State tax considerations",
            "Capital gains management"
        ],
        "credit": [
            "Credit score improvement tactics",
            "Credit utilization management",
            "Credit report monitoring",
            "Secured credit building options",
            "Authorized user strategies",
            "Credit freeze protection",
            "Debt validation processes",
            "Credit mix optimization"
        ],
        "insurance": [
            "Insurance needs analysis",
            "Term vs. permanent life insurance",
            "Disability insurance considerations",
            "Health insurance optimization",
            "Property and casualty coverage",
            "Umbrella policy protection",
            "Long-term care planning",
            "Insurance policy review schedule"
        ]
    }
    return {"strategies": strategies.get(concern, strategies["budgeting"])}

@tool
def get_financial_resources() -> dict:
    '''Provides information about financial resources and support services'''
    return {
        "government_programs": {
            "student_aid": "FAFSA and federal student aid programs",
            "housing_assistance": "HUD housing programs",
            "income_support": "SNAP, TANF, and other assistance programs",
            "healthcare": "Medicaid, Medicare, and ACA marketplace options",
            "retirement": "Social Security benefits and resources",
            "veterans": "VA financial benefits and programs",
            "disability": "SSDI and SSI programs",
            "tax_assistance": "VITA and TCE programs for free tax preparation"
        },
        "educational_resources": [
            "Consumer Financial Protection Bureau",
            "Financial Literacy Courses",
            "Personal Finance Books and Podcasts",
            "Financial Advisor Services",
            "National Foundation for Credit Counseling",
            "American Institute of CPAs resources",
            "Financial Planning Association",
            "Financial therapy resources"
        ],
        "tools": [
            "Budgeting apps",
            "Credit monitoring services",
            "Investment platforms",
            "Tax preparation software",
            "Retirement calculators",
            "Debt payoff calculators",
            "Net worth tracking tools",
            "Financial goal planning software",
            "Estate planning document generators"
        ],
        "specialized_assistance": {
            "student_loans": "Student loan counseling services",
            "housing": "Housing counseling agencies",
            "credit": "Credit counseling organizations",
            "bankruptcy": "Bankruptcy attorney referral services",
            "small_business": "Small Business Administration resources",
            "elder_finance": "Elder financial protection services",
            "military": "Military financial readiness programs"
        }
    }

tools = [assess_financial_situation, provide_financial_strategies, get_financial_resources]

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
        "resources_relevant": []
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
                "resources_relevant": []
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
        msg = "I'm here to help with your financial questions. What financial topic can I assist you with today?"
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


graph = create_react_agent(llm, tools, checkpointer=memory, state_modifier='''
#appropriate prompt
''')
# Example CLI usage code
import sys

def start_chat():
    print("Welcome to FinWise! I'm your AI financial assistant.")
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
        
        # Add user message to chat history
        chat_history.append({"send": "user", "content": user_input, "toolCall": {}, "options": []})

        # Call the chatbot model and get the response
        response = ChatModel(id=session_id, msg=user_input, messages=chat_history)

        # Extract the bot's response and display it
        bot_response = response["res"]["msg"]
        print(f"FinWise: {bot_response}")

        # Optionally, you can print the extracted financial concerns
        # extracted_info = response["info"]
        # print(f"\nExtracted Financial Information: {extracted_info}\n")

# # Entry point for the CLI
if __name__ == "__main__":
    start_chat()
