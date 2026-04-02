import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

# We can use Google Gemini for AI analysis
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def generate_ai_summary(scan_results: dict) -> dict:
    """
    Takes the categorized scan results and asks an AI to summarize the 
    threat landscape and provide remediation steps.
    """
    if not GEMINI_API_KEY:
        return {
            "summary": "AI Analysis is disabled. Please configure GEMINI_API_KEY in your .env file.",
            "remediation": []
        }

    try:
        # Extract just the categorized findings to save on token limits
        categories = scan_results.get("categorized", {})
        target = scan_results.get("target", "Unknown Target")
        
        prompt = f"""
        You are a highly experienced Senior Cloud Security Architect and Penetration Tester.
        I have just ran an automated security scan (Nmap, Nikto, ZAP) against the target: {target}.
        
        Here are the categorized findings:
        CRITICAL: {json.dumps(categories.get("critical", []))}
        POTENTIAL/HIGH: {json.dumps(categories.get("potential", []))}
        
        Please provide a professional, executive-level JSON response with two keys:
        1. "summary": A 2-paragraph high-level summary of the overall risk posture and the most critical threats found.
        2. "remediation": An array of strings, where each string is a specific, actionable remediation step for the DevOps/SysAdmin team to fix the critical and high issues.
        
        Do not include markdown formatting like ```json in the output. Just return the raw JSON.
        """
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        headers = {'Content-Type': 'application/json'}
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result_json = response.json()
        
        # Parse the text response back into a dictionary
        text_content = result_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
        
        # Attempt to clean the output if the model wrapped it in markdown
        text_content = text_content.replace('```json', '').replace('```', '').strip()
        
        ai_analysis = json.loads(text_content)
        return ai_analysis
        
    except Exception as e:
        print(f"[ERROR] AI Analysis failed: {e}")
        return {
            "summary": "An error occurred during AI analysis generation.",
            "remediation": ["Manual review required."]
        }
