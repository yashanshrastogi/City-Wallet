#MODEL LOADER
#MODEL LOADER
# LLM/modelengine.py
# Ensure you have 'GROQ_API_KEY' in your .env file
import os
from dotenv import load_dotenv
load_dotenv()
from groq import Groq
import json
from .prompt import SYSTEM_PROMPT, get_offer_prompt
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_city_offer(user_context, merchant_data):
    """
    Calls Groq API to generate a structured offer.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": get_offer_prompt(user_context, merchant_data)}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            response_format={"type": "json_object"}  # Forces JSON output
        )

        # Parse and return the JSON response
        return json.loads(chat_completion.choices[0].message.content)

    except Exception as e:
        print(f"Error generating offer: {e}")
        return None





