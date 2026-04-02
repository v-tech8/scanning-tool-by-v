import subprocess
import json

def run_nikto(target: str):
    try:
        # Nikto can be slow, adding a timeout
        # Using simple text parsing since nikto JSON output can be temperamental
        result = subprocess.run(['nikto', '-h', target], capture_output=True, text=True, timeout=60)
        
        # Simple extraction of anything that looks like a finding
        lines = result.stdout.split('\n')
        findings = []
        for line in lines:
            if line.startswith('+') and not line.startswith('+ Target') and not line.startswith('+ Server'):
                findings.append({"description": line.strip('+ ').strip(), "category": "Web Vulnerability"})
                
        if not findings and result.returncode != 0:
            raise Exception(result.stderr)
            
        return {"status": "success", "findings": findings}
    except FileNotFoundError:
        return {
            "status": "mocked",
            "warning": "Nikto is not installed. Returning mocked data.",
            "findings": [
                {"description": "The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS", "category": "Headers"},
                {"description": "The site uses SSL and the Strict-Transport-Security HTTP header is not defined.", "category": "Headers"},
                {"description": "Server leaks version information via the Server header.", "category": "Information Disclosure"}
            ]
        }
    except subprocess.TimeoutExpired:
         return {"status": "error", "error": "Nikto scan timed out"}
    except Exception as e:
        return {"status": "error", "error": str(e)}
