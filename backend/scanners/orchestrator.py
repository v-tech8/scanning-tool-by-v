import os
import json
from datetime import datetime
from scanners.nmap_runner import run_nmap
from scanners.nikto_runner import run_nikto
from scanners.zap_runner import run_zap
from scanners.dnsrecon_runner import run_dnsrecon
from scanners.virustotal_runner import run_virustotal
from reporting.elk_client import send_to_logstash
from reporting.exporter import generate_report
from scanners.ai_analyzer import generate_ai_summary

def categorize_findings(results: dict):
    critical = []
    potential = []
    informational = []

    # Nmap
    for port in results.get("nmap", {}).get("ports", []):
        if port.get("state") == "open":
            if port.get("port") in ["21", "22", "23", "3389", "445"]:
                potential.append(f"Open sensitive port: {port.get('port')} ({port.get('service')})")
            else:
                informational.append(f"Open port: {port.get('port')} ({port.get('service')})")

    # Nikto
    for finding in results.get("nikto", {}).get("findings", []):
        desc = finding.get("description", "").lower()
        if "outdated" in desc or "vulnerable" in desc or "sql" in desc:
            critical.append(f"Nikto: {finding.get('description')}")
        else:
            potential.append(f"Nikto: {finding.get('description')}")

    # ZAP
    for finding in results.get("zap", {}).get("findings", []):
        risk = finding.get("risk", "").lower()
        if risk == "high":
            critical.append(f"ZAP High Risk: {finding.get('vulnerability')} on {finding.get('url')}")
        else:
            potential.append(f"ZAP Risk: {finding.get('vulnerability')}")

    # VirusTotal
    stats = results.get("virustotal", {}).get("stats", {})
    if stats.get("malicious", 0) > 0:
        critical.append(f"VirusTotal detected {stats.get('malicious')} malicious engines.")
    elif stats.get("suspicious", 0) > 0:
        potential.append(f"VirusTotal detected {stats.get('suspicious')} suspicious engines.")

    return {
        "critical": critical,
        "potential": potential,
        "informational": informational
    }

def run_all_scans(target: str, scan_id: str):
    results = {
        "scan_id": scan_id,
        "target": target,
        "timestamp": datetime.utcnow().isoformat(),
        "nmap": run_nmap(target),
        "nikto": run_nikto(target),
        "zap": run_zap(target),
        "dnsrecon": run_dnsrecon(target),
        "virustotal": run_virustotal(target)
    }

    # Categorize
    categories = categorize_findings(results)
    results["categorized"] = categories

    # AI Analysis
    ai_summary = generate_ai_summary(results)
    results["ai_analysis"] = ai_summary

    # Save to JSON
    # Go up one level from 'backend/scanners' to the project root
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    results_dir = os.path.join(base_dir, "results")
    os.makedirs(results_dir, exist_ok=True)
    
    results_file = os.path.join(results_dir, f"{scan_id}.json")
    with open(results_file, "w") as f:
        json.dump(results, f, indent=4)

    # Generate PDF
    report_path = generate_report(results, scan_id)
    results["report_path"] = report_path

    # Send to ELK
    send_to_logstash(results)
    
    return results
