import frappe
import zodiax.api.groq as groq

def generate_daily_horoscope():
    # """Generates daily horoscopes using Deepseek AI and saves them in Frappe."""

    print("generate daily horoscope")
    
    zodiac_signs = frappe.get_all("Zodiac", fields=["name"])
    date_today = frappe.utils.today()

    print(date_today)
    print(zodiac_signs)

    for zodiac in zodiac_signs:
        zodiac_name = zodiac["name"]

        print(f"Running prediction for {zodiac_name}")

        # Check if today's horoscope already exists
        if frappe.get_all("Daily Horoscope", filters={"zodiac_sign": zodiac_name, "date": date_today}):
            print(f"Horoscope for {zodiac_name} on {date_today} already exists. Skipping...")
            continue

        # 🔮 Call Deepseek AI
        prompt = f"""
        Generate a daily horoscope for {zodiac_name}. Format the response as a valid JSON object, following this exact structure:

        {{
            "zodiac_name": "{zodiac_name}",
            "lucky_color": "string",
            "lucky_number": integer,
            "predictions": {{
                "general": "string",
                "love": "string",
                "career": "string",
                "health": "string"
            }},
            "best_matches": {{
                "love": "string (1 zodiac sign)",
                "friendship": "string (1 zodiac sign)",
                "career": "string (1 zodiac sign)"
            }},
            "star_ratings": {{
                "sex_drive": integer (1-5),
                "vibe": integer (1-5),
                "hustle": integer (1-5),
                "success": integer (1-5),
                "emotional_wellbeing": integer (1-5)
            }}
        }}

        - The response **must be a valid JSON object**.  
        - Do **NOT** include extra text, explanations, or Markdown formatting.  
        - Ensure the JSON is properly structured with correct data types (strings and integers).  
        - Only provide one zodiac sign per match type.  
        """

        response = groq.call(prompt)

        if not response:
            print(f"Failed to generate horoscope for {zodiac_name}")
            continue

        # 🌟 Create Daily Horoscope record
        doc = frappe.get_doc({
            "doctype": "Daily Horoscope",
            "zodiac_sign": zodiac_name,
            "date": date_today,
            "lucky_color": response.get("lucky_color"),
            "lucky_number": response.get("lucky_number"),
            "predictions": [],
            "matches": [],
            "ratings": []
        })

        # Add Predictions
        for category, text in response.get("predictions", {}).items():
            doc.append("predictions", {"category": category, "prediction_text": text})

        # Add Matches
        for match_type, matched_zodiac in response.get("best_matches", {}).items():
            doc.append("matches", {"category": match_type, "zodiac": matched_zodiac})

        # Add Star Ratings
        for rating_category, stars in response.get("star_ratings", {}).items():
            doc.append("ratings", {"category": rating_category, "star_rating": stars})

        doc.insert()
        frappe.db.commit()
        print(f"Generated daily horoscope for {zodiac_name}")
