document.addEventListener('DOMContentLoaded', () => {
    // Current ATTENDING Doctor (defaults to Dr. Smith)
    let currentDoctor = "Dr. Smith";
    let currentDoctorRole = "Attending ER";
    let currentDoctorDept = "Emergency Medicine";

    // Initial State - Active Queue
    let queue = [
        { id: 1001, name: "John Doe", age: 45, severity: 1, condition: "Cardiac Arrest", waitTime: 4 },
        { id: 1002, name: "Jane Smith", age: 22, severity: 3, condition: "Fractured Radius", waitTime: 25 },
        { id: 1003, name: "Robert Johnson", age: 68, severity: 2, condition: "Severe Chest Pain", waitTime: 12 },
        { id: 1004, name: "Emily Davis", age: 34, severity: 5, condition: "Minor Laceration", waitTime: 85 }
    ];

    // Bed Directory State with Full Metadata (Module 2 & Advisor & Attending Details)
    let beds = [
        { id: 101, name: "Bed 101", status: "Occupied", patient: "Marcus Aurelius", age: 58, severity: 2, condition: "Hypertensive Crisis", admittedAt: "14:15", attendingDoctor: "Dr. Smith" },
        { id: 102, name: "Bed 102", status: "Available", patient: "", age: 0, severity: 0, condition: "", admittedAt: "", attendingDoctor: "" },
        { id: 103, name: "Bed 103", status: "Occupied", patient: "Clara Oswald", age: 28, severity: 4, condition: "Sprained Ankle", admittedAt: "14:30", attendingDoctor: "Dr. House" },
        { id: 104, name: "Bed 104", status: "Available", patient: "", age: 0, severity: 0, condition: "", admittedAt: "", attendingDoctor: "" },
        { id: 105, name: "Bed 105", status: "Available", patient: "", age: 0, severity: 0, condition: "", admittedAt: "", attendingDoctor: "" },
        { id: 106, name: "Bed 106", status: "Available", patient: "", age: 0, severity: 0, condition: "", admittedAt: "", attendingDoctor: "" }
    ];

    // Recent Admissions Log (Module 1) - Persisted to LocalStorage
    let recentAdmissions = [];
    const storedAdmissions = localStorage.getItem('dsa_recentAdmissions');
    if (storedAdmissions) {
        recentAdmissions = JSON.parse(storedAdmissions);
    } else {
        recentAdmissions = [
            { id: 901, name: "Marcus Aurelius", age: 58, severity: 2, condition: "Hypertensive Crisis", bed: "Bed 101", timeStr: "14:15", attendingDoctor: "Dr. Smith", status: "Active" },
            { id: 902, name: "Clara Oswald", age: 28, severity: 4, condition: "Sprained Ankle", bed: "Bed 103", timeStr: "14:30", attendingDoctor: "Dr. House", status: "Active" }
        ];
        localStorage.setItem('dsa_recentAdmissions', JSON.stringify(recentAdmissions));
    }

    // Clinical Events Timeline (Module 5) with Weekday scheduling
    let selectedCalendarDay = 'Mon';
    let events = [
        { id: 'E1', patientName: 'Marcus Aurelius', type: 'MRI', title: 'Brain CT Scan (Hypertensive Staging)', time: '15:30', doctor: 'Dr. House', priority: 'Urgent', status: 'upcoming', day: 'Mon' },
        { id: 'E2', patientName: 'Clara Oswald', type: 'Lab Test', title: 'X-Ray of Right Ankle', time: '16:00', doctor: 'Dr. Smith', priority: 'Stable', status: 'upcoming', day: 'Mon' },
        { id: 'E3', patientName: 'Marcus Aurelius', type: 'Surgery', title: 'Cardiac Bypass Procedure', time: '10:00', doctor: 'Dr. Smith', priority: 'Critical', status: 'upcoming', day: 'Tue' },
        { id: 'E4', patientName: 'Jane Smith', type: 'Consultation', title: 'Orthopedic Fracture Review', time: '14:00', doctor: 'Dr. Smith', priority: 'Urgent', status: 'upcoming', day: 'Wed' },
        { id: 'E5', patientName: 'Robert Johnson', type: 'Imaging', title: 'Chest Ultrasound Scan', time: '11:30', doctor: 'Dr. House', priority: 'Stable', status: 'upcoming', day: 'Thu' }
    ];

    // Transaction Undo Stack (Module 6)
    let undoStack = [];

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

    // Procedure Scheduler Modal Hooks (Module 5)
    const eventModal = document.getElementById('eventModal');
    const openAddEventBtn = document.getElementById('openAddEventBtn');
    const viewActiveEventsBtn = document.getElementById('viewActiveEventsBtn');
    const closeEventModalBtn = document.getElementById('closeEventModal');
    const cancelEventBtn = document.getElementById('cancelEventBtn');
    const eventForm = document.getElementById('eventForm');
    const eventPatientSelect = document.getElementById('eventPatientSelect');
    const eventsTimelineList = document.getElementById('eventsTimelineList');

    // Transaction & DSA Hooks (Module 6)
    const triggerUndoBtn = document.getElementById('triggerUndoBtn');
    const undoStackList = document.getElementById('undoStackList');
    const binaryHeapVisual = document.getElementById('binaryHeapVisual');

    // Doctor Profile Modals
    const userProfileWidget = document.querySelector('.user-profile');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    const profileForm = document.getElementById('profileForm');
    const staffDepartmentSelect = document.getElementById('staffDepartment');
    const staffDoctorRoleSelect = document.getElementById('staffDoctorRole');
    const specialtyPatientList = document.getElementById('specialtyPatientList');
    const activeDocRoleBadge = document.getElementById('activeDocRoleBadge');

    // Bed Attending Console Modal
    const bedConsoleModal = document.getElementById('bedConsoleModal');
    const closeBedConsoleModal = document.getElementById('closeBedConsoleModal');
    const closeBedConsoleBtn = document.getElementById('closeBedConsoleBtn');
    const bedConsolePatientName = document.getElementById('bedConsolePatientName');
    const bedConsoleSeverityBadge = document.getElementById('bedConsoleSeverityBadge');
    const bedConsoleIssue = document.getElementById('bedConsoleIssue');
    const bedConsoleTime = document.getElementById('bedConsoleTime');
    const bedConsoleDoctor = document.getElementById('bedConsoleDoctor');
    const btnSendTraumaCode = document.getElementById('btnSendTraumaCode');
    const traumaConsoleLog = document.getElementById('traumaConsoleLog');

    // Snippets Hooks
    const bedsGrid = document.getElementById('bedsGrid');
    const recentAdmissionsList = document.getElementById('recentAdmissionsList');
    const patientSearchInput = document.getElementById('patientSearchInput');

    // Toggle Toggles
    const toggleSound = document.getElementById('toggleSound');
    const toggleAutoBeds = document.getElementById('toggleAutoBeds');

    // Extract initials from doctor name (updates DS avatar)
    function getInitials(name) {
        let clean = name.replace(/^(dr|mr|ms|mrs|prof)\.?\s+/i, '').trim();
        let parts = clean.split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        } else if (parts.length === 1 && parts[0].length >= 2) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return "DS";
    }

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

    // Web Audio Synthesizer Sawtooth emergency siren for trauma paging
    function playTraumaSiren() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            let count = 0;
            const interval = setInterval(() => {
                if (count >= 5) {
                    clearInterval(interval);
                    return;
                }
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(count % 2 === 0 ? 800 : 1100, ctx.currentTime);
                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
                count++;
            }, 350);
        } catch (e) {
            console.warn("Audio Context unsupported:", e);
        }
    }

    // Push Transaction on to the Stacking Undo Log
    function pushTransaction(action) {
        if (undoStack.length >= 8) {
            undoStack.shift(); // Bound memory to 8 actions
        }
        undoStack.push(action);
        renderUndoStack();
    }

    // Render visual transaction logger
    function renderUndoStack() {
        if (!undoStackList) return;
        
        if (undoStack.length === 0) {
            undoStackList.innerHTML = `[STACK EMPTY] No transactions recorded.`;
            return;
        }

        undoStackList.innerHTML = undoStack.map((act, idx) => {
            let label = '';
            switch(act.type) {
                case 'register': label = `REG: ${act.data.name} (L${act.data.severity})`; break;
                case 'admit': label = `ADMIT: ${act.data.patient.name} ➔ ${act.data.bedName}`; break;
                case 'discharge': label = `RELEASE: ${act.data.admissionRecord.name} (${act.data.bedName})`; break;
                case 'schedule_event': label = `SCHED: ${act.data.type} (${act.data.patientName})`; break;
                case 'toggle_event_status': label = `STATUS: ${act.data.type} ➔ ${act.data.newStatus.toUpperCase()}`; break;
                case 'trauma_code': label = `TRAUMA: ${act.data.specialist} reassigned to ${act.data.bedName}`; break;
            }
            const isTop = (idx === undoStack.length - 1) ? ' <b style="color: #ffedd5;">(ACTIVE)</b>' : '';
            return `[${idx + 1}] ${label}${isTop}`;
        }).reverse().join('<br>');
    }

    // Roll back last transaction (Transactional Pop)
    function triggerUndo() {
        if (undoStack.length === 0) {
            alert("No recent operations to undo.");
            return;
        }

        const action = undoStack.pop();
        renderUndoStack();

        switch (action.type) {
            case 'register':
                // Remove patient from wait queue
                queue = queue.filter(p => p.id !== action.data.id);
                renderQueue();
                break;
                
            case 'admit':
                // Return patient to wait queue
                queue.push(action.data.patient);
                
                // Restore bed state
                const bed = beds.find(b => b.name === action.data.bedName);
                if (bed) {
                    bed.status = "Available";
                    bed.patient = "";
                    bed.age = 0;
                    bed.severity = 0;
                    bed.condition = "";
                    bed.admittedAt = "";
                    bed.attendingDoctor = "";
                }
                
                // Remove from recent admissions log
                recentAdmissions = recentAdmissions.filter(a => a.id !== action.data.patient.id);
                localStorage.setItem('dsa_recentAdmissions', JSON.stringify(recentAdmissions));
                
                renderQueue();
                renderBeds();
                renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
                renderWardDetails();
                break;
                
            case 'discharge':
                // Re-activate the patient's record in recent admissions
                const undoAdmIndex = recentAdmissions.findIndex(a => a.id === action.data.admissionRecord.id);
                if (undoAdmIndex !== -1) {
                    recentAdmissions[undoAdmIndex].status = "Active";
                } else {
                    recentAdmissions.unshift(action.data.admissionRecord);
                }
                localStorage.setItem('dsa_recentAdmissions', JSON.stringify(recentAdmissions));
                
                // Re-occupy the bed
                const dischargeBed = beds.find(b => b.name === action.data.bedName);
                if (dischargeBed) {
                    dischargeBed.status = "Occupied";
                    dischargeBed.patient = action.data.admissionRecord.name;
                    dischargeBed.age = action.data.admissionRecord.age;
                    dischargeBed.severity = action.data.admissionRecord.severity;
                    dischargeBed.condition = action.data.admissionRecord.condition;
                    dischargeBed.admittedAt = action.data.admissionRecord.timeStr;
                    dischargeBed.attendingDoctor = action.data.admissionRecord.attendingDoctor || currentDoctor;
                }
                
                renderQueue();
                renderBeds();
                renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
                renderWardDetails();
                break;
                
            case 'schedule_event':
                // Remove the scheduled event
                events = events.filter(e => e.id !== action.data.id);
                renderEvents();
                break;
                
            case 'toggle_event_status':
                // Restore old status
                const ev = events.find(e => e.id === action.data.eventId);
                if (ev) {
                    ev.status = action.data.oldStatus;
                    renderEvents();
                }
                break;

            case 'trauma_code':
                // Revert attending doctor back to previous
                const traumaBed = beds.find(b => b.id === action.data.bedId);
                if (traumaBed) {
                    traumaBed.attendingDoctor = action.data.oldDoctor;
                }
                const traumaAdm = recentAdmissions.find(a => a.bed === action.data.bedName);
                if (traumaAdm) {
                    traumaAdm.attendingDoctor = action.data.oldDoctor;
                }
                renderBeds();
                renderWardDetails();
                renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
                break;
        }
        renderSpecialtyDutyPanel();
    }

    // Render floor bed grid directory
    function renderBeds() {
        if (!bedsGrid) return;
        bedsGrid.innerHTML = '';
        
        let availableCount = 0;

        beds.forEach(bed => {
            const cell = document.createElement('div');
            cell.className = `bed-cell ${bed.status.toLowerCase()}`;
            cell.style.cursor = "pointer";
            
            // Allow clicking on any bed cell inside Module 2 directory grid to open the emergency ward details modal
            cell.addEventListener('click', () => {
                renderWardDetails();
                if (wardDetailsModal) {
                    wardDetailsModal.classList.add('active');
                }
            });

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
                    <span class="ward-bed-name" style="font-weight: 800; color: var(--color-terracotta);">${bed.name}</span>
                </div>
            `;

            let infoHTML = '';
            let advisorHTML = '';
            let actionHTML = '';

            if (bed.status === "Occupied") {
                // Make the entire row act as a clickable tab
                row.style.cursor = "pointer";
                row.title = "Click tab to view attending physician, time log, or call specialists";
                row.addEventListener('click', (e) => {
                    if (e.target.closest('.ward-action-cell') || e.target.closest('.btn-discharge-advisor')) {
                        return; // Prevent modal opening when clicking discharge action
                    }
                    openBedConsole(bed.id);
                });

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
                    btnLabel = "Safe Discharge";
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

    // Interactive Attending Bed Console Modal popup launcher
    window.openBedConsole = function(bedId) {
        const bed = beds.find(b => b.id === bedId);
        if (!bed || bed.status !== "Occupied") return;

        // Populate Modal Fields
        document.getElementById('bedConsoleTitle').textContent = `${bed.name} - Attending Details`;
        bedConsolePatientName.textContent = `${bed.patient} (${bed.age} yrs)`;
        bedConsoleSeverityBadge.className = `badge sev-${bed.severity}`;
        bedConsoleSeverityBadge.textContent = getSeverityText(bed.severity);
        bedConsoleIssue.textContent = bed.condition;
        bedConsoleTime.textContent = bed.admittedAt || "14:15";
        bedConsoleDoctor.textContent = bed.attendingDoctor || currentDoctor;

        // Reset trauma broadcast terminal
        traumaConsoleLog.style.display = "none";
        traumaConsoleLog.innerHTML = "";
        
        // Remove old click listeners from Trauma Broadcast button by querying the live element
        const currentBtn = document.getElementById('btnSendTraumaCode');
        const newBtn = currentBtn.cloneNode(true);
        currentBtn.parentNode.replaceChild(newBtn, currentBtn);
        
        const traumaNotice = newBtn.previousElementSibling; // The <p> notice description element

        // Show Send Trauma Code only when severity is dire (Level 1 or Level 2)
        if (bed.severity <= 2) {
            newBtn.style.display = "inline-flex";
            if (traumaNotice) {
                traumaNotice.innerHTML = "If the attending shift physician is unavailable or a high-acuity crisis occurs, broadcast an emergency trauma call to locate the nearest specialist.";
                traumaNotice.style.color = "";
                traumaNotice.style.fontWeight = "";
            }
        } else {
            newBtn.style.display = "none";
            if (traumaNotice) {
                traumaNotice.innerHTML = "🏥 Patient is currently clinically stable. Trauma broadcast alert paging is deactivated for low-acuity cases.";
                traumaNotice.style.color = "var(--color-sage-light)";
                traumaNotice.style.fontWeight = "700";
            }
        }
        
        // Attach click action to trigger emergency trauma logs
        newBtn.addEventListener('click', () => {
            triggerTraumaBroadcast(bed);
        });

        // Toggle Modal Active CSS class
        bedConsoleModal.classList.add('active');
    };

    // Automated trauma paging simulation with custom department specialist matching
    function triggerTraumaBroadcast(bed) {
        playTraumaSiren();
        traumaConsoleLog.style.display = "block";
        traumaConsoleLog.innerHTML = `[0.0s] 🚨 BROADCASTING CODE RED EMERGENCY PAGING TO ALL HOSPITAL DEPARTMENTS...<br>`;
        
        // Determine specialist matching based on chief patient condition
        let dept = "General Trauma";
        let specialist = "Dr. Allison Cameron";
        const cond = bed.condition.toLowerCase();

        if (cond.includes("cardiac") || cond.includes("chest") || cond.includes("heart")) {
            dept = "Cardiology Division";
            specialist = "Dr. Robert Chase (Cardiologist)";
        } else if (cond.includes("fracture") || cond.includes("ankle") || cond.includes("sprained") || cond.includes("bone")) {
            dept = "Orthopedics & Joint Trauma";
            specialist = "Dr. James Wilson (Orthopedist)";
        } else if (cond.includes("hypertensive") || cond.includes("stroke") || cond.includes("brain") || cond.includes("crisis")) {
            dept = "Critical Care & Neurology Specialist";
            specialist = "Dr. Eric Foreman (Neurologist)";
        }

        const logLines = [
            { t: 750, txt: `[0.8s] 📡 Clinical priority triggered: [${bed.condition}]. Paging on-call ${dept}...` },
            { t: 1500, txt: `[1.6s] 🛰️ Pinged pagers: scanning floor responder GPS coordinates inside hospital perimeter...` },
            { t: 2250, txt: `[2.4s] 🩺 Specialists check: Dr. House (In ICU), Dr. Cuddy (Consulting), Dr. Cameron (On Call)...` },
            { t: 3000, txt: `[3.2s] ⚡ Specialist Responder Accepted alert! ${specialist} is en route to ER.` },
            { t: 3800, txt: `[4.0s] 🔄 Attending Physician successfully re-assigned to <b>${specialist}</b>.` }
        ];

        logLines.forEach(line => {
            setTimeout(() => {
                traumaConsoleLog.innerHTML += line.txt + "<br>";
                traumaConsoleLog.scrollTop = traumaConsoleLog.scrollHeight;
                
                // End of simulation action updates
                if (line.t === 3800) {
                    const oldDoctor = bed.attendingDoctor || currentDoctor;
                    
                    // Reassign states
                    bed.attendingDoctor = specialist;
                    bedConsoleDoctor.textContent = specialist;

                    // Sync changes with recent admissions list record
                    const adm = recentAdmissions.find(a => a.bed === bed.name);
                    if (adm) {
                        adm.attendingDoctor = specialist;
                    }

                    // Push transaction on to Undo Stack
                    pushTransaction({
                        type: 'trauma_code',
                        data: {
                            bedId: bed.id,
                            bedName: bed.name,
                            oldDoctor: oldDoctor,
                            specialist: specialist
                        }
                    });

                    // Update layouts
                    renderBeds();
                    renderWardDetails();
                    renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
                }
            }, line.t);
        });
    }

    // Close Bed Attending Console Modal
    const closeConsole = () => {
        bedConsoleModal.classList.remove('active');
        traumaConsoleLog.style.display = "none";
    };
    if (closeBedConsoleModal) closeBedConsoleModal.addEventListener('click', closeConsole);
    if (closeBedConsoleBtn) closeBedConsoleBtn.addEventListener('click', closeConsole);

    // Mapped Roles by Attending Specialty Department
    const departmentRoles = {
        "Emergency Medicine": [
            "Junior ER Resident",
            "Assistant ER Physician",
            "Chief ER Resident",
            "Head ER Director"
        ],
        "Cardiology": [
            "Junior Cardiologist",
            "Assistant Cardiologist",
            "Consultant Cardiologist",
            "Head Cardiologist & Surgeon"
        ],
        "Trauma Surgery": [
            "Junior Trauma Fellow",
            "Assistant Trauma Surgeon",
            "Chief Trauma Surgeon",
            "Head of Trauma Surgery"
        ],
        "Neurology": [
            "Junior Neurologist",
            "Assistant Neurophysician",
            "Consulting Neurosurgeon",
            "Head of Neurology"
        ],
        "Orthopedics": [
            "Junior Orthopedic Resident",
            "Assistant Orthopedic Surgeon",
            "Chief Orthopedic Surgeon",
            "Head of Orthopedic Trauma"
        ]
    };

    function populateRolesForDepartment(deptVal) {
        if (!staffDoctorRoleSelect) return;
        staffDoctorRoleSelect.innerHTML = '';
        const roles = departmentRoles[deptVal] || ["Attending ER"];
        roles.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role;
            opt.textContent = role;
            staffDoctorRoleSelect.appendChild(opt);
        });
    }

    if (staffDepartmentSelect) {
        staffDepartmentSelect.addEventListener('change', (e) => {
            populateRolesForDepartment(e.target.value);
        });
    }

    // Click attending login header widget to toggle Profile Modal editor
    if (userProfileWidget) {
        userProfileWidget.addEventListener('click', () => {
            // Fill current inputs
            document.getElementById('staffDoctorName').value = currentDoctor;
            
            const dept = currentDoctorDept || "Emergency Medicine";
            if (staffDepartmentSelect) staffDepartmentSelect.value = dept;
            
            populateRolesForDepartment(dept);
            if (staffDoctorRoleSelect) staffDoctorRoleSelect.value = currentDoctorRole;
            
            profileModal.classList.add('active');
        });
    }

    const closeProfile = () => {
        profileModal.classList.remove('active');
        profileForm.reset();
    };
    if (closeProfileModal) closeProfileModal.addEventListener('click', closeProfile);
    if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', closeProfile);

    // Profile form submit updates credentials
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('staffDoctorName').value.trim();
            const newDept = staffDepartmentSelect ? staffDepartmentSelect.value : "Emergency Medicine";
            const newRole = staffDoctorRoleSelect ? staffDoctorRoleSelect.value : "Attending ER";

            if (newName && newRole) {
                currentDoctor = newName;
                currentDoctorRole = newRole;
                currentDoctorDept = newDept;

                // Sync header DOM text elements
                document.querySelector('.user-info strong').textContent = newName;
                document.querySelector('.user-info span').textContent = `${newRole} (${newDept})`;
                
                // Automatically generate initials
                const initialText = getInitials(newName);
                document.querySelector('.avatar').textContent = initialText;

                // Re-render Specialty Rota list with new credentials
                renderSpecialtyDutyPanel();

                closeProfile();
            }
        });
    }

    // Render backing Binary Heap Visualizer (Module 6 DSA feature)
    function renderBinaryHeap() {
        if (!binaryHeapVisual) return;
        binaryHeapVisual.innerHTML = '';

        if (queue.length === 0) {
            binaryHeapVisual.innerHTML = `<span style="opacity: 0.5; font-style: italic;">Wait queue is empty. Heap is unpopulated.</span>`;
            return;
        }

        queue.forEach((p, idx) => {
            const pill = document.createElement('div');
            pill.className = `heap-node-pill l${p.severity}`;
            pill.innerHTML = `[${idx}] ${p.name.split(' ')[0]} (L${p.severity})`;
            pill.setAttribute('data-index', idx);
            
            // Mouse event listeners for interactive parent-child highlighting
            pill.addEventListener('mouseenter', () => {
                highlightHeapNode(idx);
            });
            pill.addEventListener('mouseleave', () => {
                clearHeapHighlights();
            });

            binaryHeapVisual.appendChild(pill);
        });
    }

    // Parent-child heap node highlighting
    function highlightHeapNode(index) {
        const pills = document.querySelectorAll('.heap-node-pill');
        pills.forEach(p => p.style.opacity = '0.35'); // Dim all nodes

        // Target self
        const selfPill = document.querySelector(`.heap-node-pill[data-index="${index}"]`);
        if (selfPill) {
            selfPill.style.opacity = '1';
            selfPill.style.transform = 'scale(1.1)';
            selfPill.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.4)';
        }

        // Highlight Parent Math index: Math.floor((index - 1) / 2)
        if (index > 0) {
            const parentIdx = Math.floor((index - 1) / 2);
            const parentPill = document.querySelector(`.heap-node-pill[data-index="${parentIdx}"]`);
            if (parentPill) {
                parentPill.style.opacity = '1';
                parentPill.style.borderColor = '#60a5fa'; // Blue
                parentPill.style.boxShadow = '0 0 10px rgba(96, 165, 250, 0.6)';
                parentPill.innerHTML = `[${parentIdx}] Parent: ${queue[parentIdx].name.split(' ')[0]} (L${queue[parentIdx].severity})`;
            }
        }

        // Highlight Left Child index: 2 * index + 1
        const leftIdx = 2 * index + 1;
        if (leftIdx < queue.length) {
            const leftPill = document.querySelector(`.heap-node-pill[data-index="${leftIdx}"]`);
            if (leftPill) {
                leftPill.style.opacity = '1';
                leftPill.style.borderColor = '#fbbf24'; // Yellow
                leftPill.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.6)';
                leftPill.innerHTML = `[${leftIdx}] L-Child: ${queue[leftIdx].name.split(' ')[0]} (L${queue[leftIdx].severity})`;
            }
        }

        // Highlight Right Child index: 2 * index + 2
        const rightIdx = 2 * index + 2;
        if (rightIdx < queue.length) {
            const rightPill = document.querySelector(`.heap-node-pill[data-index="${rightIdx}"]`);
            if (rightPill) {
                rightPill.style.opacity = '1';
                rightPill.style.borderColor = '#f59e0b'; // Amber
                rightPill.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.6)';
                rightPill.innerHTML = `[${rightIdx}] R-Child: ${queue[rightIdx].name.split(' ')[0]} (L${queue[rightIdx].severity})`;
            }
        }
    }

    // Reset Highlights
    function clearHeapHighlights() {
        const pills = document.querySelectorAll('.heap-node-pill');
        pills.forEach((p, idx) => {
            p.style.opacity = '1';
            p.style.transform = 'none';
            p.style.boxShadow = 'none';
            p.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            const pObj = queue[idx];
            if (pObj) {
                p.innerHTML = `[${idx}] ${pObj.name.split(' ')[0]} (L${pObj.severity})`;
            }
        });
    }

    // Render Clinical Events Timeline (Module 5) filtered by selected calendar day
    function renderEvents() {
        if (!eventsTimelineList) return;
        eventsTimelineList.innerHTML = '';

        const filtered = events.filter(ev => ev.day === selectedCalendarDay);

        if (filtered.length === 0) {
            eventsTimelineList.innerHTML = `<div class="empty-records-msg" style="padding: 0.5rem; font-size: 0.88rem; opacity: 0.85;">No clinical procedures scheduled for ${selectedCalendarDay}day.</div>`;
            return;
        }

        filtered.forEach(ev => {
            const item = document.createElement('div');
            item.className = `event-timeline-item priority-${ev.priority.toLowerCase()}`;
            
            let statusText = ev.status.toUpperCase();
            
            item.innerHTML = `
                <div class="event-info-block">
                    <span class="event-title-line">${ev.type}: ${ev.title}</span>
                    <span class="event-meta-line">Patient: <b>${ev.patientName}</b> &middot; Doc: ${ev.doctor} &middot; Scheduled: ${ev.time}</span>
                </div>
                <button class="event-status-badge ${ev.status.toLowerCase()}" onclick="toggleEventStatus('${ev.id}')">
                    ${statusText}
                </button>
            `;
            eventsTimelineList.appendChild(item);
        });
    }

    // Toggle event status (Upcoming -> Ongoing -> Completed)
    window.toggleEventStatus = function(eventId) {
        const ev = events.find(e => e.id === eventId);
        if (!ev) return;

        const oldStatus = ev.status;
        let newStatus = 'upcoming';

        if (oldStatus === 'upcoming') newStatus = 'ongoing';
        else if (oldStatus === 'ongoing') newStatus = 'completed';
        else newStatus = 'upcoming';

        ev.status = newStatus;

        pushTransaction({
            type: 'toggle_event_status',
            data: { eventId: eventId, oldStatus: oldStatus, newStatus: newStatus, type: ev.type }
        });

        renderEvents();
    };

    // Populate admitted patients dropdown inside Event Scheduler Form
    function populateAdmittedPatientsDropdown() {
        if (!eventPatientSelect) return;
        eventPatientSelect.innerHTML = '';

        if (recentAdmissions.length === 0) {
            const opt = document.createElement('option');
            opt.value = "";
            opt.textContent = "No patients currently admitted";
            eventPatientSelect.appendChild(opt);
            return;
        }

        recentAdmissions.forEach(patient => {
            const opt = document.createElement('option');
            opt.value = patient.name;
            opt.textContent = `${patient.name} (${patient.bed})`;
            eventPatientSelect.appendChild(opt);
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
                    <span class="admission-time">Admitted ${item.timeStr} &middot; Doc: <b>${item.attendingDoctor || currentDoctor}</b> &middot; ${item.condition}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="admission-bed">${item.bed}</span>
                    ${item.status === 'Discharged' ? `<span class="badge badge-success" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background-color: var(--color-sage); color: white; border-radius: 4px;">Released</span>` : `<button class="btn-discharge-mini" onclick="dischargePatient(${item.id})">Release</button>`}
                </div>
            `;
            recentAdmissionsList.appendChild(div);
        });
    }

    // Render Analytics Severity Breakdown Chart
    function updateAnalytics() {
        const severityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        // Count triage waitlist queue patients
        queue.forEach(p => {
            if (severityCounts[p.severity] !== undefined) {
                severityCounts[p.severity]++;
            }
        });

        // Count admitted patients in ward beds
        beds.forEach(b => {
            if (b.status === "Occupied" && severityCounts[b.severity] !== undefined) {
                severityCounts[b.severity]++;
            }
        });

        const maxVal = Math.max(...Object.values(severityCounts), 1);

        for (let i = 1; i <= 5; i++) {
            const bar = document.getElementById(`barL${i}`);
            if (bar) {
                const count = severityCounts[i];
                const pct = Math.max((count / maxVal) * 85, 4); 
                bar.style.height = `${pct}%`;
                bar.setAttribute('title', `${count} patient(s) total`);
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
                    <td style="color: var(--text-muted); font-size: 0.95rem;">${p.condition}</td>
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
        renderBinaryHeap();
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
                
                const timeNow = new Date();
                const timeStr = `${String(timeNow.getHours()).padStart(2, '0')}:${String(timeNow.getMinutes()).padStart(2, '0')}`;
                
                freeBed.admittedAt = timeStr;
                freeBed.attendingDoctor = currentDoctor;
                assignedBed = freeBed;
            }
        }

        const timeNow = new Date();
        const timeStr = `${String(timeNow.getHours()).padStart(2, '0')}:${String(timeNow.getMinutes()).padStart(2, '0')}`;
        
        const admissionRecord = {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            severity: patient.severity,
            condition: patient.condition,
            bed: assignedBed ? assignedBed.name : "Overflow Ward",
            timeStr: timeStr,
            attendingDoctor: currentDoctor,
            status: "Active"
        };

        recentAdmissions.unshift(admissionRecord);
        localStorage.setItem('dsa_recentAdmissions', JSON.stringify(recentAdmissions));

        // Record Undo Transaction
        pushTransaction({
            type: 'admit',
            data: {
                patient: { ...patient },
                bedName: assignedBed ? assignedBed.name : "Overflow Ward"
            }
        });

        queue.splice(patientIndex, 1);
        
        renderQueue();
        renderBeds();
        renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
        renderWardDetails();
        renderSpecialtyDutyPanel();
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
            occupiedBed.admittedAt = "";
            occupiedBed.attendingDoctor = "";
        }

        // Record Undo Transaction
        pushTransaction({
            type: 'discharge',
            data: {
                admissionRecord: { ...record },
                bedName: record.bed
            }
        });

        recentAdmissions[index].status = "Discharged";
        localStorage.setItem('dsa_recentAdmissions', JSON.stringify(recentAdmissions));

        renderBeds();
        renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
        renderWardDetails();
        renderSpecialtyDutyPanel();
    };

    // Global Discharge Patient from Ward Advisor Modal Row
    window.dischargeBed = function(bedId) {
        const bed = beds.find(b => b.id === bedId && b.status === "Occupied");
        if (!bed) return;

        // Clean up from recent admissions log
        const admissionIndex = recentAdmissions.findIndex(a => a.bed === bed.name && a.status === "Active");
        let record = null;
        if (admissionIndex !== -1) {
            record = recentAdmissions[admissionIndex];
            recentAdmissions[admissionIndex].status = "Discharged";
            localStorage.setItem('dsa_recentAdmissions', JSON.stringify(recentAdmissions));
        }

        // Record Undo Transaction
        if (record) {
            pushTransaction({
                type: 'discharge',
                data: {
                    admissionRecord: { ...record },
                    bedName: bed.name
                }
            });
        }

        // Release the bed
        bed.status = "Available";
        bed.patient = "";
        bed.age = 0;
        bed.severity = 0;
        bed.condition = "";
        bed.admittedAt = "";
        bed.attendingDoctor = "";

        renderBeds();
        renderQueue();
        renderRecentAdmissions(patientSearchInput ? patientSearchInput.value : '');
        renderWardDetails();
        renderSpecialtyDutyPanel();
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

    // Modal Control Handlers (Event Scheduler Module 5)
    if (openAddEventBtn) {
        openAddEventBtn.addEventListener('click', () => {
            populateAdmittedPatientsDropdown();
            if (eventModal) eventModal.classList.add('active');
        });
    }

    const closeEventModal = () => {
        if (eventModal) {
            eventModal.classList.remove('active');
            eventForm.reset();
        }
    };

    if (closeEventModalBtn) closeEventModalBtn.addEventListener('click', closeEventModal);
    if (cancelEventBtn) cancelEventBtn.addEventListener('click', closeEventModal);

    // Flashing Animation for Timeline list
    if (viewActiveEventsBtn) {
        viewActiveEventsBtn.addEventListener('click', () => {
            renderEvents();
            if (eventsTimelineList) {
                eventsTimelineList.style.transform = 'scale(1.03)';
                eventsTimelineList.style.transition = 'transform 0.2s';
                setTimeout(() => {
                    eventsTimelineList.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }

    // Refresh button for Clinical Analytics (Module 3)
    const btnRefreshAnalytics = document.getElementById('btnRefreshAnalytics');
    if (btnRefreshAnalytics) {
        btnRefreshAnalytics.addEventListener('click', () => {
            const icon = btnRefreshAnalytics.querySelector('.spin-icon');
            if (icon) {
                icon.style.transform = 'rotate(360deg)';
                icon.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                setTimeout(() => {
                    icon.style.transform = 'none';
                    icon.style.transition = 'none';
                }, 600);
            }
            updateAnalytics();
        });
    }

    // Trigger Undo Action
    if (triggerUndoBtn) {
        triggerUndoBtn.addEventListener('click', () => {
            triggerUndo();
        });
    }

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

            // Record Undo Transaction
            pushTransaction({
                type: 'register',
                data: { ...newPatient }
            });
            
            if (newSeverity <= 2) {
                playEmergencyChime();
            }

            closeModal();
            renderQueue();
        });
    }

    // Form Submit (Scheduling Event Module 5)
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const pSelect = document.getElementById('eventPatientSelect');
            if (pSelect.value === "") {
                alert("Please select a valid admitted patient first.");
                return;
            }

            const newEvent = {
                id: 'E' + Date.now(),
                patientName: pSelect.value,
                type: document.getElementById('eventType').value,
                priority: document.getElementById('eventPriority').value,
                time: document.getElementById('eventTime').value,
                doctor: document.getElementById('eventDoctor').value,
                title: document.getElementById('eventTitle').value,
                status: 'upcoming',
                day: selectedCalendarDay
            };

            events.unshift(newEvent);

            // Record Undo Transaction
            pushTransaction({
                type: 'schedule_event',
                data: { ...newEvent }
            });

            closeEventModal();
            renderEvents();
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

    // List of realistic clinical patient complaints mapped by triage priority level
    const mockComplaints = {
        1: ["Cardiac Arrest", "Anaphylaxis & Shock", "Severe Respiratory Failure", "Major Trauma & Hemorrhage"],
        2: ["Severe Chest Pain", "Hypertensive Crisis", "Acute Dyspnea", "Compound Fracture with Bleeding"],
        3: ["Fractured Radius", "Severe Dehydration", "Acute Abdominal Pain", "High Fever with Chills"],
        4: ["Sprained Ankle", "Severe Migraine Headache", "Moderate Asthma Flare-up", "Deep Laceration"],
        5: ["Minor Laceration", "Sore Throat & Cough", "Mild Skin Rash", "Low-grade Fever"]
    };

    const mockNames = [
        "James Carter", "Maria Gonzalez", "Sarah Jenkins", "David Chen", 
        "Aisha Rahman", "Liam O'Connor", "Elena Petrova", "Bruce Wayne", 
        "Selina Kyle", "Arthur Dent", "Diana Prince", "Peter Parker",
        "Wanda Maximoff", "Tony Stark", "Steve Rogers", "Natasha Romanoff"
    ];

    function showIntakeToast(patient) {
        const toast = document.createElement('div');
        toast.className = `intake-toast ${patient.severity <= 2 ? 'critical' : ''}`;
        
        let icon = patient.severity <= 2 ? '🚨' : '🏥';
        toast.innerHTML = `
            <span style="font-size: 1.5rem;">${icon}</span>
            <div>
                <div style="font-weight: 800; font-size: 1.05rem; margin-bottom: 0.15rem; color: var(--text-charcoal);">New Patient Intake</div>
                <div style="font-weight: 500; font-size: 0.88rem; opacity: 0.85; color: var(--text-charcoal);">
                    ${patient.name} (${patient.age} yrs) &middot; ${getSeverityText(patient.severity)}
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    // Keep on adding a new patient every 1 minute (60000 ms)
    setInterval(() => {
        const randomSeverity = Math.floor(Math.random() * 5) + 1; // Triage Level 1 to 5
        const name = mockNames[Math.floor(Math.random() * mockNames.length)];
        const age = Math.floor(Math.random() * 68) + 18; // Age 18 to 85
        
        const complaintsForSev = mockComplaints[randomSeverity];
        const condition = complaintsForSev[Math.floor(Math.random() * complaintsForSev.length)];

        const newSimPatient = {
            id: Math.floor(Math.random() * 9000) + 1000,
            name: name,
            age: age,
            severity: randomSeverity,
            condition: condition,
            waitTime: 0
        };

        queue.push(newSimPatient);

        // Record Undo Transaction
        pushTransaction({
            type: 'register',
            data: { ...newSimPatient }
        });

        // Trigger Sound Alert for Critical L1/L2
        if (randomSeverity <= 2) {
            playEmergencyChime();
        }

        // Show toast alert
        showIntakeToast(newSimPatient);

        renderQueue();
    }, 60000);

    // Render Attending Specialist Patient Rota List (Module 5 Specialty integration)
    function renderSpecialtyDutyPanel() {
        if (!specialtyPatientList) return;
        specialtyPatientList.innerHTML = '';
        
        // Update Doctor badge in card header
        if (activeDocRoleBadge) {
            activeDocRoleBadge.textContent = currentDoctorRole;
        }

        // Filter active patients assigned to beds whose condition matches active department
        const matchingBeds = beds.filter(bed => {
            if (bed.status !== "Occupied") return false;
            
            const dept = currentDoctorDept.toLowerCase();
            const cond = bed.condition.toLowerCase();
            
            if (dept.includes("emergency")) {
                return true; // ER matches all conditions
            } else if (dept.includes("cardiology")) {
                return cond.includes("cardiac") || cond.includes("chest") || cond.includes("heart") || cond.includes("angina") || cond.includes("hypertensive");
            } else if (dept.includes("trauma")) {
                return cond.includes("trauma") || cond.includes("bleeding") || cond.includes("gunshot") || cond.includes("laceration") || cond.includes("stab") || cond.includes("wound") || cond.includes("fracture");
            } else if (dept.includes("neurology")) {
                return cond.includes("hypertensive") || cond.includes("stroke") || cond.includes("brain") || cond.includes("neurological") || cond.includes("migraine") || cond.includes("headache");
            } else if (dept.includes("orthopedics")) {
                return cond.includes("fracture") || cond.includes("sprained") || cond.includes("ankle") || cond.includes("bone") || cond.includes("joint") || cond.includes("radius") || cond.includes("back");
            }
            return false;
        });

        if (matchingBeds.length === 0) {
            specialtyPatientList.innerHTML = `
                <div class="empty-records-msg" style="padding: 0.5rem; font-size: 0.88rem; opacity: 0.85;">
                    No pending patients under ${currentDoctorDept} specialty.
                </div>`;
            return;
        }

        matchingBeds.forEach(bed => {
            const item = document.createElement('div');
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.justifyContent = "space-between";
            item.style.background = "rgba(255, 255, 255, 0.08)";
            item.style.padding = "0.45rem 0.65rem";
            item.style.borderRadius = "8px";
            item.style.borderLeft = "4px solid var(--color-terracotta)";
            item.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";

            item.innerHTML = `
                <div style="display: flex; flex-direction: column; text-align: left; gap: 0.15rem;">
                    <span style="font-weight: 800; font-size: 0.92rem; color: white;">
                        ${bed.patient} <span class="badge sev-${bed.severity}" style="font-size: 0.72rem; padding: 0.05rem 0.25rem; font-weight: 800;">L${bed.severity}</span>
                    </span>
                    <span style="font-size: 0.82rem; opacity: 0.85; color: #ffedd5;">
                        Bed: ${bed.name} &middot; ${bed.condition}
                    </span>
                </div>
                <button class="btn-discharge-mini" style="font-size: 0.8rem; padding: 0.2rem 0.5rem; border-color: rgba(255,255,255,0.3); background-color: var(--color-sage-dark); font-weight: 800;" onclick="resolveSpecialistCase(${bed.id})">
                    🩺 Treat Case
                </button>
            `;
            specialtyPatientList.appendChild(item);
        });
    }

    // Web Audio synthesizer tone for successful clinical resolution
    function playTraumaSuccessSound() {
        if (!toggleSound || !toggleSound.checked) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {}
    }

    // Resolve Specialist Case (Discharge patient matching doctor specialty)
    window.resolveSpecialistCase = function(bedId) {
        const bed = beds.find(b => b.id === bedId);
        if (!bed || bed.status !== "Occupied") return;

        const patientData = { ...bed };

        // Execute treatment discharge
        bed.status = "Available";
        bed.patient = "";
        bed.age = 0;
        bed.severity = 0;
        bed.condition = "";
        bed.admittedAt = "";
        bed.attendingDoctor = "";

        // Record Undo Transaction
        pushTransaction({
            type: 'discharge',
            data: { ...patientData }
        });

        // Trigger Success tone
        playTraumaSuccessSound();

        // Show clinical success alert toast
        showIntakeToast({
            name: patientData.patient,
            age: patientData.age,
            severity: 5, // Shows as green non-urgent sage badge style
            condition: "Treated & Relieved by " + currentDoctor
        });

        // Sync view state
        renderBeds();
        renderSpecialtyDutyPanel();
        if (wardDetailsModal.classList.contains('active')) {
            renderWardDetails();
        }
    };

    // Calendar Day selector click filtering
    document.querySelectorAll('.cal-day').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            document.querySelectorAll('.cal-day').forEach(d => {
                d.classList.remove('active');
                d.style.background = 'rgba(255,255,255,0.05)';
                d.style.border = '1px solid rgba(255,255,255,0.1)';
                d.style.fontWeight = '600';
            });
            dayEl.classList.add('active');
            dayEl.style.background = 'rgba(255,255,255,0.2)';
            dayEl.style.border = '1px solid rgba(255,255,255,0.3)';
            dayEl.style.fontWeight = '800';
            
            selectedCalendarDay = dayEl.getAttribute('data-day');
            renderEvents();
        });
    });

    // Initial Dashboard Launch Staging
    renderQueue();
    renderBeds();
    renderRecentAdmissions();
    renderEvents();
    renderUndoStack();
    renderSpecialtyDutyPanel();
});
