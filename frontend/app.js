const API_BASE = "http://localhost:8000/api";
let currentScanId = null;
let pollInterval = null;

async function startScan() {
    const target = document.getElementById("targetInput").value.trim();
    if (!target) {
        alert("Please enter a valid IP or URL.");
        return;
    }

    // Update UI
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("resultsSection").classList.add("hidden");
    document.getElementById("scanBtn").disabled = true;

    try {
        const response = await fetch(`${API_BASE}/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target: target })
        });

        const data = await response.json();
        currentScanId = data.scan_id;

        pollInterval = setInterval(checkScanStatus, 3000);
    } catch (err) {
        alert("Failed to start scan: " + err);
        resetUI();
    }
}

async function checkScanStatus() {
    if (!currentScanId) return;

    try {
        const response = await fetch(`${API_BASE}/scan/${currentScanId}`);
        const data = await response.json();

        if (data.status === "completed") {
            clearInterval(pollInterval);
            displayResults(data);
        } else if (data.status === "failed") {
            clearInterval(pollInterval);
            alert("Scan failed: " + data.error);
            resetUI();
        }
    } catch (err) {
        console.error("Error polling status", err);
    }
}

function displayResults(data) {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("scanBtn").disabled = false;
    document.getElementById("resultsSection").classList.remove("hidden");

    const results = data.results;
    document.getElementById("scanTargetDisplay").innerText = `for ${results.target}`;

    const cat = results.categorized;

    // Categorized lists
    populateCard("Critical", cat.critical);
    populateCard("Potential", cat.potential);
    populateCard("Informational", cat.informational);

    // Setup download links
    const btnJson = document.getElementById("btnDownloadJson");
    const btnPdf = document.getElementById("btnDownloadPdf");

    // We expect the backend to mount /results route to the results map
    btnJson.href = `http://localhost:8000/results/${currentScanId}.json`;

    // The report_path comes back as an absolute path, so we use string interpolation
    btnPdf.href = `http://localhost:8000/results/${currentScanId}.pdf`;
}

function populateCard(type, items) {
    const countEl = document.getElementById(`count${type}`);
    const listEl = document.getElementById(`list${type}`);

    countEl.innerText = items.length;
    listEl.innerHTML = "";

    if (items.length === 0) {
        listEl.innerHTML = `<li>No ${type.toLowerCase()} findings detected.</li>`;
        return;
    }

    items.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        listEl.appendChild(li);
    });
}

function resetUI() {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("scanBtn").disabled = false;
}
