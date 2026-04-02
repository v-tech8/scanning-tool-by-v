import socket
import json
import logging
from config import config

def send_to_logstash(data: dict):
    try:
        host = config.LOGSTASH_HOST
        port = config.LOGSTASH_PORT
        
        payload = json.dumps(data) + "\n"
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        # Attempt connection to logstash. On failure it just logs error.
        sock.connect((host, port))
        sock.sendall(payload.encode('utf-8'))
        sock.close()
        return True
    except Exception as e:
        logging.error(f"Failed to send telemetry to Logstash: {e}")
        return False
