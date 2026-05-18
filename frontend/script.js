document.addEventListener('DOMContentLoaded', () => {
    // Initial State - Active Queue
    let queue = [
        { id: 1001, name: "John Doe", age: 45, severity: 1, condition: "Cardiac Arrest", waitTime: 4 },
        { id: 1002, name: "Jane Smith", age: 22, severity: 3, condition: "Fractured Radius", waitTime: 25 },
        { id: 1003, name: "Robert Johnson", age: 68, severity: 2, condition: "Severe Chest Pain", waitTime: 12 },
        { id: 1004, name: "Emily Davis", age: 34, severity: 5, condition: "Minor Laceration", waitTime: 85 }
    ];

    // Bed Directory State with Full Metadata (Module 2 & Advisor)
    let beds = [
        { id: 101, name: "Bed 101", status: "Occupied", patient: "Marcus Aurelius", age: 58, severity: 2, condition: "Hypertensive Crisis" },
        { id: 102, name: "Bed 102", status: "Available", patient: "", age: 0, severity: 0, condition: "" },
        { id: 103, name: "Bed 103", status: "Occupied", patient: "Clara Oswald", age: 28, severity: 4, condition: "Sprained Ankle" },
        { id: 104, name: "Bed 104", status: "Available", patient: "", age: 0, severity: 0, condition: "" },
        { id: 105, name: "Bed 105", status: "Available", patient: "", age: 0, severity: 0, condition: "" },
        { id: 106, name: "Bed 106", status: "Available", patient: "", age: 0, severity: 0, condition: "" }
    ];

    // Recent Admissions Log (Module 1)
    let recentAdmissions = [
        { id: 901, name: "Marcus Aurelius", age: 58, severity: 2, condition: "Hypertensive Crisis", bed: "Bed 101", timeStr: "14:15" },
        { id: 902, name: "Clara Oswald", age: 28, severity: 4, condition: "Sprained Ankle", bed: "Bed 103", timeStr: "14:30" }
    ];

    // DOM Elements Hook
    const queueTableBody = document.getElementById('queueTableBody');
    const criticalWaitCount = document.getElementById('criticalWaitCount');
    const totalWaitCount = document.getElementById('totalWaitCount');
    const availableBedsStat = document.getElementById('availableBedsStat');
    
    // Modal Controls (Register Patient)
    const regModal = document.getElementById('regModal');
    const openRegModalBtn = document.getElementById('openRegModal');
    const closeRegModalBtn = document.getElementById('closeRegModal');
    const cancelRegBtn = document.getElementById('cancelRegBtn');
    const registerForm = document.getElementById('registerForm');
    const admitBtn = document.getElementById('admitBtn');

    // Ward Advisor Modal Hooks
    const bedsStatCard = document.getElementById('bedsStatCard');
    const wardDetailsModal = document.getElementById('wardDetailsModal');
    const closeWardDetailsModal = document.getElementById('closeWardDetailsModal');
    const closeWardDetailsBtn = document.getElementById('closeWardDetailsBtn');
    const wardBedsContainer = document.getElementById('wardBedsContainer');

    // Snippets Hooks
    const bedsGrid = document.getElementById('bedsGrid');
    const recentAdmissionsList = document.getElementById('recentAdmissionsList');
    const patientSearchInput = document.getElementById('patientSearchInput');

    // Toggle Toggles
    const toggleSound = document.getElementById('toggleSound');
    const toggleAutoBeds = document.getElementById('toggleAutoBeds');

    // Severity Text mapping
    const getSeverityText = (level) => {
        const labels = {
            1: "L1 (Immediate)",
            2: "L2 (Emergent)",
            3: "L3 (Urgent)",
            4: "L4 (Less Urgent)",
            5: "L5 (Non-Urgent)"
        };
        return labels[level] || `Level ${level}`;
    };

    // Web Audio Synthesizer (Chime for critical cases)
    function playEmergencyChime() {
        if (!toggleSound || !toggleSound.checked) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12);
            
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.45);
        } catch (e) {
            console.warn("Audio Context blocked or unsupported:", e);
        }
    }

    // Render floor bed grid directory
    function renderBeds() {
        if (!bedsGrid) return;
        bedsGrid.innerHTML = '';
        
        let availableCount = 0;

        beds.forEach(bed => {
            const cell = document.createElement('div');
            cell.className = `bed-cell ${bed.status.toLowerCase()}`;
            
            let statusIndicator = `<span class="bed-status-dot"></span>`;
            let bodyHTML = '';

            if (bed.status === "Occupied") {
                bodyHTML = `
                    <div class="bed-header">
                        <span class="bed-no">${bed.name}</span>
                        ${statusIndicator}
                    </div>
                    <span class="bed-occupant">${bed.patient}</span>
                    <span class="bed-desc-text">${getSeverityText(bed.severity)}</span>
                `;
            } else {
                availableCount++;
                bodyHTML = `
                    <div class="bed-header">
                        <span class="bed-no">${bed.name}</span>
                        ${statusIndicator}
                    </div>
                    <span class="bed-occupant" style="opacity: 0.4; font-style: italic;">Empty Bed</span>
                    <span class="bed-desc-text">Ready for Intake</span>
                `;
            }

            cell.innerHTML = bodyHTML;
            bedsGrid.appendChild(cell);
        });

        // Update Stat Box
        if (availableBedsStat) {
            availableBedsStat.innerHTML = `${availableCount} <span class="stat-unit">/ ${beds.length}</span>`;
        }
    }

    // Render Ward Details Modal List (Early Discharge Advisor)
    function renderWardDetails() {
        if (!wardBedsContainer) return;
        wardBedsContainer.innerHTML = '';

        beds.forEach(bed => {
            const row = document.createElement('div');
            row.className = `ward-bed-row ${bed.status.toLowerCase()}`;

            let labelHTML = `
                <div class="ward-bed-label">
                    <span class="ward-bed-icon">🛏</span>
                    <span class="ward-bed-name">${bed.name}</span>
                </div>
            `;

            let infoHTML = '';
            let advisorHTML = '';
            let actionHTML = '';

            if (bed.status === "Occupied") {
                let stagingText = '';
                let stagingClass = '';
                let stagingDesc = '';
                let btnClass = '';
                let btnDisabled = '';
                let btnLabel = '';

                // Safe Early Discharge Assessment Staging Rules based on clinical severity
                if (bed.severity <= 2) {
                    stagingText = "🛑 Discharge Forbidden";
                    stagingClass = "forbidden";
                    stagingDesc = "Critical emergency case. Continuous physiological monitoring required.";
                    btnClass = "disabled";
                    btnDisabled = "disabled";
                    btnLabel = "Discharge Prohibited";
                } else if (bed.severity === 3) {
                    stagingText = "⚠️ Conditional Release";
                    stagingClass = "conditional";
                    stagingDesc = "Stable but urgent condition. Can relocate if bed is needed for critical emergency intakes.";
                    btnClass = "eligible-amber";
                    btnDisabled = "";
                    btnLabel = "Safe Relocation";
                } else {
                    stagingText = "✅ Safe Early Discharge";
                    stagingClass = "safe";
                    stagingDesc = "Low-severity triage level. Early release highly recommended to optimize ER bed capacity.";
                    btnClass = "eligible-green";
                    btnDisabled = "";
                    btnLabel = "Authorize Release";
                }

                infoHTML = `
                    <div class="ward-patient-info">
                        <span class="ward-patient-name">${bed.patient} (${bed.age} yrs)</span>
                        <span class="ward-patient-meta">${bed.condition}</span>
                    </div>
                `;

                advisorHTML = `
                    <div class="ward-advisor-cell">
                        <span class="ward-advisor-status ${stagingClass}">${stagingText}</span>
                        <span class="ward-advisor-desc">${stagingDesc}</span>
                    </div>
                `;

                actionHTML = `
                    <div class="ward-action-cell">
                        <button class="btn-discharge-advisor ${btnClass}" ${btnDisabled} onclick="dischargeBed(${bed.id})">
                            ${btnLabel}
                        </button>
                    </div>
                `;
            } else {
                infoHTML = `
                    <div class="ward-patient-info">
                        <span class="empty-bed-status">Ready for Patient Placement</span>
                        <span class="ward-patient-meta">Intake capacity available</span>
                    </div>
                `;

                advisorHTML = `
                    <div class="ward-advisor-cell">
                        <span class="ward-advisor-status safe">✅ Available Capacity</span>
                        <span class="ward-advisor-desc">Available for immediate clinical staging allocation.</span>
                    </div>
                `;

                actionHTML = `
                    <div class="ward-action-cell">
                        <button class="btn-discharge-advisor disabled" disabled>Bed is Empty</button>
                    </div>
                `;
            }

            row.innerHTML = labelHTML + infoHTML + advisorHTML + actionHTML;
            wardBedsContainer.appendChild(row);
        });
    }

    // Render Recent Admissions List (with filter support)
    function renderRecentAdmissions(filterText = '') {
        if (!recentAdmissionsList) return;
        recentAdmissionsList.innerHTML = '';

        const filtered = recentAdmissions.filter(item => 
            item.name.toLowerCase().includes(filterText.toLowerCase()) ||
            item.condition.toLowerCase().includes(filterText.toLowerCase()) ||
            item.bed.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            recentAdmissionsList.innerHTML = `<div class="empty-records-msg">No matching admissions found.</div>`;
            return;
        }

        filtered.forEach(item => {
            const div = document.createElement('div');
            div.className = 'admission-item';
            div.innerHTML = `
                <div class="admission-info">
                    <span class="admission-name">${item.name} (${item.age})</span>
                    <span class="admission-time">Admitted ${item.timeStr} &middot; ${item.condition}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="admission-bed">${item.bed}</span>
                    <button class="btn-discharge-mini" onclick="dischargePatient(${item.id})">Release</button>
                </div>
            `;
            recentAdmissionsList.appendChild(div);
        });
    }

    // Render Analytics Severity Breakdown Chart
    function updateAnalytics() {
        const severityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        queue.forEach(p => {
            if (severityCounts[p.severity] !== undefined) {
                severityCounts[p.severity]++;
            }
        });

        const maxVal = Math.max(...Object.values(severityCounts), 1);

        for (let i = 1; i <= 5; i++) {
            const bar = document.getElementById(`barL${i}`);
            if (bar) {
                const count = severityCounts[i];
                const pct = Math.max((count / maxVal) * 85, 4); 
                bar.style.height = `${pct}%`;
                bar.setAttribute('title', `${count} patient(s) in queue`);
            }
        }
    }

    // Render Main Patients Queue Table
    function renderQueue() {
        queue.sort((a, b) => {
            if (a.severity !== b.severity) return a.severity - b.severity;
            return b.waitTime - a.waitTime; 
        });

        queueTableBody.innerHTML = '';
        let criticalCount = 0;

        if (queue.length === 0) {
            queueTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-light); font-style: italic;">No active patients waiting in the triage queue.</td></tr>`;
        } else {
            queue.forEach(p => {
                if (p.severity <= 2) criticalCount++;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <span class="badge sev-${p.severity}">${getSeverityText(p.severity)}</span>
                    </td>
                    <td class="patient-name-container">
                        <strong>${p.name}</strong>
                        <span class="patient-id-badge">ID: #${p.id}</span>
                    </td>
                    <td style="font-weight: 500;">${p.age} yrs</td>
                    <td style="color: var(--text-muted); font-size: 0.85rem;">${p.condition}</td>
                    <td style="font-weight: 700; color: ${p.waitTime > 30 ? 'var(--color-l1)' : 'var(--text-charcoal)'};">
                        ${p.waitTime} mins
                    </td>
                    <td style="text-align: right;">
                        <button class="btn-table-action" onclick="admitPatient(${p.id})">Admit Patient</button>
                    </td>
                `;
                queueTableBody.appendChild(tr);
            });
        }

        if (totalWaitCount) totalWaitCount.textContent = queue.length;
        if (criticalWaitCount) criticalWaitCount.textContent = criticalCount;

        updateAnalytics();
    }

    // Global Admit Patient function
    window.admitPatient = function(id) {
        const patientIndex = queue.findIndex(p => p.id === id);
        if (patientIndex === -1) return;

        const patient = queue[patientIndex];
        
        let assignedBed = null;
        if (toggleAutoBeds && toggleAutoBeds.checked) {
            const freeBed = beds.find(b => b.status === "Available");
            if (freeBed) {
                freeBed.status = "Occupied";
                freeBed.patient = patient.name;
                freeBed.age = patient.age;
                freeBed.severity = patient.severity;
                freeBed.condition = patient.condition;
                assignedBed = freeBed;
            }
        }

        const timeNow = new Date();
        const timeStr = `${String(timeNow.getHours()).padStart(2, '0')}:${String(timeNow.getMinutes()).padStart(2, '0')}`;
        
        recentAdmissions.unshift({
            id: patient.id,
            name: patient.name,
            age: patient.age,
            severity: patient.severity,
            condition: patient.condition,
            bed: assignedBed ? assignedBed.name : "Overflow Ward",
            timeStr: timeStr
        });

        queue.splice(patientIndex, 1);
        
        renderQueue();
        renderBeds();
        renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
        renderWardDetails();
    };

    // Global Discharge/Release Patient from Ward (Mini Button)
    window.dischargePatient = function(id) {
        const index = recentAdmissions.findIndex(a => a.id === id);
        if (index === -1) return;
        
        const record = recentAdmissions[index];

        const occupiedBed = beds.find(b => b.name === record.bed && b.status === "Occupied");
        if (occupiedBed) {
            occupiedBed.status = "Available";
            occupiedBed.patient = "";
            occupiedBed.age = 0;
            occupiedBed.severity = 0;
            occupiedBed.condition = "";
        }

        recentAdmissions.splice(index, 1);

        renderBeds();
        renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
        renderWardDetails();
    };

    // Global Discharge Patient from Ward Advisor Modal Row
    window.dischargeBed = function(bedId) {
        const bed = beds.find(b => b.id === bedId && b.status === "Occupied");
        if (!bed) return;

        // Clean up from recent admissions log
        const admissionIndex = recentAdmissions.findIndex(a => a.bed === bed.name);
        if (admissionIndex !== -1) {
            recentAdmissions.splice(admissionIndex, 1);
        }

        // Release the bed
        bed.status = "Available";
        bed.patient = "";
        bed.age = 0;
        bed.severity = 0;
        bed.condition = "";

        renderBeds();
        renderQueue();
        renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
        renderWardDetails();
    };

    // Modal Control Handlers (Register Patient)
    if (openRegModalBtn) {
        openRegModalBtn.addEventListener('click', () => {
            regModal.classList.add('active');
        });
    }

    const closeModal = () => {
        if (regModal) {
            regModal.classList.remove('active');
            registerForm.reset();
        }
    };

    if (closeRegModalBtn) closeRegModalBtn.addEventListener('click', closeModal);
    if (cancelRegBtn) cancelRegBtn.addEventListener('click', closeModal);

    // Modal Control Handlers (Ward Directory & Advisor)
    if (bedsStatCard && wardDetailsModal) {
        bedsStatCard.addEventListener('click', () => {
            renderWardDetails();
            wardDetailsModal.classList.add('active');
        });
    }

    const closeWardModal = () => {
        if (wardDetailsModal) {
            wardDetailsModal.classList.remove('active');
        }
    };

    if (closeWardDetailsModal) closeWardDetailsModal.addEventListener('click', closeWardModal);
    if (closeWardDetailsBtn) closeWardDetailsBtn.addEventListener('click', closeWardModal);

    // Form Submit (Registering patient)
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newSeverity = parseInt(document.getElementById('pSeverity').value);
            const newPatient = {
                id: Math.floor(Math.random() * 9000) + 1000,
                name: document.getElementById('pName').value,
                age: parseInt(document.getElementById('pAge').value),
                severity: newSeverity,
                condition: document.getElementById('pCondition').value,
                waitTime: 0
            };

            queue.push(newPatient);
            
            if (newSeverity <= 2) {
                playEmergencyChime();
            }

            closeModal();
            renderQueue();
        });
    }

    // Bulk Admit Next Priority button
    if (admitBtn) {
        admitBtn.addEventListener('click', () => {
            if (queue.length > 0) {
                const nextPatient = queue[0];
                admitPatient(nextPatient.id);
            } else {
                alert('Triage wait queue is currently empty.');
            }
        });
    }

    // Mini search bar input listener
    if (patientSearchInput) {
        patientSearchInput.addEventListener('input', (e) => {
            renderRecentAdmissions(e.target.value);
        });
    }

    // Increment wait times
    setInterval(() => {
        queue = queue.map(p => ({ ...p, waitTime: p.waitTime + 1 }));
        renderQueue();
    }, 10000);

    // Initial Dashboard Launch Staging
    renderQueue();
    renderBeds();
    renderRecentAdmissions();
});
