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
    const detailsView = document.getElementById('details-view');
    const addFamilyForm = document.getElementById('add-family-form');
    const familyEmailInput = document.getElementById('family-email-input');
    const requestStatusMsg = document.getElementById('request-status-msg');
    const primarySidebar = document.getElementById('primary-sidebar');

    const vaccinationSchedule = {
        'At Birth': ['BCG', 'OPV 0', 'Hepatitis B - 1'],
        '6 Weeks': ['DTwP 1', 'IPV 1', 'Hepatitis B - 2', 'HiB 1', 'Rotavirus 1', 'PCV 1'],
        '10 Weeks': ['DTwP 2', 'IPV 2', 'HiB 2', 'Rotavirus 2'],
        '14 Weeks': ['DTwP 3', 'IPV 3', 'HiB 3', 'Rotavirus 3', 'PCV 2']
    };

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
                    document.querySelectorAll('.family-item').forEach(el => el.classList.remove('active'));
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
        detailsView.innerHTML = '<div class="loader-small" style="margin-top: 100px;"></div>';
        try {
            const membersSnapshot = await db.collection('users').doc(familyId).collection('familyMembers').get();
            
            if (membersSnapshot.empty) {
                detailsView.innerHTML = '<div class="placeholder"><p>This family has no members registered.</p></div>';
                return;
            }

            const memberPromises = membersSnapshot.docs.map(async (memberDoc) => {
                const member = memberDoc.data();
                const vaccineSnapshot = await memberDoc.ref.collection('vaccinations').get();
                const completedVaccines = new Set(vaccineSnapshot.docs.filter(d => d.data().completed).map(d => d.id));
                return { ...member, completedVaccines };
            });

            const membersWithVaccines = await Promise.all(memberPromises);
            
            let detailsHtml = '';
            membersWithVaccines.forEach(member => {
                detailsHtml += `
                    <div class="member-card">
                        <div class="member-header">
                            <h4>${member.name}</h4>
                            <span class="member-info">${member.relation} - ${calculateAge(member.dob)} years old</span>
                        </div>
                        ${generateVaccineTable(member)}
                    </div>`;
            });
            detailsView.innerHTML = detailsHtml;

        } catch (error) {
            console.error("Error loading family details:", error);
            detailsView.innerHTML = `<div class="placeholder"><p style="color: var(--color-danger);">Could not load details.<br><small>${error.message}</small></p></div>`;
        }
    }
    
    function generateVaccineTable(member) {
        let tableHtml = `<table class="vaccine-table"><thead><tr><th>Age Group</th><th>Vaccine</th><th>Status</th></tr></thead><tbody>`;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dob = new Date(member.dob);
        
        for (const [ageGroup, vaccines] of Object.entries(vaccinationSchedule)) {
            for (const vaccine of vaccines) {
                const vaccineId = `${vaccine.replace(/[^a-zA-Z0-9]/g, '')}_${ageGroup.replace(/[^a-zA-Z0-9]/g, '')}`;
                const isCompleted = member.completedVaccines.has(vaccineId);
                let status = '<span class="status-completed">Completed</span>';
                
                if (!isCompleted) {
                    const dueDate = getDueDate(dob, ageGroup);
                    if (today > dueDate) {
                        status = '<span class="status-due">Overdue</span>';
                    } else {
                        status = '<span class="status-upcoming">Upcoming</span>';
                    }
                }
                tableHtml += `<tr><td>${ageGroup}</td><td>${vaccine}</td><td>${status}</td></tr>`;
            }
        }
        tableHtml += `</tbody></table>`;
        return tableHtml;
    }

    function getDueDate(dob, ageGroupString) {
        let date = new Date(dob);
        const number = parseInt(ageGroupString);
        if (ageGroupString.includes('Birth')) {} 
        else if (ageGroupString.includes('Week')) { date.setDate(date.getDate() + number * 7); } 
        else if (ageGroupString.includes('Month')) { date.setMonth(date.getMonth() + number); }
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