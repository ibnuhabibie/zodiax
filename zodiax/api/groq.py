import requests
import json
import frappe
import re



API_URL = "https://api.groq.com/openai/v1/chat/completions"

def call(prompt, model="llama-3.3-70b-versatile", temperature=0.7):
    """General function to call Deepseek AI API with a given prompt."""

    settings = frappe.get_single("Zodiax Settings")
    API_KEY = settings.api_key
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        print(response)
        response.raise_for_status()  # Raise error if status code is not 200

        response_text = response.json()["choices"][0]["message"]["content"]
        cleaned_text = re.sub(r"```json\n(.*?)\n```", r"\1", response_text, flags=re.DOTALL)

        print(cleaned_text)

        try:
            parsed_response = json.loads(cleaned_text)
            return parsed_response
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {str(e)}", "Groq API")
            return None
        
    except requests.exceptions.RequestException as e:
        print(e)
        print(f"Groq API Error: {str(e)}", "Groq API")
        return None