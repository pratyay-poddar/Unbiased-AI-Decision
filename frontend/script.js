let mitigationOn = false;

function toggleMitigation() {
    mitigationOn = !mitigationOn;
    const btn = document.getElementById('toggle-btn');
    const status = document.getElementById('status-text');
    
    btn.innerText = `Mitigation: ${mitigationOn ? 'ON' : 'OFF'}`;
    btn.classList.toggle('active');
    
    status.innerText = mitigationOn ? 'FAIRNESS ACTIVE' : 'RAW MODEL';
    status.style.color = mitigationOn ? '#10b981' : '#ef4444';
}

async function runAudit() {
    //database
    const applicants = [
        { name: "Alice (F)", score: 0.68, gender: "Female" },
        { name: "Bob (M)", score: 0.82, gender: "Male" }
    ];

    const display = document.getElementById('display');
    display.innerHTML = '<p>Contacting Go Backend...</p>';

    try {
        const results = [];
        for (let person of applicants) {
            // Fetch request to our Go server running on port 8000
            const response = await fetch(`http://localhost:8000/audit?mitigate=${mitigationOn}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(person)
            });
            
            const data = await response.json();
            results.push(data);
        }

        renderResults(results);
    } catch (error) {
        display.innerHTML = '<p style="color: #ef4444">Error: Could not connect to Go server.</p>';
        console.error("Backend Error:", error);
    }
}

function renderResults(data) {
    const display = document.getElementById('display');
    display.innerHTML = '';

    data.forEach(res => {
        const div = document.createElement('div');
        // If status is 'Approved', adds 'approved' class; if 'Rejected', adds 'rejected'
        div.className = `result ${res.status.toLowerCase()}`;
        
        div.innerHTML = `
            <div>
                <strong>${res.name}</strong>
                ${res.mitigation_applied ? '<span class="nudge">✨ Adjusted for Fairness</span>' : ''}
            </div>
            <div style="text-align: right">
                <div style="font-weight: bold; color: ${res.status === 'Approved' ? '#10b981' : '#ef4444'}">${res.status}</div>
                <small>Score: ${res.final_score.toFixed(2)}</small>
            </div>
        `;
        display.appendChild(div);
    });
}