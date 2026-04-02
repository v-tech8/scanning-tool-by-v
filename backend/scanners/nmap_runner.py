import subprocess
import xml.etree.ElementTree as ET

def run_nmap(target: str):
    try:
        # Using -F for fast scan, -sV for service versions
        result = subprocess.run(['nmap', '-F', '-sV', '-oX', '-', target], capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0 and not result.stdout:
            raise Exception("Nmap failed: " + result.stderr)
            
        root = ET.fromstring(result.stdout)
        ports = []
        for host in root.findall('host'):
            for ports_node in host.findall('ports'):
                for port in ports_node.findall('port'):
                    state = port.find('state').get('state') if port.find('state') is not None else 'unknown'
                    service_node = port.find('service')
                    service = service_node.get('name') if service_node is not None else 'unknown'
                    version = service_node.get('version') if service_node is not None else ''
                    
                    ports.append({
                        "port": port.get('portid'),
                        "protocol": port.get('protocol'),
                        "state": state,
                        "service": service,
                        "version": version
                    })
        return {"status": "success", "ports": ports}
    except FileNotFoundError:
        return {
            "status": "mocked",
            "warning": "nmap is not installed. Returning mocked data.",
            "ports": [
                {"port": "80", "protocol": "tcp", "state": "open", "service": "http", "version": "Apache 2.4.41"},
                {"port": "443", "protocol": "tcp", "state": "open", "service": "https", "version": ""},
                {"port": "22", "protocol": "tcp", "state": "open", "service": "ssh", "version": "OpenSSH 8.2p1"}
            ]
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
