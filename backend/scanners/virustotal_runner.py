import requests
import base64
from config import config

def run_virustotal(target: str):
    if not config.VIRUSTOTAL_API_KEY:
        return {
            "status": "mocked", 
            "warning": "No VirusTotal API Key provided. Returning mock data.", 
            "stats": {"malicious": 0, "suspicious": 1, "undetected": 75, "harmless": 12}
        }
    
    # Clean target URL if needed, but the API accepts full URLs
    if not target.startswith("http"):
        target = "http://" + target
        
    url_id = base64.urlsafe_b64encode(target.encode()).decode().strip("=")
    url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    
    headers = {
        "accept": "application/json",
        "x-apikey": config.VIRUSTOTAL_API_KEY
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            return {"status": "success", "stats": stats}
        elif response.status_code == 404:
             # URL not found in VT database, would need to submit it first, 
            # but for this assessment we will just return mock or empty
            return {"status": "error", "error": "URL not previously analyzed by VirusTotal"}
        else:
            return {"status": "error", "error": f"API returned {response.status_code}: {response.text[:100]}"}
    except Exception as e:
        return {"status": "error", "error": str(e)}
