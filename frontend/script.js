let mitigationOn = false;

function toggleMitigation() {
    mitigationOn = !mitigationOn;

    // UI Elements
    const toggleContainer = document.getElementById("mitigation-toggle");
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");

    toggleContainer.classList.toggle("active");

    if (mitigationOn) {
        dot.className = "dot active";
        text.innerText = "FAIRNESS_ACTIVE";
        text.style.color = "#10b981";
    } else {
        dot.className = "dot";
        text.innerText = "RAW_MODE";
        text.style.color = "#f43f5e";
    }
}

async function runAudit() {
    const display = document.getElementById('display');
    display.innerHTML = '<div class="placeholder">INITIATING_AUDIT...</div>';

    // Logic: If on localhost, use port 8000. If on Render, use the clean URL.
    const API_BASE = window.location.hostname === "localhost" 
        ? "http://localhost:8000" 
        : "https://unbiased-ai-decision-1.onrender.com"; 

    const applicants = [
        { name: "Alice (F)", score: 0.68, gender: "Female" },
        { name: "Bob (M)", score: 0.82, gender: "Male" }
    ];

    try {
        const results = [];
        for (let p of applicants) {
            const r = await fetch(`${API_BASE}/audit?mitigate=${mitigationOn}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            });
            
            if (!r.ok) throw new Error("Backend connection failed");
            results.push(await r.json());
        }
        renderResults(results);
    } catch (e) {
        console.error(e);
        display.innerHTML = '<div class="placeholder" style="color:#f43f5e">CONNECTION_LOST</div>';
    }
}

function renderResults(data) {
    const display = document.getElementById("display");
    display.innerHTML = "";

    data.forEach((res) => {
        const div = document.createElement("div");
        div.className = "audit-row";

        const statusColor = res.status === "Approved" ? "#10b981" : "#f43f5e";

        div.innerHTML = `
            <div class="row-left">
                <span>${res.name}</span>
                ${res.mitigation_applied ? '<span class="nudge-icon">✦</span>' : ""}
            </div>
            <div class="row-right">
                <span class="score-tag">SC_${res.final_score.toFixed(2)}</span>
                <span style="color: ${statusColor}; font-weight: 800;">${res.status.toUpperCase()}</span>
            </div>
        `;
        display.appendChild(div);
    });
}