def run_zap(target: str):
    # Running a full OWASP ZAP scan programmatically requires the ZAP daemon and API keys.
    # For a local lightweight assessment tool, we will use mocked findings to represent its output.
    # In a production environment, this would hit the ZAP API endpoints -> /JSON/ascan/action/scan/
    return {
        "status": "mocked",
        "warning": "OWASP ZAP integration requires a running ZAP daemon. Returning mocked SQLi/XSS data.",
        "findings": [
            {
                "vulnerability": "Cross-Site Scripting (Reflected)",
                "url": f"{target}/search?q=<script>alert(1)</script>",
                "risk": "High",
                "evidence": "<script>alert(1)</script>"
            },
            {
                "vulnerability": "SQL Injection",
                "url": f"{target}/login",
                "risk": "High",
                "evidence": "Syntax error in SQL statement"
            }
        ]
    }
