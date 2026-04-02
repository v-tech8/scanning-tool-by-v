import os
from jinja2 import Template
import pdfkit

def generate_report(results: dict, scan_id: str) -> str:
    template_str = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Security Assessment Report</title>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #333; }
            h1 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .critical { color: #e53e3e; }
            .potential { color: #dd6b20; }
            .info { color: #3182ce; }
            .section { margin-bottom: 30px; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 20px; }
            .list-item { background: #f7fafc; padding: 10px; margin: 5px 0; border-left: 4px solid #cbd5e0; }
            .critical-list .list-item { border-left-color: #e53e3e; }
            .potential-list .list-item { border-left-color: #dd6b20; }
            .info-list .list-item { border-left-color: #3182ce; }
            ul { list-style-type: none; padding: 0; }
        </style>
    </head>
    <body style="background: #fdfdfd;">
        <h1>Network Security Assessment Report</h1>
        <div class="section">
            <p><strong>Target:</strong> {{ results.target }}</p>
            <p><strong>Date:</strong> {{ results.timestamp }}</p>
            <p><strong>Scan ID:</strong> {{ results.scan_id }}</p>
        </div>

        <div class="section">
            <h2>Executive Summary</h2>
            <p>This report contains the findings of an automated security scan. Please review the categorized findings below to identify critical vulnerabilities affecting the target environment.</p>
        </div>

        <div class="section critical-list">
            <h2 class="critical">Critical Vulnerabilities ({{ results.categorized.critical | length }})</h2>
            <ul>
                {% for item in results.categorized.critical %}
                <li class="list-item">{{ item }}</li>
                {% else %}
                <li class="list-item">None detected.</li>
                {% endfor %}
            </ul>
        </div>

        <div class="section potential-list">
            <h2 class="potential">Potential Threats ({{ results.categorized.potential | length }})</h2>
            <ul>
                {% for item in results.categorized.potential %}
                <li class="list-item">{{ item }}</li>
                {% else %}
                <li class="list-item">None detected.</li>
                {% endfor %}
            </ul>
        </div>

        <div class="section info-list">
            <h2 class="info">Informational Findings ({{ results.categorized.informational | length }})</h2>
            <ul>
                {% for item in results.categorized.informational %}
                <li class="list-item">{{ item }}</li>
                {% else %}
                <li class="list-item">None detected.</li>
                {% endfor %}
            </ul>
        </div>

        <div class="section">
            <h2>Remediation Suggestions</h2>
            <ul>
            <li class="list-item">Ensure all software and operating systems are updated to the latest stable versions.</li>
            <li class="list-item">Disable any unnecessary network ports or services unnecessarily exposed to the internet.</li>
            <li class="list-item">Review web application inputs for proper sanitization to prevent XSS and SQL injection attacks.</li>
            <li class="list-item">Configure security headers properly on the web server (e.g., Strict-Transport-Security, X-XSS-Protection).</li>
            </ul>
        </div>
    </body>
    </html>
    """
    
    template = Template(template_str)
    html_content = template.render(results=results)
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    results_dir = os.path.join(base_dir, "results")
    pdf_path = os.path.join(results_dir, f"{scan_id}.pdf")
    html_path = os.path.join(results_dir, f"{scan_id}.html")
    
    with open(html_path, "w") as f:
        f.write(html_content)
        
    try:
        # Requires wkhtmltopdf to be installed locally
        options = {'quiet': ''}
        pdfkit.from_file(html_path, pdf_path, options=options)
        return pdf_path
    except Exception as e:
        print(f"Failed to generate PDF, returning HTML fallback: {e}")
        return html_path
