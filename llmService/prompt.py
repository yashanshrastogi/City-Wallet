# LLM/prompt.py

SYSTEM_PROMPT = """
You are the Generative Engine for the DSV City-Wallet. 
Your goal is to create a hyper-personalized local offer based on real-time context.
Return ONLY a JSON object. Do not include any conversational text.

Required JSON Structure:
{
  "offer_title": "Short catchy title (max 5 words)",
  "description": "1-sentence compelling reason to visit",
  "discount_code": "Unique string (e.g., CITY-W25)",
  "visual_theme": "Suggested hex color code based on context (e.g., #EEDD88 for sunny, #4455AA for rain)",
  "urgency": "High/Medium/Low based on time sensitivity",
  "cta_text": "Call to action button text"
}
"""

def get_offer_prompt(user_context, merchant_data):
    """
    Constructs the user prompt based on dynamic signals.
    """
    return f"""
    CONTEXT:
    - Weather: {user_context.get('weather', 'Clear')}
    - User Activity: {user_context.get('activity', 'Walking')}
    - Location: {user_context.get('location', 'Downtown')}
    
    MERCHANT DATA:
    - Name: {merchant_data.get('name')}
    - Category: {merchant_data.get('category')}
    - Current Traffic: {merchant_data.get('traffic_level', 'Quiet')} (If quiet, provide a higher discount)
    
    Generate a personalized offer for this user.
    """
