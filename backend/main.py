from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from typing import Optional, Dict, Any
from scanners.orchestrator import run_all_scans
import os

app = FastAPI(title="Network Security Assessment with ELK")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for scan results (for demonstration purposes; in production, use a DB)
scan_jobs: Dict[str, Any] = {}

class ScanRequest(BaseModel):
    target: str

class ScanResponse(BaseModel):
    scan_id: str
    message: str

class IntelRequest(BaseModel):
    query: str

def background_scan_task(scan_id: str, target: str):
    scan_jobs[scan_id]["status"] = "running"
    try:
        results = run_all_scans(target, scan_id)
        scan_jobs[scan_id]["status"] = "completed"
        scan_jobs[scan_id]["results"] = results
    except Exception as e:
        scan_jobs[scan_id]["status"] = "failed"
        scan_jobs[scan_id]["error"] = str(e)

@app.post("/api/scan", response_model=ScanResponse)
async def start_scan(req: ScanRequest, background_tasks: BackgroundTasks):
    scan_id = str(uuid.uuid4())
    scan_jobs[scan_id] = {
        "status": "pending",
        "target": req.target,
        "results": None,
        "error": None
    }
    background_tasks.add_task(background_scan_task, scan_id, req.target)
    return {"scan_id": scan_id, "message": "Scan started successfully"}

@app.get("/api/scan/{scan_id}")
async def get_scan_status(scan_id: str):
    if scan_id not in scan_jobs:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan_jobs[scan_id]

@app.get("/api/scans/history")
async def get_scan_history():
    results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "results"))
    scans = []
    
    if os.path.exists(results_dir):
        files = [f for f in os.listdir(results_dir) if f.endswith(".json")]
        # Sort files by modification time (most recent first)
        files.sort(key=lambda x: os.path.getmtime(os.path.join(results_dir, x)), reverse=True)
        
        for filename in files:
            filepath = os.path.join(results_dir, filename)
            try:
                import json
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    
                cat = data.get("categorized", {})
                crit_count = len(cat.get("critical", []))
                
                status = "completed"
                if crit_count > 0:
                    status = "critical issues"
                    
                report_path = data.get("report_path")
                if report_path:
                    report_path = os.path.basename(report_path)
                    
                scans.append({
                    "scan_id": data.get("scan_id"),
                    "target": data.get("target", "Unknown"),
                    "timestamp": data.get("timestamp", ""),
                    "status": status,
                    "report_path": report_path
                })
            except Exception:
                pass
                
    return {"scans": scans}

@app.get("/api/intel/status")
async def get_intel_status():
    from config import config
    return {
        "virustotal": "Active" if config.VIRUSTOTAL_API_KEY else "Pending Key",
        "abuseipdb": "Active" if config.ABUSEIPDB_API_KEY else "Pending Key",
        "shodan": "Active" if config.SHODAN_API_KEY else "Pending Key",
    }

@app.post("/api/intel/lookup")
async def lookup_intel(req: IntelRequest):
    from config import config
    if config.VIRUSTOTAL_API_KEY:
        from scanners.virustotal_runner import run_virustotal
        vt_res = run_virustotal(req.query)
        # Parse it slightly closer to what the frontend expects for the feed
        return {
            "query": req.query,
            "threats": [
                {
                    "ip": req.query, 
                    "type": "Malicious" if vt_res.get("stats", {}).get("malicious", 0) > 0 else "Clean",
                    "src": "VirusTotal",
                    "conf": f"{max(0, min(100, vt_res.get('stats', {}).get('malicious', 0) * 10))}%"
                }
            ]
        }
    
    return {
        "query": req.query,
        "threats": [
            {
                "ip": req.query,
                "type": "Clean",
                "src": "Mock Engine",
                "conf": "0%"
            }
        ]
    }

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    # Read from results directory to get real stats
    results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "results"))
    
    total_scans = 0
    total_critical = 0
    total_high = 0
    total_medium = 0
    
    recent_activity = []
    
    if os.path.exists(results_dir):
        files = [f for f in os.listdir(results_dir) if f.endswith(".json")]
        total_scans = len(files)
        
        # Sort files by modification time (most recent first)
        files.sort(key=lambda x: os.path.getmtime(os.path.join(results_dir, x)), reverse=True)
        
        for idx, filename in enumerate(files):
            filepath = os.path.join(results_dir, filename)
            try:
                import json
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    
                cat = data.get("categorized", {})
                crit_count = len(cat.get("critical", []))
                high_count = len(cat.get("potential", []))
                med_count = len(cat.get("informational", []))
                
                total_critical += crit_count
                total_high += high_count
                total_medium += med_count
                
                if idx < 5:
                    status = "Scan Completed cleanly"
                    statusColor = "text-emerald-400"
                    if crit_count > 0:
                        status = "Critical Vulnerabilities Found"
                        statusColor = "text-rose-400"
                    elif high_count > 0:
                        status = "High Risk Issues Detected"
                        statusColor = "text-orange-400"
                        
                    recent_activity.append({
                        "id": data.get("scan_id"),
                        "target": data.get("target", "Unknown"),
                        "time": data.get("timestamp", ""),
                        "status": status,
                        "statusColor": statusColor
                    })
            except Exception:
                pass

    return {
        "metrics": {
            "critical": total_critical,
            "high": total_high,
            "medium": total_medium,
            "scanned_ips": total_scans
        },
        "recent_activity": recent_activity,
        "timeline": [
            {"time": "08:00", "threats": total_scans * 2},
            {"time": "12:00", "threats": total_critical + total_high},
            {"time": "16:00", "threats": total_medium},
            {"time": "20:00", "threats": total_critical * 2}
        ]
    }

# Mount results folder first so it intercepts /results paths
results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "results"))
os.makedirs(results_dir, exist_ok=True)
app.mount("/results", StaticFiles(directory=results_dir), name="results")

# Mount frontend files at the root
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
