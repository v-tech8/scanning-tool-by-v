import subprocess
import json

def run_dnsrecon(target: str):
    # Strip protocol for dnsrecon
    clean_target = target.replace("http://", "").replace("https://", "").split("/")[0]
    
    try:
        # Run standard DNS enumeration
        result = subprocess.run(['dnsrecon', '-d', clean_target, '-j', '/dev/stdout'], capture_output=True, text=True, timeout=60)
        
        try:
            records = json.loads(result.stdout)
            return {"status": "success", "records": records}
        except:
            if result.returncode != 0:
                 raise Exception(result.stderr or "Unknown error")
            return {"status": "partial", "output": result.stdout[:500]}
            
    except FileNotFoundError:
        return {
            "status": "mocked", 
            "warning": "DNSRecon not installed.",
            "records": [
                {"name": f"{clean_target}", "type": "A", "address": "192.168.1.100"},
                {"name": f"www.{clean_target}", "type": "CNAME", "target": f"{clean_target}"},
                {"name": f"mail.{clean_target}", "type": "MX", "address": "192.168.1.101", "exchange": "mail.server.com"}
            ]
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
