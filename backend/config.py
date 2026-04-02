import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
    ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY", "")
    SHODAN_API_KEY = os.getenv("SHODAN_API_KEY", "")
    ELASTICSEARCH_HOST = os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")
    LOGSTASH_HOST = os.getenv("LOGSTASH_HOST", "localhost")
    LOGSTASH_PORT = int(os.getenv("LOGSTASH_PORT", "5044"))

config = Config()
