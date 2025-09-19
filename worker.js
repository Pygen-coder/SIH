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

    const loaderOverlay = document.getElementById('loader-overlay');
    const workerNameEl = document.getElementById('worker-name');
    const logoutBtn = document.getElementById('logout-btn');
    const familyListContainer = document.getElementById('family-list-container');
    const addFamilyForm = document.getElementById('add-family-form');
    const familyEmailInput = document.getElementById('family-email-input');
    const requestStatusMsg = document.getElementById('request-status-msg');
    const primarySidebar = document.getElementById('primary-sidebar');
    
    // References to the details view and its child containers
    const detailsView = document.getElementById('details-view');
    const placeholderView = detailsView.querySelector('.placeholder');
    const familyDetailsContent = document.getElementById('family-details-content');
    const memberSelect = document.getElementById('member-select');
    const memberDetailsContainer = document.getElementById('member-details-container');

    const vaccinationSchedule = {
        'At Birth': { vaccines: ['BCG', 'OPV 0', 'Hepatitis B - 1'], time: { value: 0, unit: 'days' } },
        '6 Weeks': { vaccines: ['DTwP 1', 'IPV 1', 'Hepatitis B - 2', 'HiB 1', 'Rotavirus 1', 'PCV 1'], time: { value: 6, unit: 'weeks' } },
        '10 Weeks': { vaccines: ['DTwP 2', 'IPV 2', 'HiB 2', 'Rotavirus 2'], time: { value: 10, unit: 'weeks' } },
        '14 Weeks': { vaccines: ['DTwP 3', 'IPV 3', 'HiB 3', 'Rotavirus 3', 'PCV 2'], time: { value: 14, unit: 'weeks' } }
    };

    let currentFamilyId = null;
    let currentFamilyMembers = [];

    auth.onAuthStateChanged(user => {
        if (user) {
            checkWorkerRoleAndLoadDashboard(user);
        } else {
            window.location.href = 'index.html';
        }
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    primarySidebar.addEventListener('click', (e) => {
        const link = e.target.closest('.primary-nav-link');
        if (!link || link.id === 'logout-btn') return;
        const view = link.dataset.view;
        if (view !== 'dashboard') {
            alert(view.charAt(0).toUpperCase() + view.slice(1) + " feature is coming soon!");
            return;
        }
        primarySidebar.querySelectorAll('.primary-nav-link.active').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });

    addFamilyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const targetEmail = familyEmailInput.value.trim();
        const worker = auth.currentUser;
        if (!targetEmail || !worker) return;

        const submitBtn = addFamilyForm.querySelector('button');
        submitBtn.disabled = true;
        requestStatusMsg.textContent = 'Sending...';
        requestStatusMsg.className = '';

        try {
            const usersRef = db.collection('users');
            const userQuery = await usersRef.where('email', '==', targetEmail).limit(1).get();
            if (userQuery.empty) throw new Error("User with this email not found.");

            const userDoc = userQuery.docs[0];
            const requestsRef = db.collection('accessRequests');
            await requestsRef.add({
                workerUid: worker.uid,
                workerName: worker.displayName || worker.email,
                userUid: userDoc.id,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            requestStatusMsg.textContent = 'Request sent successfully!';
            requestStatusMsg.classList.add('success');
            familyEmailInput.value = '';
        } catch (error) {
            requestStatusMsg.textContent = error.message;
            requestStatusMsg.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            setTimeout(() => { requestStatusMsg.textContent = ''; }, 4000);
        }
    });

    async function checkWorkerRoleAndLoadDashboard(user) {
        try {
            const userDocRef = db.collection('users').doc(user.uid);
            const doc = await userDocRef.get();

            if (doc.exists && doc.data().role === 'worker') {
                workerNameEl.textContent = user.displayName || user.email;
                loadAssignedFamilies(user.uid);
            } else {
                alert('Access Denied. This portal is for authorized ASHA workers only.');
                await auth.signOut();
            }
        } catch (error) {
            console.error("Error verifying worker role:", error);
            alert('An error occurred. Please try again.');
            await auth.signOut();
        } finally {
            loaderOverlay.classList.add('hidden');
        }
    }

    function loadAssignedFamilies(workerUid) {
        const query = db.collection('users').where('assignedWorker', '==', workerUid);
        query.onSnapshot(querySnapshot => {
            if (querySnapshot.empty) {
                familyListContainer.innerHTML = '<p style="padding: 16px;">No families assigned.</p>';
                return;
            }
            familyListContainer.innerHTML = '';
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
        }, error => {
            console.error("Error listening to assigned families:", error);
            familyListContainer.innerHTML = `<p style="padding: 16px; color: #ef4444;">Could not load families.</p>`;
        });
    }

    async function loadFamilyDetails(familyId) {
        currentFamilyId = familyId;
        
        // Show loader and hide other views
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

            memberSelect.innerHTML = '';
            currentFamilyMembers.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = member.name;
                memberSelect.appendChild(option);
            });
            
            // Hide placeholder and show the main content view
            placeholderView.classList.add('hidden');
            familyDetailsContent.classList.remove('hidden');
            
            await renderMemberDetails(currentFamilyMembers[0].id);

        } catch (error) {
            console.error("Error loading family details:", error);
            familyDetailsContent.classList.add('hidden');
            placeholderView.innerHTML = `<p style="color: var(--color-danger);">Could not load details.<br><small>${error.message}</small></p>`;
            placeholderView.classList.remove('hidden');
        }
    }
    
    async function renderMemberDetails(memberId) {
        const member = currentFamilyMembers.find(m => m.id === memberId);
        if (!member) return;

        memberDetailsContainer.innerHTML = '<div class="loader-small"></div>';

        const vaccineSnapshot = await db.collection('users').doc(currentFamilyId)
            .collection('familyMembers').doc(memberId).collection('vaccinations').get();
        const completedVaccines = new Map(vaccineSnapshot.docs.map(doc => [doc.id, doc.data()]));

        const detailsHtml = `
            <div class="member-card">
                <div class="member-header">
                    <h4>${member.name}</h4>
                    <span class="member-info">${member.relation} - ${calculateAge(member.dob)} years old</span>
                </div>
                ${generateVaccineTable(member, completedVaccines)}
            </div>`;
        memberDetailsContainer.innerHTML = detailsHtml;
    }

    function generateVaccineTable(member, completedVaccines) {
        let tableHtml = `<table class="vaccine-table"><thead><tr><th></th><th>Age Group</th><th>Vaccine</th><th>Status</th></tr></thead><tbody>`;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dob = new Date(member.dob);
        
        for (const [ageGroup, data] of Object.entries(vaccinationSchedule)) {
            for (const vaccine of data.vaccines) {
                const vaccineId = `${vaccine.replace(/[^a-zA-Z0-9]/g, '')}_${ageGroup.replace(/[^a-zA-Z0-9]/g, '')}`;
                const vaccineRecord = completedVaccines.get(vaccineId);
                const isCompleted = vaccineRecord ? vaccineRecord.completed : false;
                let status = '<span class="status-completed">Completed</span>';
                
                if (!isCompleted) {
                    const dueDate = getDueDate(dob, data.time);
                    if (today > dueDate) {
                        status = '<span class="status-due">Overdue</span>';
                    } else {
                        status = '<span class="status-upcoming">Upcoming</span>';
                    }
                }
                tableHtml += `
                    <tr>
                        <td>
                            <input type="checkbox" class="vaccine-checkbox" data-vaccine-id="${vaccineId}" ${isCompleted ? 'checked' : ''}>
                        </td>
                        <td>${ageGroup}</td>
                        <td>${vaccine}</td>
                        <td class="status-cell">${status}</td>
                    </tr>`;
            }
        }
        tableHtml += `</tbody></table>`;
        return tableHtml;
    }

    memberSelect.addEventListener('change', (e) => {
        renderMemberDetails(e.target.value);
    });

    memberDetailsContainer.addEventListener('change', async (e) => {
        if (!e.target.classList.contains('vaccine-checkbox')) return;
        
        const checkbox = e.target;
        const memberId = memberSelect.value;
        const vaccineId = checkbox.dataset.vaccineId;
        const isCompleted = checkbox.checked;
        
        try {
            const docRef = db.collection('users').doc(currentFamilyId)
                .collection('familyMembers').doc(memberId)
                .collection('vaccinations').doc(vaccineId);

            const updateData = { completed: isCompleted };
            if (isCompleted) {
                updateData.dateGiven = new Date().toISOString().split('T')[0];
            } else {
                updateData.dateGiven = firebase.firestore.FieldValue.delete();
            }

            await docRef.set(updateData, { merge: true });
            
            // Re-render to update status text correctly
            await renderMemberDetails(memberId);

        } catch (error) {
            console.error("Error updating vaccine status:", error);
            alert("Failed to update vaccine status. Please try again.");
            checkbox.checked = !isCompleted; // Revert checkbox on error
        }
    });

    function getDueDate(dob, time) {
        let date = new Date(dob);
        if (time.unit === 'weeks') { date.setDate(date.getDate() + time.value * 7); } 
        else if (time.unit === 'months') { date.setMonth(date.getMonth() + time.value); }
        else if (time.unit === 'days') { date.setDate(date.getDate() + time.value); }
        return date;
    }

    function calculateAge(dobString) {
        if (!dobString) return 'N/A';
        const dob = new Date(dobString);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    }
});