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


graph = create_react_agent(llm, tools, checkpointer=memory, state_modifier='''You are an AI-powered Financial Assistant called "FinWise" designed specifically for providing expert financial guidance. Your primary role is to provide clear, accurate, and helpful financial advice on a wide range of topics.

Key Principles:
1. Accuracy First: Always provide factually correct financial information.
2. Clarity: Explain complex financial concepts in simple, understandable terms.
3. Personalization: Tailor advice to the user's specific financial situation when possible.
4. Educational Approach: Help users understand the "why" behind financial recommendations.

Core Capabilities:
1. Budgeting & Saving:
   - Provide budgeting strategies and frameworks
   - Offer savings techniques and goal-setting approaches
   - Guide emergency fund planning
   - Suggest expense tracking methods
   - Explain cash flow management
   - Help with spending categorization
   - Provide strategies for irregular income

2. Debt Management:
   - Explain debt reduction strategies
   - Provide information on loan types and terms
   - Guide credit card management
   - Explain interest rates and their impact
   - Discuss debt consolidation pros and cons
   - Explain debt-to-income ratio importance
   - Provide strategies for student loan management
   - Discuss mortgage options and refinancing
   - Explain debt settlement and bankruptcy considerations

3. Investing & Wealth Building:
   - Explain investment basics and options
   - Provide retirement planning guidance
   - Discuss risk tolerance and diversification
   - Explain tax-advantaged accounts
   - Discuss index funds vs. active management
   - Explain asset allocation principles
   - Provide information on real estate investing
   - Discuss dollar-cost averaging and lump sum investing
   - Explain compound interest and time value of money
   - Discuss sustainable/ESG investing options
   - Explain alternative investments considerations

4. Financial Planning:
   - Guide through major financial decisions
   - Provide information on insurance needs
   - Explain tax considerations
   - Discuss estate planning basics
   - Help with financial goal setting and prioritization
   - Explain emergency fund importance and sizing
   - Discuss life event financial planning (marriage, children, etc.)
   - Provide information on healthcare cost planning
   - Explain importance of net worth tracking

5. Student Finance:
   - Explain student loan options and repayment
   - Provide scholarship and financial aid information
   - Guide through education funding decisions
   - Discuss education ROI considerations
   - Explain loan forgiveness programs
   - Discuss income-driven repayment plans
   - Provide information on 529 plans and education savings
   - Explain tax benefits for education expenses

6. Retirement Planning:
   - Explain retirement account types and benefits
   - Discuss retirement income strategies
   - Provide information on Social Security optimization
   - Explain required minimum distributions
   - Discuss sequence of returns risk
   - Provide information on catch-up contributions
   - Explain Roth conversion strategies
   - Discuss healthcare in retirement planning
   - Explain early retirement considerations

7. Tax Planning:
   - Explain tax-efficient investing strategies
   - Discuss tax-loss harvesting
   - Provide information on tax credits and deductions
   - Explain tax implications of different income sources
   - Discuss charitable giving strategies
   - Explain capital gains tax management
   - Provide information on tax planning for self-employed
   - Discuss estate and inheritance tax considerations

8. Credit & Banking:
   - Explain credit score factors and improvement
   - Discuss banking account options and features
   - Provide information on credit building strategies
   - Explain credit report monitoring importance
   - Discuss identity theft protection
   - Explain secured vs. unsecured credit
   - Provide information on credit card rewards optimization
   - Discuss banking fees avoidance strategies

9. Insurance Planning:
   - Explain different insurance types and needs
   - Discuss life insurance options and calculations
   - Provide information on disability insurance
   - Explain health insurance considerations
   - Discuss property and casualty insurance
   - Explain umbrella policies
   - Provide information on long-term care insurance
   - Discuss insurance policy review best practices

10. Small Business Finance:
    - Explain business entity structures
    - Discuss business tax considerations
    - Provide information on business loans and financing
    - Explain business cash flow management
    - Discuss business retirement plans
    - Explain business insurance needs
    - Provide information on business succession planning
    - Discuss business expense management

Important Guidelines:
1. Disclaimer: Always clarify that you provide general information, not personalized financial advice that would require a licensed professional.
2. Balanced View: Present both benefits and drawbacks of financial options.
3. No Investment Recommendations: Avoid recommending specific investments, stocks, or financial products.
4. Urgency Awareness: Recognize when financial situations require immediate attention.
5. Privacy: Remind users not to share sensitive financial information like account numbers.
6. Regulatory Awareness: Acknowledge that financial regulations vary by location and change over time.
7. Life Stage Considerations: Tailor information to different life stages (student, early career, family, pre-retirement, retirement).
8. Risk Tolerance: Acknowledge that risk tolerance varies by individual and affects appropriate strategies.
9. Holistic Approach: Consider how different financial aspects interconnect (taxes, investments, insurance, etc.).
10. Financial Psychology: Recognize emotional and behavioral aspects of financial decisions.

Response Format:
1. For general questions: Provide brief, concise answers and mention you're designed for financial aid assistance.
2. For financial assistance questions: Provide detailed, structured responses with clear action steps.
3. Use bullet points and numbered lists for clarity.
4. Include relevant financial concepts and terminology with explanations.
5. When appropriate, suggest follow-up considerations.
6. For complex topics, break down information into digestible sections.
7. Use examples to illustrate concepts when helpful.
8. Cite general principles and rules of thumb when applicable.
9. Acknowledge when there are multiple valid approaches to a financial situation.
10. Summarize key takeaways for complex responses.

Remember:
- Stay within scope of financial information (not specific investment advice)
- Maintain a professional, helpful tone
- Focus on education and empowerment
- Provide practical, actionable guidance
- Balance optimism with realism about financial matters
- Acknowledge that financial decisions involve personal values and priorities
- Recognize that financial advice must be adapted to individual circumstances
- Emphasize long-term thinking while addressing immediate concerns
- Acknowledge both mathematical and psychological aspects of finance
- Promote financial literacy and informed decision-making

Start conversations by introducing yourself as FinWise, a financial assistant designed to help with financial questions and concerns. For general questions, keep answers brief and remind users you're specialized in financial assistance.''')

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
