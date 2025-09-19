document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyB_bP3_aclWvt7d6nnEgyW93zT6MvgiUxw",
        authDomain: "smart-india-hackathon-886f9.firebaseapp.com",
        projectId: "smart-india-hackathon-886f9",
        storageBucket: "smart-india-hackathon-886f9.firebasestorage.app",
        messagingSenderId: "599601482698",
        appId: "1:599601482698:web:091a27f50d18ed4652dd33",
        measurementId: "G-J0BYSMRSY0"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- DOM ELEMENT REFERENCES ---
    const loaderOverlay = document.getElementById('loader-overlay');
    const workerNameEl = document.getElementById('worker-name');
    const logoutBtn = document.getElementById('logout-btn');
    const primarySidebar = document.getElementById('primary-sidebar');
    const headerTitle = document.getElementById('header-title');
    const dashboardMain = document.getElementById('dashboard-main');
    const vaccineManagementMain = document.getElementById('vaccine-management-main');
    const sendAlertMain = document.getElementById('send-alert-main');
    
    // Dashboard View Elements
    const familyListContainer = document.getElementById('family-list-container');
    const addFamilyForm = document.getElementById('add-family-form');
    const familyEmailInput = document.getElementById('family-email-input');
    const requestStatusMsg = document.getElementById('request-status-msg');
    const detailsView = document.getElementById('details-view');
    const placeholderView = detailsView.querySelector('.placeholder');
    const familyDetailsContent = document.getElementById('family-details-content');
    const memberSelect = document.getElementById('member-select');
    const memberDetailsContainer = document.getElementById('member-details-container');

    // Vaccine Management View Elements
    const addVaccineForm = document.getElementById('add-vaccine-form');
    const defaultScheduleContainer = document.getElementById('default-schedule-container');

    // Send Alert View Elements
    const sendAlertForm = document.getElementById('send-alert-form');
    const alertStatusMsg = document.getElementById('alert-status-msg');
    const locationInputContainer = document.getElementById('location-input-container');
    const userInputContainer = document.getElementById('user-input-container');
    const alertLocationInput = document.getElementById('alert-location');
    const recentAlertsList = document.getElementById('recent-alerts-list');

    // --- STATE VARIABLES ---
    let defaultVaccineSchedule = {};
    let currentFamilyId = null;
    let currentFamilyMembers = [];

    // --- INITIAL VACCINE DATA FOR SEEDING ---
    const initialVaccineSchedule = {
        'At Birth': { ageGroup: 'At Birth', displayOrder: 1, timeValue: 0, timeUnit: 'days', vaccines: [{ name: 'BCG', protectsAgainst: 'Tuberculosis' }, { name: 'OPV 0', protectsAgainst: 'Poliomyelitis' }, { name: 'Hepatitis B - 1', protectsAgainst: 'Hepatitis B' }] },
        '6 Weeks': { ageGroup: '6 Weeks', displayOrder: 2, timeValue: 6, timeUnit: 'weeks', vaccines: [{ name: 'DTwP 1', protectsAgainst: 'Diphtheria, Tetanus, Pertussis' }, { name: 'IPV 1', protectsAgainst: 'Poliomyelitis' }, { name: 'Hepatitis B - 2', protectsAgainst: 'Hepatitis B' }, { name: 'HiB 1', protectsAgainst: 'Haemophilus influenzae type b' }, { name: 'Rotavirus 1', protectsAgainst: 'Rotavirus diarrhea' }, { name: 'PCV 1', protectsAgainst: 'Pneumococcal disease' }] },
        '10 Weeks': { ageGroup: '10 Weeks', displayOrder: 3, timeValue: 10, timeUnit: 'weeks', vaccines: [{ name: 'DTwP 2', protectsAgainst: 'Diphtheria, Tetanus, Pertussis' }, { name: 'IPV 2', protectsAgainst: 'Poliomyelitis' }, { name: 'HiB 2', protectsAgainst: 'Haemophilus influenzae type b' }, { name: 'Rotavirus 2', protectsAgainst: 'Rotavirus diarrhea' }] },
        '14 Weeks': { ageGroup: '14 Weeks', displayOrder: 4, timeValue: 14, timeUnit: 'weeks', vaccines: [{ name: 'DTwP 3', protectsAgainst: 'Diphtheria, Tetanus, Pertussis' }, { name: 'IPV 3', protectsAgainst: 'Poliomyelitis' }, { name: 'HiB 3', protectsAgainst: 'Haemophilus influenzae type b' }, { name: 'Rotavirus 3', protectsAgainst: 'Rotavirus diarrhea' }, { name: 'PCV 2', protectsAgainst: 'Pneumococcal disease' }] },
    };

    // --- INITIALIZATION ---
    auth.onAuthStateChanged(user => {
        if (user) {
            initializeDashboard(user);
        } else {
            window.location.href = 'index.html';
        }
    });

    async function initializeDashboard(user) {
        await checkWorkerRoleAndLoadDashboard(user);
        await fetchDefaultSchedule();
        initializePlacesAutocomplete();
        loadRecentAlerts();
    }

    async function checkWorkerRoleAndLoadDashboard(user) {
        try {
            const userDocRef = db.collection('users').doc(user.uid);
            const doc = await userDocRef.get();
            if (doc.exists && doc.data().role === 'worker') {
                workerNameEl.textContent = user.displayName || user.email;
                loadAssignedFamilies(user.uid);
            } else {
                throw new Error('Access Denied. This portal is for authorized ASHA workers only.');
            }
        } catch (error) {
            alert(error.message);
            await auth.signOut();
        } finally {
            loaderOverlay.classList.add('hidden');
        }
    }

    // --- DATA FETCHING & SEEDING ---
    async function seedDefaultSchedule() {
        console.log("Database empty. Seeding initial vaccine schedule...");
        const batch = db.batch();
        for (const [ageGroupId, ageGroupData] of Object.entries(initialVaccineSchedule)) {
            const { vaccines, ...groupData } = ageGroupData;
            const ageGroupRef = db.collection('defaultVaccineSchedule').doc(ageGroupId);
            batch.set(ageGroupRef, groupData);
            vaccines.forEach(vaccine => {
                const vaccineRef = ageGroupRef.collection('vaccines').doc();
                batch.set(vaccineRef, vaccine);
            });
        }
        await batch.commit();
        console.log("Seeding complete.");
    }

    async function fetchDefaultSchedule() {
        try {
            const scheduleCollection = db.collection('defaultVaccineSchedule');
            const scheduleSnapshot = await scheduleCollection.get();

            if (scheduleSnapshot.empty) {
                await seedDefaultSchedule();
            }

            const updatedSnapshot = await scheduleCollection.orderBy('displayOrder').get();
            const schedule = {};
            for (const doc of updatedSnapshot.docs) {
                const ageGroupData = doc.data();
                const vaccinesSnapshot = await doc.ref.collection('vaccines').get();
                schedule[doc.id] = {
                    ...ageGroupData,
                    vaccines: vaccinesSnapshot.docs.map(vaccineDoc => ({ id: vaccineDoc.id, ...vaccineDoc.data() }))
                };
            }
            defaultVaccineSchedule = schedule;
        } catch (error) {
            console.error("Error fetching/seeding schedule:", error);
            alert("Could not load the vaccine schedule from the database.");
        }
    }

    // --- VIEW SWITCHING ---
    primarySidebar.addEventListener('click', (e) => {
        const link = e.target.closest('.primary-nav-link');
        if (!link || link.id === 'logout-btn') return;
        
        primarySidebar.querySelectorAll('.primary-nav-link.active').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const view = link.dataset.view;
        if (view === 'dashboard') showDashboardView();
        else if (view === 'vaccine-management') showVaccineManagementView();
        else if (view === 'alerts') showSendAlertView();
        else alert(link.title);
    });
    
    function showDashboardView() {
        headerTitle.textContent = "Remedi Dashboard";
        vaccineManagementMain.classList.add('hidden');
        sendAlertMain.classList.add('hidden');
        dashboardMain.classList.remove('hidden');
    }

    function showVaccineManagementView() {
        headerTitle.textContent = "Vaccine Schedule Management";
        dashboardMain.classList.add('hidden');
        sendAlertMain.classList.add('hidden');
        vaccineManagementMain.classList.remove('hidden');
        renderDefaultScheduleEditor();
    }

    function showSendAlertView() {
        headerTitle.textContent = "Send Health Alert";
        dashboardMain.classList.add('hidden');
        vaccineManagementMain.classList.add('hidden');
        sendAlertMain.classList.remove('hidden');
        loadRecentAlerts(); // Refresh alerts list when viewing the page
    }
    
    // --- DASHBOARD: FAMILY MANAGEMENT ---
    function loadAssignedFamilies(workerUid) {
        db.collection('users').where('assignedWorker', '==', workerUid).onSnapshot(querySnapshot => {
            familyListContainer.innerHTML = querySnapshot.empty ? '<p style="padding: 16px;">No families assigned.</p>' : '';
            querySnapshot.forEach(doc => {
                const family = doc.data();
                const familyEl = document.createElement('div');
                familyEl.className = 'family-item';
                familyEl.dataset.familyId = doc.id;
                familyEl.innerHTML = `<h3>${family.displayName || 'Unnamed Family'}</h3><small>${family.email}</small>`;
                familyEl.addEventListener('click', () => {
                    document.querySelectorAll('.family-item.active').forEach(el => el.classList.remove('active'));
                    familyEl.classList.add('active');
                    loadFamilyDetails(doc.id);
                });
                familyListContainer.appendChild(familyEl);
            });
        }, error => console.error("Error listening to families:", error));
    }

    async function loadFamilyDetails(familyId) {
        currentFamilyId = familyId;
        familyDetailsContent.classList.add('hidden');
        placeholderView.innerHTML = '<div class="loader-small" style="margin-top: 100px;"></div>';
        placeholderView.classList.remove('hidden');

        try {
            const membersSnapshot = await db.collection('users').doc(familyId).collection('familyMembers').get();
            if (membersSnapshot.empty) {
                placeholderView.innerHTML = '<i class="fa-solid fa-users"></i><p>This family has no members registered.</p>';
                return;
            }
            currentFamilyMembers = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            memberSelect.innerHTML = currentFamilyMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
            
            placeholderView.classList.add('hidden');
            familyDetailsContent.classList.remove('hidden');
            await renderMemberDetails(currentFamilyMembers[0].id);
        } catch (error) {
            console.error("Error loading family details:", error);
            placeholderView.innerHTML = `<p style="color: var(--color-danger);">Could not load details.<br><small>${error.message}</small></p>`;
        }
    }

    async function renderMemberDetails(memberId) {
        const member = currentFamilyMembers.find(m => m.id === memberId);
        if (!member) return;
        memberDetailsContainer.innerHTML = '<div class="loader-small"></div>';
        const vaccineSnapshot = await db.collection('users').doc(currentFamilyId).collection('familyMembers').doc(memberId).collection('vaccinations').get();
        const completedVaccines = new Map(vaccineSnapshot.docs.map(doc => [doc.id, doc.data()]));
        memberDetailsContainer.innerHTML = `
            <div class="member-card">
                <div class="member-header">
                    <h4>${member.name}</h4>
                    <span class="member-info">${member.relation} - ${calculateAge(member.dob)} years old</span>
                </div>
                ${generateVaccineTableForMember(member, completedVaccines)}
            </div>`;
    }

    function generateVaccineTableForMember(member, completedVaccines) {
        let tableHtml = `<table class="vaccine-table"><thead><tr><th></th><th>Age Group</th><th>Vaccine</th><th>Status</th></tr></thead><tbody>`;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dob = new Date(member.dob);
        
        for (const [ageGroupId, ageGroupData] of Object.entries(defaultVaccineSchedule)) {
            for (const vaccine of ageGroupData.vaccines) {
                const vaccineId = `${vaccine.name.replace(/[^a-zA-Z0-9]/g, '')}_${ageGroupId.replace(/[^a-zA-Z0-9]/g, '')}`;
                const isCompleted = completedVaccines.has(vaccineId) && completedVaccines.get(vaccineId).completed;
                let status = '<span class="status-completed">Completed</span>';
                
                if (!isCompleted) {
                    const dueDate = getDueDate(dob, { value: ageGroupData.timeValue, unit: ageGroupData.timeUnit });
                    status = (today > dueDate) ? '<span class="status-due">Overdue</span>' : '<span class="status-upcoming">Upcoming</span>';
                }
                tableHtml += `
                    <tr>
                        <td><input type="checkbox" class="vaccine-checkbox" data-vaccine-id="${vaccineId}" ${isCompleted ? 'checked' : ''}></td>
                        <td>${ageGroupData.ageGroup}</td><td>${vaccine.name}</td><td class="status-cell">${status}</td>
                    </tr>`;
            }
        }
        return tableHtml + `</tbody></table>`;
    }

    memberSelect.addEventListener('change', (e) => renderMemberDetails(e.target.value));
    memberDetailsContainer.addEventListener('change', async (e) => {
        if (!e.target.classList.contains('vaccine-checkbox')) return;
        const checkbox = e.target;
        try {
            const docRef = db.collection('users').doc(currentFamilyId).collection('familyMembers').doc(memberSelect.value).collection('vaccinations').doc(checkbox.dataset.vaccineId);
            const updateData = { completed: checkbox.checked, dateGiven: checkbox.checked ? new Date().toISOString().split('T')[0] : firebase.firestore.FieldValue.delete() };
            await docRef.set(updateData, { merge: true });
            await renderMemberDetails(memberSelect.value);
        } catch (error) {
            console.error("Error updating vaccine status:", error);
            alert("Failed to update vaccine status.");
            checkbox.checked = !checkbox.checked;
        }
    });
    
    // --- VACCINE MANAGEMENT VIEW ---
    function renderDefaultScheduleEditor() {
        defaultScheduleContainer.innerHTML = '';
        if (Object.keys(defaultVaccineSchedule).length === 0) {
            defaultScheduleContainer.innerHTML = '<p>No default vaccines found. Add one using the form above.</p>';
            return;
        }
        for (const [ageGroupId, ageGroupData] of Object.entries(defaultVaccineSchedule)) {
            const groupEl = document.createElement('div');
            groupEl.className = 'schedule-age-group';
            let vaccinesHtml = `<h4>${ageGroupData.ageGroup}</h4>`;
            ageGroupData.vaccines.forEach(vaccine => {
                vaccinesHtml += `
                    <div class="schedule-vaccine-item">
                        <div><p>${vaccine.name}</p><small>${vaccine.protectsAgainst}</small></div>
                        <button class="delete-vaccine-btn" data-age-group-id="${ageGroupId}" data-vaccine-id="${vaccine.id}" title="Delete Vaccine"><i class="fa-solid fa-trash-can"></i></button>
                    </div>`;
            });
            groupEl.innerHTML = vaccinesHtml;
            defaultScheduleContainer.appendChild(groupEl);
        }
    }

    addVaccineForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ageGroup = document.getElementById('vaccine-age-group').value.trim();
        const vaccineName = document.getElementById('vaccine-name').value.trim();
        const protectsAgainst = document.getElementById('vaccine-protects').value.trim();
        if (!ageGroup || !vaccineName || !protectsAgainst) return alert("All fields are required.");
        
        try {
            const ageGroupRef = db.collection('defaultVaccineSchedule').doc(ageGroup);
            await ageGroupRef.collection('vaccines').add({ name: vaccineName, protectsAgainst });
            await ageGroupRef.set({ ageGroup, displayOrder: 99, timeValue: 0, timeUnit: 'years' }, { merge: true }); // Basic data for new group
            alert("Vaccine added successfully!");
            addVaccineForm.reset();
            await fetchDefaultSchedule();
            renderDefaultScheduleEditor();
        } catch (error) {
            console.error("Error adding vaccine:", error);
            alert("Failed to add vaccine.");
        }
    });

    defaultScheduleContainer.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-vaccine-btn');
        if (!deleteBtn) return;
        const { ageGroupId, vaccineId } = deleteBtn.dataset;
        if (confirm(`Are you sure you want to delete this vaccine from the "${ageGroupId}" schedule?`)) {
            try {
                await db.collection('defaultVaccineSchedule').doc(ageGroupId).collection('vaccines').doc(vaccineId).delete();
                alert("Vaccine deleted.");
                await fetchDefaultSchedule();
                renderDefaultScheduleEditor();
            } catch (error) {
                console.error("Error deleting vaccine:", error);
                alert("Failed to delete vaccine.");
            }
        }
    });

    // --- SEND ALERT VIEW ---
    function initializePlacesAutocomplete() {
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            console.error("Google Maps script not loaded yet.");
            return;
        }
        const autocomplete = new google.maps.places.Autocomplete(alertLocationInput, {
            types: ['(regions)'],
            componentRestrictions: { 'country': 'in' }
        });
        autocomplete.setFields(['name']);
    }

    sendAlertForm.addEventListener('change', (e) => {
        if (e.target.name === 'alert-target') {
            locationInputContainer.classList.toggle('hidden', e.target.value !== 'location');
            userInputContainer.classList.toggle('hidden', e.target.value !== 'user');
        }
    });

    sendAlertForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('alert-title').value.trim();
        const message = document.getElementById('alert-message').value.trim();
        const worker = auth.currentUser;

        if (!title || !message || !worker) {
            return alert("Title and message are required.");
        }

        const targetType = sendAlertForm.querySelector('input[name="alert-target"]:checked').value;
        let targetValue = null;

        if (targetType === 'location') {
            targetValue = alertLocationInput.value.trim();
            if (!targetValue) return alert("Location is required for location-specific alerts.");
        } else if (targetType === 'user') {
            targetValue = document.getElementById('alert-user-email').value.trim();
            if (!targetValue) return alert("User email is required for user-specific alerts.");
        }

        const submitBtn = sendAlertForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        alertStatusMsg.textContent = '';
        alertStatusMsg.className = '';

        try {
            await db.collection('globalAlerts').add({
                title,
                message,
                senderName: worker.displayName || 'ASHA Worker',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                target: {
                    type: targetType,
                    value: targetValue
                }
            });
            
            alertStatusMsg.textContent = 'Alert sent successfully!';
            alertStatusMsg.classList.add('success');
            sendAlertForm.reset();
            sendAlertForm.querySelector('input[name="alert-target"][value="all"]').checked = true;
            locationInputContainer.classList.add('hidden');
            userInputContainer.classList.add('hidden');

        } catch (error) {
            console.error("Error sending alert:", error);
            alertStatusMsg.textContent = 'Failed to send alert. Please try again.';
            alertStatusMsg.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Alert';
            setTimeout(() => { alertStatusMsg.textContent = ''; }, 5000);
        }
    });

    function loadRecentAlerts() {
        const alertsQuery = db.collection('globalAlerts').orderBy('createdAt', 'desc').limit(10);

        alertsQuery.onSnapshot(snapshot => {
            if (snapshot.empty) {
                recentAlertsList.innerHTML = '<p>No recent alerts found.</p>';
                return;
            }
            recentAlertsList.innerHTML = '';
            snapshot.forEach(doc => {
                const alert = doc.data();
                const alertEl = document.createElement('div');
                alertEl.className = 'alert-item';

                const date = alert.createdAt ? alert.createdAt.toDate().toLocaleString() : 'N/A';
                
                let targetInfo = '<i class="fa-solid fa-globe"></i> All Users';
                if (alert.target.type === 'location') {
                    targetInfo = `<i class="fa-solid fa-map-marker-alt"></i> Location: ${alert.target.value}`;
                } else if (alert.target.type === 'user') {
                    targetInfo = `<i class="fa-solid fa-user"></i> User: ${alert.target.value}`;
                }

                alertEl.innerHTML = `
                    <div class="alert-item-header">
                        <p class="alert-item-title">${alert.title}</p>
                        <span class="alert-item-date">${date}</span>
                    </div>
                    <p class="alert-item-message">${alert.message}</p>
                    <p class="alert-item-target">${targetInfo}</p>
                `;
                recentAlertsList.appendChild(alertEl);
            });
        }, error => {
            console.error("Error fetching recent alerts:", error);
            recentAlertsList.innerHTML = '<p style="color: var(--color-danger);">Could not load alerts.</p>';
        });
    }
    
    // --- EVENT LISTENERS & UTILS ---
    addFamilyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const targetEmail = familyEmailInput.value.trim();
        const worker = auth.currentUser;
        if (!targetEmail || !worker) return;
        const submitBtn = addFamilyForm.querySelector('button');
        submitBtn.disabled = true;
        requestStatusMsg.textContent = 'Sending...';
        try {
            const userQuery = await db.collection('users').where('email', '==', targetEmail).limit(1).get();
            if (userQuery.empty) throw new Error("User not found.");
            await db.collection('accessRequests').add({
                workerUid: worker.uid,
                workerName: worker.displayName || worker.email,
                userUid: userQuery.docs[0].id,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            requestStatusMsg.textContent = 'Request sent!';
            requestStatusMsg.classList.add('success');
            familyEmailInput.value = '';
        } catch (error) {
            requestStatusMsg.textContent = error.message;
            requestStatusMsg.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            setTimeout(() => { requestStatusMsg.textContent = ''; requestStatusMsg.className = ''; }, 4000);
        }
    });

    logoutBtn.addEventListener('click', () => auth.signOut());

    function getDueDate(dob, time) {
        let date = new Date(dob);
        const value = time.value || 0;
        switch (time.unit) {
            case 'weeks': date.setDate(date.getDate() + value * 7); break;
            case 'months': date.setMonth(date.getMonth() + value); break;
            case 'days': date.setDate(date.getDate() + value); break;
        }
        return date;
    }

    function calculateAge(dobString) {
        if (!dobString) return 'N/A';
        return Math.abs(new Date(Date.now() - new Date(dobString).getTime()).getUTCFullYear() - 1970);
    }
});
