# Advanced Distributed Security Scanning Platform

![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)
![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![ELK](https://img.shields.io/badge/ELK_Stack-Enabled-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

Professional-grade web vulnerability and infrastructure security analysis platform. This tool orchestrates multiple industry-standard security scanners into a single, unified interface, featuring real-time AI analysis and centralized log monitoring via the ELK stack.

## 🚀 Features

### Core Capabilities
- **Multi-Scanner Orchestration** - Run concurrent scans using Nmap, Nikto, DNSRecon, and OWASP ZAP from a unified orchestrator
- **Threat Intelligence Integration** - Automatic malware and IOC validation via the VirusTotal API 
- **AI-Powered Diagnostics** - Intelligent analysis and remediation recommendations using an integrated AI Engine
- **Centralized Event Logging** - Ships all scan logs directly into Elasticsearch via Logstash for SIEM-like visibility

### Enterprise Features
- **Responsive Dashboard** - Built with React and Tailwind CSS, featuring beautiful visual metrics and dynamic Recharts
- **PDF Report Generation** - Generate executive-ready, cleanly formatted PDF reports of scan tasks
- **Historical Tracking** - Keeps track of all historical scans and vulnerabilities over time
- **Containerized** - Ready to deploy using Docker and docker-compose

## 🛠 Technology Stack

**Frontend Interface**
- React 18.3.1
- Vite (Build Tool)
- Tailwind CSS (Utility Styling)
- Recharts (Data Visualization)
- React Router v6

**Backend & API Engine**
- Python 3.10+
- FastAPI & Uvicorn (High-performance API)
- Python-dotenv (Configuration Management)
- pdfkit & Jinja2 (PDF Report Templates)

**Security Tools & Infrastructure**
- Scanners: Nmap, Nikto, DNSRecon, OWASP ZAP
- Log Management: ELK Stack (Logstash, Elasticsearch)
- API Intel: VirusTotal API

## 📋 Requirements

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (for ELK Stack)
- (Optional) `nmap`, `nikto`, `dnsrecon` installed locally or available in PATH
- VirusTotal API Key

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/v-tech8/scanning-tool-by-v.git
cd scanning-tool-by-v
```

### 2. Set Up the Backend
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
cd backend
uvicorn main:app --reload
```

### 3. Set Up the Frontend
```bash
# In a new terminal window
cd frontend-react

# Install packages
npm install

# Start the Vite development server
npm run dev
```

### 4. Set Up the ELK Stack (Optional but recommended)
```bash
# From the project root
docker-compose up -d
```

## 💻 Usage

### Launching the Application
1. Start the backend server (`uvicorn main:app`).
2. Start the frontend React app (`npm run dev`).
3. Navigate to the frontend URL (usually `http://localhost:5173`) in your modern web browser.

### Running Scans
1. Navigate to the **New Scan** interface.
2. Provide the target IP address or hostname.
3. Select which modules you'd like to run (Nmap, Nikto, ZAP, etc.).
4. Click **Run Security Scan** and monitor the results in real-time on the Dashboard.

### Viewing Reports
- Scans populate the **Reports** section automatically upon completion.
- Click the download icon to save the executive summary as a professional PDF. 
- Integrated Threat Intel results are displayed in the Threat Intel section.

## 🏗 Project Structure

```text
scanning-tool-by-v/
├── backend/
│   ├── main.py                    # Main FastAPI controller
│   ├── config.py                  # API Keys and standards
│   ├── requirements.txt           # Python dependencies
│   ├── scanners/                  # Orchestration and scanner scripts
│   │   ├── nmap_runner.py
│   │   ├── nikto_runner.py
│   │   ├── dnsrecon_runner.py
│   │   ├── zap_runner.py
│   │   ├── virustotal_runner.py
│   │   ├── ai_analyzer.py
│   │   └── orchestrator.py
│   └── reporting/                 # Log integration and PDF generation
│       ├── exporter.py
│       └── elk_client.py
├── frontend-react/
│   ├── package.json               # Node packages
│   ├── src/                       # React components & pages
│   ├── index.html                 
│   ├── tailwind.config.js         # CSS configuration
│   └── Dockerfile                 # Frontend deployment configuration
├── frontend/                      # Legacy frontend files
├── logstash/                      # Logstash pipeline definitions
│   └── logstash.conf
└── docker-compose.yml             # ELK Stack docker orchestrator
```
