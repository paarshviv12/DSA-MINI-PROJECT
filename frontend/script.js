document.addEventListener('DOMContentLoaded', () => {
    // Initial State
    let queue = [
        { id: 1001, name: "John Doe", age: 45, severity: 1, condition: "Cardiac Arrest", waitTime: 4 },
        { id: 1002, name: "Jane Smith", age: 22, severity: 3, condition: "Fractured Radius", waitTime: 25 },
        { id: 1003, name: "Robert Johnson", age: 68, severity: 2, condition: "Severe Chest Pain", waitTime: 12 },
        { id: 1004, name: "Emily Davis", age: 34, severity: 5, condition: "Minor Laceration", waitTime: 85 }
    ];

    const queueTableBody = document.getElementById('queueTableBody');
    const criticalWaitCount = document.getElementById('criticalWaitCount');
    const totalWaitCount = document.getElementById('totalWaitCount');
    
    // Modal Elements
    const regModal = document.getElementById('regModal');
    const openRegModalBtn = document.getElementById('openRegModal');
    const closeRegModalBtn = document.getElementById('closeRegModal');
    const cancelRegBtn = document.getElementById('cancelRegBtn');
    const registerForm = document.getElementById('registerForm');
    const admitBtn = document.getElementById('admitBtn');

    // Generate severity text mappings
    const getSeverityText = (level) => {
        const labels = {
            1: "Level 1 (Resuscitation)",
            2: "Level 2 (Emergent)",
            3: "Level 3 (Urgent)",
            4: "Level 4 (Less Urgent)",
            5: "Level 5 (Non-Urgent)"
        };
        return labels[level] || `Level ${level}`;
    };

    // Render the table
    function renderQueue() {
        // Sort: Severity (1 is highest), then wait time (highest wait first)
        queue.sort((a, b) => {
            if (a.severity !== b.severity) return a.severity - b.severity;
            return b.waitTime - a.waitTime; // Assuming higher wait time = arrived earlier
        });

        queueTableBody.innerHTML = '';
        let criticalCount = 0;

        if (queue.length === 0) {
            queueTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #6b7280;">No patients in queue</td></tr>`;
        }

        queue.forEach(p => {
            if (p.severity <= 2) criticalCount++;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <span class="badge sev-${p.severity}">${getSeverityText(p.severity)}</span>
                </td>
                <td><strong>${p.name}</strong><br><span style="font-size:0.75rem;color:#6b7280;">ID: #${p.id}</span></td>
                <td>${p.age} yrs</td>
                <td>${p.condition}</td>
                <td style="font-weight: 500;">${p.waitTime} mins</td>
                <td><button class="btn-secondary" onclick="admitPatient(${p.id})" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Admit</button></td>
            `;
            queueTableBody.appendChild(tr);
        });

        // Update stats
        totalWaitCount.textContent = queue.length;
        criticalWaitCount.textContent = criticalCount;
    }

    // Modal Handlers
    openRegModalBtn.addEventListener('click', () => {
        regModal.classList.add('active');
    });

    const closeModal = () => {
        regModal.classList.remove('active');
        registerForm.reset();
    };

    closeRegModalBtn.addEventListener('click', closeModal);
    cancelRegBtn.addEventListener('click', closeModal);

    // Form Submit
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newPatient = {
            id: Math.floor(Math.random() * 9000) + 1000,
            name: document.getElementById('pName').value,
            age: parseInt(document.getElementById('pAge').value),
            severity: parseInt(document.getElementById('pSeverity').value),
            condition: document.getElementById('pCondition').value,
            waitTime: 0
        };

        queue.push(newPatient);
        closeModal();
        renderQueue();
    });

    // Global Admit function
    window.admitPatient = function(id) {
        queue = queue.filter(p => p.id !== id);
        renderQueue();
    };

    // Bulk Admit Next Priority button
    admitBtn.addEventListener('click', () => {
        if (queue.length > 0) {
            const nextPatient = queue[0];
            admitPatient(nextPatient.id);
        } else {
            alert('Queue is empty');
        }
    });

    // Increment wait times every 1 minute (mocked to 10 seconds for demo)
    setInterval(() => {
        queue = queue.map(p => ({...p, waitTime: p.waitTime + 1}));
        renderQueue();
    }, 10000);

    // Initial render
    renderQueue();
});
