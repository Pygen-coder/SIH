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
    let currentLanguage = 'en';
    let attachedFile = null;
    let cameraStream = null;
    let currentChatId = null;
    let unsubscribeHistory = null;
    let conversationHistory = [];
    let placesAutocomplete = null;
    let currentSearchLocation = null;
    let isPrescriptionMode = false;

    const sidebar = document.getElementById('sidebar');
    const mainInterface = document.getElementById('main-interface');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const micBtn = document.getElementById('mic-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const fileInput = document.getElementById('file-input');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const newThreadBtn = document.getElementById('new-thread-btn');
    const homeBtn = document.getElementById('home-btn');
    const shareChatBtn = document.getElementById('share-chat-btn');
    const preChatSuggestions = document.getElementById('pre-chat-suggestions');
    const suggestionCardsContainer = document.getElementById('suggestion-cards');
    const refreshSuggestionsBtn = document.getElementById('refresh-suggestions-btn');
    const historyBtn = document.getElementById('history-btn');
    const notificationBtn = document.getElementById('notification-btn');
    const discoverBtn = document.getElementById('discover-btn');
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const micIcon = micBtn.querySelector('i');
    const profileBtnText = document.getElementById('profile-btn-text');
    const historyList = document.getElementById('history-list');
    const discoverItems = document.querySelectorAll('.discover-item');
    const deleteHistoryBtn = document.getElementById('delete-history-btn');
    const deleteHistoryDropdown = document.getElementById('delete-history-dropdown');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationList = document.getElementById('notification-list');
    const customAlertOverlay = document.getElementById('custom-alert-overlay');
    const customAlertTitle = document.getElementById('custom-alert-title');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertCancelBtn = document.getElementById('custom-alert-cancel');
    const customAlertOkBtn = document.getElementById('custom-alert-ok');
    const welcomeModalOverlay = document.getElementById('welcome-modal-overlay');
    const closeWelcomeModalBtn = document.getElementById('close-welcome-modal');
    const dismissWelcomeModalBtn = document.getElementById('dismiss-welcome-modal');
    const signupWelcomeModalBtn = document.getElementById('signup-welcome-modal');
    const cameraModal = document.getElementById('camera-modal');
    const cameraView = document.getElementById('camera-view');
    const cameraCanvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');
    const profileModalOverlay = document.getElementById('profile-modal-overlay');
    const closeProfileModalBtn = document.getElementById('close-profile-modal');
    const profileForm = document.getElementById('profile-form');
    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    const profilePhoneInput = document.getElementById('profile-phone');
    const profileDobInput = document.getElementById('profile-dob');
    const profileGenderInput = document.getElementById('profile-gender');
    const placesModalOverlay = document.getElementById('places-modal-overlay');
    const closePlacesModalBtn = document.getElementById('close-places-modal');
    const placesListContainer = document.getElementById('places-list');
    const placesFilters = document.getElementById('places-filters');
    const placesSearchForm = document.getElementById('places-search-form');
    const placesSearchInput = document.getElementById('places-search-input');
    const familyModalOverlay = document.getElementById('family-modal-overlay');
    const closeFamilyModalBtn = document.getElementById('close-family-modal');
    const myFamilyLink = document.getElementById('my-family-link');
    const familyListContainer = document.getElementById('family-list');
    const addMemberBtn = document.getElementById('add-member-btn');
    const familyForm = document.getElementById('family-form');
    const familyFormTitle = document.getElementById('family-form-title');
    const cancelFamilyFormBtn = document.getElementById('cancel-family-form');
    const familyDobInput = document.getElementById('family-dob');
    const vaccinationModalOverlay = document.getElementById('vaccination-modal-overlay');
    const closeVaccinationModalBtn = document.getElementById('close-vaccination-modal');
    const vaccineMemberSelect = document.getElementById('vaccine-member-select');
    const vaccinationScheduleContainer = document.getElementById('vaccination-schedule-container');
    const addCustomVaccineBtn = document.getElementById('add-custom-vaccine-btn');
    const customVaccineForm = document.getElementById('custom-vaccine-form');
    const cancelCustomVaccineBtn = document.getElementById('cancel-custom-vaccine-btn');
    const loggedOutView = profileDropdown.querySelector('.logged-out-view');
    const loggedInView = profileDropdown.querySelector('.logged-in-view');
    const loginBtnDropdown = document.getElementById('login-btn-dropdown');
    const signupBtnDropdown = document.getElementById('signup-btn-dropdown');
    const logoutLink = document.getElementById('logout-link');
    const userNameDropdown = document.getElementById('user-name-dropdown');
    const userEmailDropdown = document.getElementById('user-email-dropdown');
    const myProfileLink = document.getElementById('my-profile-link');
    const workerLoginLink = document.getElementById('worker-login-link');
    const authContainer = document.querySelector('.auth-container');
    const authCard = document.getElementById('auth-card');
    const signUpBtnCard = document.getElementById('signUp');
    const signInBtnCard = document.getElementById('signIn');
    const signInMobileLink = document.getElementById('signInMobile');
    const signUpMobileLink = document.getElementById('signUpMobile');
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const googleSignupBtn = document.getElementById('google-signup-btn');
    const googleSigninBtn = document.getElementById('google-signin-btn');
    const workerLoginModalOverlay = document.getElementById('worker-login-modal-overlay');
    const closeWorkerLoginModalBtn = document.getElementById('close-worker-login-modal');
    const workerLoginForm = document.getElementById('worker-login-form-main');
    const workerLoginError = document.getElementById('worker-login-error');

    const API_KEY = "AIzaSyCBokerj127n_x2RwOgDd7ALgZtNxuMLyA";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const t = (key, params = {}) => {
        let text = translations[currentLanguage]?.[key] || translations.en[key] || key;
        for (const [param, value] of Object.entries(params)) {
            text = text.replace(`{${param}}`, value);
        }
        return text;
    };

    const updateUIText = (lang) => {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        const elements = document.querySelectorAll('[data-i18n-key]');
        elements.forEach(el => {
            const key = el.dataset.i18nKey;
            const attr = el.dataset.i18nAttr;
            const translation = t(key);
            if (attr) {
                el.setAttribute(attr, translation);
            } else {
                if (translation) el.textContent = translation;
            }
        });
        updateMicIcon();
    };

    function renderMarkdown(text) {
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    const activateChatView = () => {
        if (!mainInterface.classList.contains('chat-active')) {
            mainInterface.classList.add('chat-active');
            shareChatBtn.classList.remove('hidden');
        }
    };

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
        updateMicIcon();
    });

    const renderSuggestions = (suggestions) => {
        suggestionCardsContainer.innerHTML = '';
        if (suggestions.length === 0) {
            preChatSuggestions.classList.add('hidden');
            return;
        }
        suggestions.forEach(text => {
            const card = document.createElement('button');
            card.className = 'suggestion-card';
            card.textContent = text;
            card.addEventListener('click', () => {
                userInput.value = text;
                handleSendMessage();
            });
            suggestionCardsContainer.appendChild(card);
        });
        preChatSuggestions.classList.remove('hidden');
    };

    const getSuggestionsFromAI = async (gender, age) => {
        let languageName = 'English';
        if (currentLanguage === 'hi') {
            languageName = 'Hindi';
        } else if (currentLanguage === 'or') {
            languageName = 'Odia';
        }
        const prompt = `You are a health assistant. Generate 5 short, one-sentence health-related questions in ${languageName} that a ${age}-year-old ${gender} in rural India might ask. Respond ONLY with the questions in ${languageName}, separated by a pipe | character. Do not include any other text, numbers, or bullet points.`;
        const payload = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) return [];
            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            return text.split('|').map(s => s.trim()).filter(s => s);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            return [];
        }
    };

    const calculateAgeFromDob = (dobString) => {
        if (!dobString) return 30;
        const dob = new Date(dobString);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };

    const updateUserSuggestionsInDB = async (uid, gender, dob) => {
        const age = calculateAgeFromDob(dob);
        const newSuggestions = await getSuggestionsFromAI(gender, age);
        if (newSuggestions.length > 0) {
            const userDocRef = db.collection('users').doc(uid);
            await userDocRef.set({
                suggestions: {
                    prompts: newSuggestions,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }
            }, {
                merge: true
            });
        }
        return newSuggestions;
    };

    const displayPreChatSuggestions = async () => {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = db.collection('users').doc(user.uid);
            const userDoc = await userDocRef.get();

            if (userDoc.exists) {
                const data = userDoc.data();
                const savedSuggestions = data.suggestions;

                if (savedSuggestions && savedSuggestions.prompts && savedSuggestions.timestamp) {
                    renderSuggestions(savedSuggestions.prompts);

                    const now = new Date();
                    const suggestionDate = savedSuggestions.timestamp.toDate();
                    const hoursDiff = (now - suggestionDate) / (1000 * 60 * 60);

                    if (hoursDiff > 24) {
                        updateUserSuggestionsInDB(user.uid, data.gender || 'person', data.dob || '1995-01-01');
                    }
                } else {
                    const newSuggestions = await updateUserSuggestionsInDB(user.uid, data.gender || 'person', data.dob || '1995-01-01');
                    renderSuggestions(newSuggestions);
                }
            }
        } else {
            renderSuggestions([t('defaultSuggestion1'), t('defaultSuggestion2'), t('defaultSuggestion3'), t('defaultSuggestion4')]);
        }
    };

    const fetchNewSuggestionsForSession = async () => {
        refreshSuggestionsBtn.classList.add('loading');
        const user = auth.currentUser;
        let gender = 'person';
        let dob = '1995-01-01';
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                gender = data.gender || 'person';
                dob = data.dob || '1995-01-01';
            }
        }
        const age = calculateAgeFromDob(dob);
        const suggestions = await getSuggestionsFromAI(gender, age);
        renderSuggestions(suggestions);
        refreshSuggestionsBtn.classList.remove('loading');
    };

    refreshSuggestionsBtn.addEventListener('click', fetchNewSuggestionsForSession);

    const openProfileModal = async () => {
        const user = auth.currentUser;
        if (!user || !profileModalOverlay) return;

        profileNameInput.value = user.displayName || '';
        profileEmailInput.value = user.email || '';

        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
            const data = userDoc.data();
            profilePhoneInput.value = data.phone || '';
            profileDobInput.value = data.dob || '';
            profileGenderInput.value = data.gender || 'male';
        }

        profileModalOverlay.classList.remove('hidden');
        profileModalOverlay.classList.add('visible');
    };

    const closeProfileModal = () => {
        if (!profileModalOverlay) return;
        profileModalOverlay.classList.remove('visible');
        setTimeout(() => {
            profileModalOverlay.classList.add('hidden');
        }, 300);
    };

    const handleProfileFormSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const name = profileNameInput.value;
        const phone = profilePhoneInput.value;
        const dob = profileDobInput.value;
        const gender = profileGenderInput.value;

        try {
            if (user.displayName !== name) {
                await user.updateProfile({
                    displayName: name
                });
            }

            const userDocRef = db.collection('users').doc(user.uid);
            await userDocRef.set({
                displayName: name,
                email: user.email,
                phone: phone,
                dob: dob,
                gender: gender
            }, {
                merge: true
            });

            updateUserSuggestionsInDB(user.uid, gender, dob);

            updateUserProfileUI(auth.currentUser);
            closeProfileModal();
            showCustomAlert('myProfileTitle', 'profileUpdatedMessage', null, {
                okTextKey: 'closeAction',
                okBtnClass: 'btn-primary'
            });

        } catch (error) {
            console.error("Error updating profile: ", error);
            showCustomAlert('errorTitle', 'profileUpdateFailedMessage');
        }
    };

    myProfileLink.addEventListener('click', (e) => {
        e.preventDefault();
        openProfileModal();
        profileDropdown.classList.remove('show');
    });
    closeProfileModalBtn.addEventListener('click', closeProfileModal);
    profileForm.addEventListener('submit', handleProfileFormSubmit);

    let onAlertOk = null;

    function showCustomAlert(titleKey, messageKey, onOkCallback, options = {}) {
        if (!customAlertOverlay) return;

        const {
            okTextKey = 'deleteAction',
            okBtnClass = 'btn-danger'
        } = options;

        customAlertTitle.textContent = t(titleKey);
        customAlertMessage.textContent = t(messageKey);

        const okText = t(okTextKey);
        customAlertOkBtn.textContent = okText;
        customAlertOkBtn.className = '';
        customAlertOkBtn.classList.add(okBtnClass);

        if (onOkCallback) {
            onAlertOk = onOkCallback;
            customAlertOkBtn.style.display = 'inline-block';
            customAlertCancelBtn.style.display = 'inline-block';
        } else {
            onAlertOk = null;
            customAlertOkBtn.style.display = 'inline-block';
            customAlertCancelBtn.style.display = 'none';
        }

        customAlertOverlay.classList.remove('hidden');
        customAlertOverlay.classList.add('visible');
    }

    function closeCustomAlert() {
        if (!customAlertOverlay) return;
        customAlertOverlay.classList.remove('visible');
        setTimeout(() => {
            customAlertOverlay.classList.add('hidden');
            customAlertOkBtn.style.display = 'inline-block';
            customAlertCancelBtn.style.display = 'inline-block';
        }, 300);
        onAlertOk = null;
    }

    if (customAlertCancelBtn) {
        customAlertCancelBtn.addEventListener('click', closeCustomAlert);
    }
    if (customAlertOkBtn) {
        customAlertOkBtn.addEventListener('click', () => {
            if (typeof onAlertOk === 'function') {
                onAlertOk();
            }
            closeCustomAlert();
        });
    }

    auth.onAuthStateChanged(async (user) => {
        updateUserProfileUI(user);
        displayPreChatSuggestions();
        if (user) {
            profileDropdown.classList.remove('show');
            if (authContainer) authContainer.classList.remove('show');

            checkAllNotifications();

            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists || !userDoc.data().dob || !userDoc.data().gender) {
                setTimeout(openProfileModal, 1500);
            }
        } else {
            updateNotificationBadge(0);
            setTimeout(showWelcomeModal, 2000);
        }
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isListening = false;
    let baseText = '';

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            micIcon.className = 'fa-solid fa-stop';
            micBtn.setAttribute('data-tooltip', t('micStopTooltip'));
            userInput.placeholder = t('listeningPlaceholder');
            userInput.focus();
            baseText = userInput.value ? userInput.value.trim() + ' ' : '';
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.length > 0) {
                    const transcriptPart = result[0].transcript;
                    if (result.isFinal) {
                        finalTranscript += transcriptPart;
                    } else {
                        interimTranscript += transcriptPart;
                    }
                }
            }
            finalTranscript = finalTranscript.replace(/([\.?,])([^\s])/g, "$1 $2");
            if (finalTranscript.trim().endsWith(interimTranscript.trim())) {
                interimTranscript = '';
            }
            userInput.value = baseText + finalTranscript + interimTranscript;
            userInput.dispatchEvent(new Event('input'));
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            alert(t('speechRecognitionError', {
                error: event.error
            }));
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
            userInput.placeholder = t('askAnythingPlaceholder');
            userInput.value = userInput.value.trim();
            updateMicIcon();
            userInput.dispatchEvent(new Event('input'));
        };
    }

    const setLanguage = (lang) => {
        const langBtnSpan = langBtn.querySelector('span');
        let langCodeForSpeech;
        if (lang === 'or') {
            langBtnSpan.textContent = 'OR';
            langCodeForSpeech = 'or-IN';
        } else if (lang === 'hi') {
            langBtnSpan.textContent = 'HI';
            langCodeForSpeech = 'hi-IN';
        } else {
            lang = 'en';
            langBtnSpan.textContent = 'EN';
            langCodeForSpeech = 'en-US';
        }
        if (recognition) {
            recognition.lang = langCodeForSpeech;
        }
        updateUIText(lang);
        localStorage.setItem('remediLang', lang);
        updateUserProfileUI(auth.currentUser);
        displayPreChatSuggestions();
    };

    langDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = e.target.dataset.lang;
            setLanguage(selectedLang);
            langDropdown.classList.remove('show');
        });
    });

    const applyTheme = () => {
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    };
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        applyTheme();
    });
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    function toggleDropdown(dropdown) {
        document.querySelectorAll('.dropdown-menu.show').forEach(openDropdown => {
            if (openDropdown !== dropdown) {
                openDropdown.classList.remove('show');
            }
        });
        dropdown.classList.toggle('show');
    }

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(profileDropdown);
    });
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(langDropdown);
    });
    deleteHistoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(deleteHistoryDropdown);
    });

    window.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target)) profileDropdown.classList.remove('show');
        if (!langBtn.contains(e.target)) langDropdown.classList.remove('show');
        if (deleteHistoryBtn && !deleteHistoryBtn.contains(e.target)) {
            deleteHistoryDropdown.classList.remove('show');
        }
    });

    if (authContainer) {
        signUpBtnCard.addEventListener('click', () => authCard.classList.add("right-panel-active"));
        signInBtnCard.addEventListener('click', () => authCard.classList.remove("right-panel-active"));
        const mobileSlider = document.querySelector('.mobile-accent-slider');
        const toggleMobilePanel = (isSignUp) => {
            const needsAnimation = isSignUp !== authCard.classList.contains("right-panel-active");
            if (needsAnimation && mobileSlider) {
                mobileSlider.classList.add('is-animating');
                mobileSlider.addEventListener('animationend', () => mobileSlider.classList.remove('is-animating'), {
                    once: true
                });
            }
            authCard.classList.toggle("right-panel-active", isSignUp);
        }
        signInMobileLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMobilePanel(false);
        });
        signUpMobileLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMobilePanel(true);
        });
        authContainer.addEventListener('click', (event) => {
            if (event.target === authContainer) authContainer.classList.remove('show');
        });
    }

    function openAuthModal(showSignUp = false) {
        if (!authContainer) return;
        authCard.classList.toggle("right-panel-active", showSignUp);
        authContainer.classList.add('show');
    }
    loginBtnDropdown.addEventListener('click', () => {
        openAuthModal(false);
        profileDropdown.classList.remove('show');
    });
    signupBtnDropdown.addEventListener('click', () => {
        openAuthModal(true);
        profileDropdown.classList.remove('show');
    });

    function showWelcomeModal() {
        if (!welcomeModalOverlay) return;
        welcomeModalOverlay.classList.remove('hidden');
        welcomeModalOverlay.classList.add('visible');
    }

    function hideWelcomeModal() {
        if (!welcomeModalOverlay) return;
        welcomeModalOverlay.classList.remove('visible');
        setTimeout(() => {
            welcomeModalOverlay.classList.add('hidden');
        }, 300);
    }

    function updateUserProfileUI(user) {
        const avatarCapsule = document.getElementById('profile-avatar-capsule');
        const avatarDropdown = document.getElementById('profile-avatar-dropdown');

        if (user) {
            loggedOutView.style.display = 'none';
            loggedInView.style.display = 'block';

            const displayName = user.displayName || user.email.split('@')[0];
            profileBtnText.textContent = displayName;
            userNameDropdown.textContent = user.displayName || 'User';
            userEmailDropdown.textContent = user.email;

            if (user.photoURL) {
                avatarCapsule.innerHTML = `<img src="${user.photoURL}" alt="Profile Picture">`;
                avatarDropdown.innerHTML = `<img src="${user.photoURL}" alt="Profile Picture">`;
            } else {
                const initial = (displayName).charAt(0).toUpperCase();
                const colors = ["#ffc107", "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#00bcd4", "#4caf50", "#8bc34a", "#ff9800", "#795548"];
                const colorIndex = Math.abs(displayName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)) % colors.length;
                const avatarHTML = `<div class="initials-avatar" style="background-color: ${colors[colorIndex]}; color: #fff;">${initial}</div>`;
                avatarCapsule.innerHTML = avatarHTML;
                avatarDropdown.innerHTML = avatarHTML;
            }
            fetchChatHistory(user.uid);
        } else {
            loggedOutView.style.display = 'block';
            loggedInView.style.display = 'none';
            profileBtnText.textContent = t('profileSignIn');
            avatarCapsule.innerHTML = '<i class="fa-solid fa-user-circle"></i>';
            avatarDropdown.innerHTML = '<i class="fa-solid fa-user-circle fa-2x"></i>';
            if (unsubscribeHistory) unsubscribeHistory();
            historyList.innerHTML = `<p>${t('historyLoginPrompt')}</p>`;
            startNewChat();
        }
    }

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupForm['signup-name'].value;
        const email = signupForm['signup-email'].value;
        const password = signupForm['signup-password'].value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(cred => {
                return cred.user.updateProfile({
                        displayName: name
                    })
                    .then(() => {
                        updateUserProfileUI(auth.currentUser);
                    });
            })
            .then(() => {
                signupForm.reset();
            })
            .catch(err => {
                alert(err.message);
            });
    });

    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signinForm['signin-email'].value;
        const password = signinForm['signin-password'].value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => signinForm.reset())
            .catch(err => alert(err.message));
    });

    const handleGoogleSignIn = () => {
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(err => alert(err.message));
    };
    googleSignupBtn.addEventListener('click', handleGoogleSignIn);
    googleSigninBtn.addEventListener('click', handleGoogleSignIn);
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });

    function addMessage(text, sender, file = null, shouldAnimate = true, suggestions = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        if (!shouldAnimate) messageElement.style.animation = 'none';
        let contentHTML = '';
        if (file && sender === 'user') {
            const isImage = file.mimeType.startsWith('image/');
            const thumbnailContent = isImage ?
                `<img src="${file.previewUrl}" alt="preview" class="chat-file-thumbnail">` :
                `<div class="chat-file-thumbnail"><i class="fa-solid fa-file-pdf"></i></div>`;
            contentHTML += `<div class="chat-file-preview">${thumbnailContent}<span class="chat-file-name">${file.name}</span></div>`;
        }
        const p = document.createElement('p');
        if (text) {
            if (sender === 'bot') {
                p.innerHTML = renderMarkdown(text);
            } else {
                p.textContent = text;
            }
        }
        messageElement.innerHTML = contentHTML;
        messageElement.appendChild(p);

        if (sender === 'bot') {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.title = t('copyAction');
            const copyText = t('copyAction');
            copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i><span>${copyText}</span>`;

            copyBtn.addEventListener('click', () => {
                const textToCopy = messageElement.querySelector('p').innerText;
                const copiedText = t('copiedAction');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    copyBtn.innerHTML = `<i class="fa-solid fa-check"></i><span>${copiedText}</span>`;
                    setTimeout(() => {
                        copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i><span>${copyText}</span>`;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
            messageElement.appendChild(copyBtn);

            if (suggestions.length > 0) {
                const suggestionsContainer = document.createElement('div');
                suggestionsContainer.className = 'suggested-questions-container';
                suggestions.forEach(suggestionText => {
                    const suggestionBtn = document.createElement('button');
                    suggestionBtn.className = 'suggested-question';
                    suggestionBtn.textContent = suggestionText;
                    suggestionBtn.addEventListener('click', () => {
                        userInput.value = suggestionText;
                        handleSendMessage();
                        suggestionsContainer.remove();
                    });
                    suggestionsContainer.appendChild(suggestionBtn);
                });
                messageElement.appendChild(suggestionsContainer);
            }
        }

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }

    function typeWriter(element, text, speed = 15, callback) {
        let i = 0;
        let currentText = '';
        const cursor = '<span class="typing-cursor">▋</span>';

        function type() {
            if (i < text.length) {
                currentText += text.charAt(i);
                element.innerHTML = renderMarkdown(currentText) + cursor;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                i++;
                setTimeout(type, speed);
            } else {
                element.innerHTML = renderMarkdown(currentText);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                if (callback) callback();
            }
        }
        type();
    }

    function showTypingIndicator() {
        if (document.getElementById('typing-indicator')) return;
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async function saveMessage(chatId, message) {
        const user = auth.currentUser;
        if (!user || !chatId) return;
        const chatRef = db.collection('users').doc(user.uid).collection('chats').doc(chatId);
        await chatRef.collection('messages').add(message);
        const mainText = message.text.split('[SUGGESTIONS]')[0].trim();
        await chatRef.set({
            lastMessage: mainText.substring(0, 40),
            timestamp: message.timestamp
        }, {
            merge: true
        });
    }

    async function callGeminiAPI(payload) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                console.error("API Error Response:", await response.text());
                return `Error: ${response.statusText}. Please check your API key and network.`;
            }
            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.log("No valid candidate in API response:", data);
                return "I'm sorry, I couldn't generate a response. Please try again.";
            }
        } catch (error) {
            console.error("Error fetching from API:", error);
            return "An error occurred. Please check the console.";
        }
    }

    async function getBotResponse(chatHistory) {
        let langInstruction = '';
        if (currentLanguage === 'hi') langInstruction = 'IMPORTANT: You must respond in Hindi.';
        else if (currentLanguage === 'or') langInstruction = 'IMPORTANT: You must respond in Odia.';

        const systemPrompt = `${langInstruction} You are Remedi, an AI Personal Health Companion for rural citizens in India.

**Your Persona & Style:**
1.  **Warm and Empathetic:** Your tone must be caring, friendly, and reassuring. Always start with an empathetic response if a user feels unwell (e.g., "I'm sorry to hear you're not feeling well...").
2.  **Simple and Clear:** Explain health topics in simple, easy-to-understand language. Avoid complex medical jargon. For example, instead of "analgesic," say "pain relief medicine."
3.  **Structured for Readability:**
    * For any lists (like symptoms or advice), you **MUST** use a numbered format (1., 2., 3., etc.). Do not use asterisks or dashes.
    * **CRUCIAL:** You **MUST** add an extra line break between each item in a numbered list to create clear spacing. This is very important for readability.
    * Use emojis sparingly (like 🙏 or 😊) to add a friendly touch, but never as bullet points.

**Core Safety Guidelines:**
1.  **Disclaimer First:** For any detailed health advice, you **MUST** begin your response with this exact disclaimer: "**Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Please consult a qualified doctor for any health concerns.**"
2.  **No Prescriptions:** You **MUST NOT** prescribe or suggest specific medicine names or dosages.
3.  **Encourage Professional Help:** You **MUST** conclude your health advice by encouraging the user to visit a doctor or a nearby health center.
4.  **Stay On-Topic:** If asked about a non-health-related topic, politely state that your purpose is to assist with health questions.

**Follow-up Suggestions:**
After your main response, you **MUST** provide 2-3 relevant, short follow-up questions a user might ask next. Format them strictly like this, with no extra text: [SUGGESTIONS]How can I prevent this?|What are the treatment options?|Where is the nearest clinic?[/SUGGESTIONS]`;

        const payload = {
            contents: chatHistory,
            systemInstruction: {
                parts: [{
                    text: systemPrompt
                }]
            }
        };
        return await callGeminiAPI(payload);
    }


    function clearAttachedFile() {
        if (attachedFile && attachedFile.previewUrl) {
            URL.revokeObjectURL(attachedFile.previewUrl);
        }
        attachedFile = null;
        fileInput.value = '';
        filePreviewContainer.innerHTML = '';
    }

    function startNewChat() {
        currentChatId = null;
        chatMessages.innerHTML = '';
        conversationHistory = [];
        mainInterface.classList.remove('chat-active');
        shareChatBtn.classList.add('hidden');

        const mainTitle = document.querySelector('.main-title');
        const headerTitle = document.getElementById('header-title');
        if (mainTitle) mainTitle.classList.remove('disappearing');
        if (headerTitle) headerTitle.classList.remove('visible');

        displayPreChatSuggestions();
    }

    async function handleSendMessage() {
        if (isListening) recognition.stop();
        const text = userInput.value.trim();
        const user = auth.currentUser;
        if (!text && !attachedFile) return;

        const isFirstMessage = !mainInterface.classList.contains('chat-active');
        if (isFirstMessage) {
            const mainTitle = document.querySelector('.main-title');
            const headerTitle = document.getElementById('header-title');
            if (mainTitle) mainTitle.classList.add('disappearing');
            if (headerTitle) headerTitle.classList.add('visible');
        }

        if (user && !currentChatId) {
            const newChatRef = await db.collection('users').doc(user.uid).collection('chats').add({
                started: firebase.firestore.FieldValue.serverTimestamp()
            });
            currentChatId = newChatRef.id;
        }
        activateChatView();
        const fileToSend = attachedFile;
        addMessage(text, 'user', fileToSend);
        const userMessageParts = [{
            text
        }];
        if (fileToSend) {
            userMessageParts.push({
                inlineData: {
                    mimeType: fileToSend.mimeType,
                    data: fileToSend.data
                }
            });
        }
        conversationHistory.push({
            role: 'user',
            parts: userMessageParts
        });
        if (user && currentChatId) {
            saveMessage(currentChatId, {
                text: text,
                sender: 'user',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        userInput.value = '';
        userInput.dispatchEvent(new Event('input'));
        clearAttachedFile();
        updateMicIcon();
        showTypingIndicator();
        userInput.disabled = true;
        micBtn.disabled = true;

        const botResponse = await getBotResponse(conversationHistory);

        let mainResponse = botResponse;
        let suggestions = [];
        const suggestionRegex = /\[SUGGESTIONS\](.*?)\[\/SUGGESTIONS\]/s;
        const match = botResponse.match(suggestionRegex);

        if (match && match[1]) {
            mainResponse = botResponse.replace(suggestionRegex, '').trim();
            suggestions = match[1].split('|').map(s => s.trim()).filter(s => s);
        }

        conversationHistory.push({
            role: 'model',
            parts: [{
                text: botResponse
            }]
        });
        if (user && currentChatId) {
            saveMessage(currentChatId, {
                text: botResponse,
                sender: 'bot',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        removeTypingIndicator();
        const botMessageBubble = addMessage('', 'bot', null, true, suggestions);
        const p_element = botMessageBubble.querySelector('p');
        const suggestionsContainer = botMessageBubble.querySelector('.suggested-questions-container');

        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }

        typeWriter(p_element, mainResponse, 15, () => {
            if (suggestionsContainer) {
                suggestionsContainer.style.display = 'flex';
                suggestionsContainer.classList.add('fade-in');
            }
            userInput.disabled = false;
            micBtn.disabled = false;
            userInput.focus();
        });
    }

    async function handlePrescriptionAnalysis(file) {
        if (!file) {
            isPrescriptionMode = false;
            return;
        }

        const isFirstMessage = !mainInterface.classList.contains('chat-active');
        if (isFirstMessage) {
            const mainTitle = document.querySelector('.main-title');
            const headerTitle = document.getElementById('header-title');
            if (mainTitle) mainTitle.classList.add('disappearing');
            if (headerTitle) headerTitle.classList.add('visible');
        }

        const user = auth.currentUser;
        if (user && !currentChatId) {
            const newChatRef = await db.collection('users').doc(user.uid).collection('chats').add({
                started: firebase.firestore.FieldValue.serverTimestamp()
            });
            currentChatId = newChatRef.id;
        }

        activateChatView();
        const userMessageText = t('prescriptionAnalysisRequest');
        addMessage(userMessageText, 'user', file);

        showTypingIndicator();
        userInput.disabled = true;
        micBtn.disabled = true;

        let langInstruction = 'English';
        if (currentLanguage === 'hi') langInstruction = 'Hindi';
        else if (currentLanguage === 'or') langInstruction = 'Odia';

        const prompt = `Your entire response **MUST** be in ${langInstruction}. You are Remedi, an AI assistant. Your tone must be very helpful, clear, empathetic, and simple, like a caring health worker explaining things to users in rural India. Analyze the attached image of a medical prescription.

**Your Task:**
1.  Perform OCR to read all text from the image.
2.  Start your response with a warm, reassuring sentence like "I can certainly help you understand this prescription better. Let's go through it step-by-step."
3.  **CRITICAL:** Immediately after the opening, you **MUST** provide this exact disclaimer: "**Disclaimer: This is an AI-generated analysis and not a substitute for professional medical advice. Always consult with your doctor for any health concerns.**"
4.  Structure the information under the following bold headings: **How to Take Your Medicines** and **What These Medicines Do**.
5.  Under **How to Take Your Medicines**, create a **numbered list (1., 2., 3.)** for each medicine.
    * For each medicine, provide a detailed but simple breakdown. Explain the dosage clearly (e.g., "1-0-1 means one tablet in the morning, none in the afternoon, and one at night").
    * Explain the reason for the timing (e.g., "It is best to take this after meals to avoid stomach upset.").
    * For antibiotics, you **must** include a sentence reminding the user to finish the entire course, even if they start feeling better.
    * **CRUCIAL:** Add an extra line break between each numbered item for clear spacing.
6.  Under **What These Medicines Do**, create another **numbered list (1., 2., 3.)** corresponding to the medicines above.
    * For each medicine, provide a detailed but simple explanation. For an antibiotic, say "This is an antibiotic. Its job is to fight the germs (bacteria) in your body that are causing the infection."
    * For a supporting medicine (like an antacid), explain *why* it's given with other medicines (e.g., "This protects your stomach from the strong effects of the other tablets.").
    * Keep the language extremely simple and relatable.
    * Also, add an extra line break between each item here.
7.  Conclude with a helpful closing remark, encouraging the user to follow their doctor's advice and visit a health center if their symptoms don't improve. Add a friendly emoji.
8.  If the image is blurry or unreadable, state that clearly instead of guessing. Do not invent information.`;

        const payload = {
            contents: [{
                parts: [{
                    text: prompt
                }, {
                    inlineData: {
                        mimeType: file.mimeType,
                        data: file.data
                    }
                }]
            }]
        };

        if (user && currentChatId) {
            saveMessage(currentChatId, {
                text: userMessageText,
                sender: 'user',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        const botResponse = await callGeminiAPI(payload);

        if (user && currentChatId) {
            saveMessage(currentChatId, {
                text: botResponse,
                sender: 'bot',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        removeTypingIndicator();
        const botMessageBubble = addMessage('', 'bot');
        const p_element = botMessageBubble.querySelector('p');
        typeWriter(p_element, botResponse, 15, () => {
            userInput.disabled = false;
            micBtn.disabled = false;
            userInput.focus();
        });

        clearAttachedFile();
        isPrescriptionMode = false;
    }

    userInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });

    function updateMicIcon() {
        if (isListening) return;
        const hasContent = userInput.value.trim().length > 0 || attachedFile;
        if (hasContent) {
            micIcon.className = 'fa-solid fa-paper-plane';
            micBtn.classList.add('send-mode');
            micBtn.setAttribute('data-tooltip', t('sendTooltip'));
        } else {
            micIcon.className = 'fa-solid fa-microphone';
            micBtn.classList.remove('send-mode');
            micBtn.setAttribute('data-tooltip', t('micTooltip'));
        }
    }

    micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('send-mode')) {
            handleSendMessage();
        } else if (SpeechRecognition) {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        } else {
            alert(t('voiceInputNotSupported'));
        }
    });

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    function displayFilePreview(file, objectURL) {
        const isImage = file.type.startsWith('image/');
        const thumbnailContent = isImage ? `<img src="${objectURL}" alt="preview" class="file-thumbnail">` : `<div class="file-thumbnail"><i class="fa-solid fa-file-pdf"></i></div>`;
        filePreviewContainer.innerHTML = `<div class="file-preview-item">${thumbnailContent}<span class="file-info">${file.name}</span><button class="remove-file-btn" title="Remove file">×</button></div>`;
        filePreviewContainer.querySelector('.remove-file-btn').addEventListener('click', () => {
            clearAttachedFile();
            updateMicIcon();
        });
    }

    async function handleFile(file) {
        if (!file) return;
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert(t('fileTooLarge', {
                size: MAX_SIZE / 1024 / 1024
            }));
            clearAttachedFile();
            return;
        }
        try {
            const base64Data = await fileToBase64(file);
            const objectURL = URL.createObjectURL(file);
            attachedFile = {
                name: file.name,
                mimeType: file.type,
                data: base64Data,
                previewUrl: objectURL
            };

            if (isPrescriptionMode) {
                handlePrescriptionAnalysis(attachedFile);
            } else {
                displayFilePreview(file, objectURL);
                updateMicIcon();
            }
        } catch (error) {
            console.error("Error reading file:", error);
            alert(t('fileProcessError'));
            clearAttachedFile();
            isPrescriptionMode = false;
        }
    }

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    async function openCamera() {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            alert(t('cameraNotSupported'));
            return;
        }
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                }
            });
            cameraView.srcObject = cameraStream;
            cameraModal.style.display = 'flex';
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert(t('cameraAccessError'));
        }
    }

    function closeCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        cameraModal.style.display = 'none';
    }

    function takePicture() {
        const context = cameraCanvas.getContext('2d');
        cameraCanvas.width = cameraView.videoWidth;
        cameraCanvas.height = cameraView.videoHeight;
        context.drawImage(cameraView, 0, 0, cameraCanvas.width, cameraCanvas.height);
        cameraCanvas.toBlob((blob) => {
            const imageFile = new File([blob], `capture-${Date.now()}.jpg`, {
                type: 'image/jpeg'
            });
            handleFile(imageFile);
            closeCamera();
        }, 'image/jpeg');
    }

    cameraBtn.addEventListener('click', openCamera);
    closeCameraBtn.addEventListener('click', closeCamera);
    captureBtn.addEventListener('click', takePicture);

    if (welcomeModalOverlay) {
        closeWelcomeModalBtn.addEventListener('click', hideWelcomeModal);
        dismissWelcomeModalBtn.addEventListener('click', hideWelcomeModal);
        signupWelcomeModalBtn.addEventListener('click', () => {
            hideWelcomeModal();
            openAuthModal(true);
        });
    }

    const toggleSidebarPanel = (panelToShow) => {
        if (sidebar.classList.contains('expanded') && sidebar.classList.contains(panelToShow)) {
            sidebar.classList.remove('expanded');
        } else {
            sidebar.classList.remove('showing-history', 'showing-discover', 'showing-notifications');
            sidebar.classList.add(panelToShow);
            sidebar.classList.add('expanded');
        }
    };

    historyBtn.addEventListener('click', () => {
        if (auth.currentUser) {
            toggleSidebarPanel('showing-history');
        } else {
            showCustomAlert('signInRequiredTitle', 'signInToViewHistory', () => openAuthModal(), {
                okTextKey: 'signInAction',
                okBtnClass: 'btn-primary'
            });
        }
    });

    discoverBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.currentUser) {
            toggleSidebarPanel('showing-discover');
        } else {
            showCustomAlert('signInRequiredTitle', 'signInToUseDiscover', () => openAuthModal(), {
                okTextKey: 'signInAction',
                okBtnClass: 'btn-primary'
            });
        }
    });

    notificationBtn.addEventListener('click', () => {
        if (auth.currentUser) {
            toggleSidebarPanel('showing-notifications');
            checkAllNotifications();
        } else {
            showCustomAlert('signInRequiredTitle', 'signInToUseNotifications', () => openAuthModal(), {
                okTextKey: 'signInAction',
                okBtnClass: 'btn-primary'
            });
        }
    });

    workerLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('show');
        openWorkerLoginModal();
    });

    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sidebar.classList.remove('expanded');
    });

    discoverItems.forEach(card => {
        card.addEventListener('click', () => {
            const query = card.dataset.query;
            const feature = card.dataset.feature;
            if (!auth.currentUser) {
                showCustomAlert('signInRequiredTitle', 'signInToUseDiscover', () => openAuthModal(), {
                    okTextKey: 'signInAction',
                    okBtnClass: 'btn-primary'
                });
                return;
            }
            if (query) {
                userInput.value = query;
                handleSendMessage();
                sidebar.classList.remove('expanded');
            } else if (feature === 'nearby-search') {
                sidebar.classList.remove('expanded');
                openPlacesModal('hospital', true);
            } else if (feature === 'Read Prescription') {
                sidebar.classList.remove('expanded');
                isPrescriptionMode = true;
                fileInput.click();
            } else if (feature === 'Vaccination Schedule') {
                sidebar.classList.remove('expanded');
                openVaccinationModal();
            } else if (feature) {
                showCustomAlert('comingSoonTitle', t('featureComingSoon', {
                    feature
                }), null, {
                    okTextKey: 'closeAction',
                    okBtnClass: 'btn-primary'
                });
            }
        });
    });

    newThreadBtn.addEventListener('click', startNewChat);

    function fetchChatHistory(uid) {
        if (unsubscribeHistory) unsubscribeHistory();
        const historyQuery = db.collection('users').doc(uid).collection('chats').orderBy('timestamp', 'desc');
        unsubscribeHistory = historyQuery.onSnapshot(snapshot => {
            if (snapshot.empty) {
                historyList.innerHTML = `<p>${t('historyNoChats')}</p>`;
                return;
            }
            historyList.innerHTML = '';
            snapshot.forEach(doc => {
                const chat = doc.data();
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.dataset.chatId = doc.id;

                const title = chat.lastMessage || t('newThreadTooltip');
                const date = chat.timestamp ? chat.timestamp.toDate().toLocaleDateString() : '';

                historyItem.innerHTML = `
                    <div class="history-item-main">
                        <p>${title}</p>
                        <small>${date}</small>
                    </div>
                    <button class="delete-chat-btn" data-chat-id="${doc.id}" title="${t('deleteAction')}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                historyList.appendChild(historyItem);
            });
        }, err => {
            console.error("Error fetching history:", err);
            historyList.innerHTML = `<p>${t('historyLoadError')}</p>`;
        });
    }

    historyList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-chat-btn');
        const historyItemMain = e.target.closest('.history-item-main');

        if (deleteBtn) {
            e.stopPropagation();
            const chatId = deleteBtn.dataset.chatId;
            showCustomAlert('confirmSingleDeletionTitle', 'confirmSingleDeletionMessage', () => {
                deleteSingleChat(chatId);
            });
        } else if (historyItemMain) {
            const chatId = historyItemMain.parentElement.dataset.chatId;
            loadChat(chatId);
        }
    });

    async function deleteSingleChat(chatId) {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const chatRef = db.collection('users').doc(user.uid).collection('chats').doc(chatId);
            await deleteSubcollection(chatRef, 'messages');
            await chatRef.delete();

            if (currentChatId === chatId) {
                startNewChat();
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
            showCustomAlert('errorTitle', 'errorDeleteChat');
        }
    }


    async function loadChat(chatId) {
        const user = auth.currentUser;
        if (!user) return;
        sidebar.classList.remove('expanded');
        startNewChat();
        currentChatId = chatId;
        activateChatView();
        const messagesQuery = db.collection('users').doc(user.uid).collection('chats').doc(chatId).collection('messages').orderBy('timestamp', 'asc');
        const snapshot = await messagesQuery.get();
        snapshot.forEach(doc => {
            const msg = doc.data();
            let mainText = msg.text;

            if (msg.sender === 'bot') {
                const suggestionRegex = /\[SUGGESTIONS\](.*?)\[\/SUGGESTIONS\]/s;
                mainText = mainText.replace(suggestionRegex, '').trim();
            }

            addMessage(mainText, msg.sender, null, false);
            conversationHistory.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{
                    text: msg.text
                }]
            });
        });
    }

    deleteHistoryDropdown.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('a');
        if (target && target.dataset.period) {
            const period = target.dataset.period;
            const messageKey = 'confirmDelete' + period.charAt(0).toUpperCase() + period.slice(1);

            showCustomAlert('confirmDeletionTitle', messageKey, () => {
                deleteChatHistory(period);
            });

            deleteHistoryDropdown.classList.remove('show');
        }
    });

    async function deleteChatHistory(period) {
        const user = auth.currentUser;
        if (!user) {
            showCustomAlert('errorTitle', 'errorLoginToDelete');
            return;
        }

        const chatsRef = db.collection('users').doc(user.uid).collection('chats');
        let query;
        const now = new Date();
        let startDate;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                query = chatsRef.where('timestamp', '>=', startDate);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                query = chatsRef.where('timestamp', '>=', startDate);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                query = chatsRef.where('timestamp', '>=', startDate);
                break;
            case 'all':
                query = chatsRef;
                break;
            default:
                console.error("Invalid period for deletion");
                return;
        }

        try {
            const snapshot = await query.get();
            if (snapshot.empty) {
                return;
            }

            const deletePromises = [];
            snapshot.forEach(doc => {
                const messageDeletionPromise = deleteSubcollection(doc.ref, 'messages');
                deletePromises.push(messageDeletionPromise.then(() => doc.ref.delete()));
            });

            await Promise.all(deletePromises);

            if (currentChatId && snapshot.docs.some(doc => doc.id === currentChatId)) {
                startNewChat();
            }

        } catch (error) {
            console.error("Error deleting chat history: ", error);
            showCustomAlert('errorTitle', 'errorDeleteHistory');
        }
    }

    async function deleteSubcollection(parentRef, subcollectionName) {
        const subcollectionRef = parentRef.collection(subcollectionName);
        const snapshot = await subcollectionRef.get();
        if (snapshot.empty) return;

        const deletePromises = [];
        snapshot.forEach(doc => {
            deletePromises.push(doc.ref.delete());
        });
        await Promise.all(deletePromises);
    }

    const shareChatAsPDF = async () => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer.children.length === 0) return;

        const originalIcon = shareChatBtn.innerHTML;
        shareChatBtn.innerHTML = '<i class="fa-solid fa-spinner"></i>';
        shareChatBtn.classList.add('loading');
        shareChatBtn.disabled = true;

        chatContainer.classList.add('pdf-export-mode');
        document.querySelectorAll('.copy-btn, .suggested-questions-container').forEach(el => el.classList.add('no-print'));

        try {
            const options = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `Remedi-Chat-${new Date().toISOString().split('T')[0]}.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };

            const pdfBlob = await html2pdf().from(chatContainer).set(options).output('blob');
            const pdfFile = new File([pdfBlob], options.filename, {
                type: 'application/pdf'
            });

            if (navigator.canShare && navigator.canShare({
                    files: [pdfFile]
                })) {
                await navigator.share({
                    title: t('shareChatTitle'),
                    text: t('shareChatText'),
                    files: [pdfFile]
                });
            } else {
                html2pdf().from(chatContainer).set(options).save();
            }
        } catch (error) {
            console.error('Error generating or sharing PDF:', error);
            const options = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `Remedi-Chat-${new Date().toISOString().split('T')[0]}.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };
            html2pdf().from(chatContainer).set(options).save();
        } finally {
            shareChatBtn.innerHTML = originalIcon;
            shareChatBtn.classList.remove('loading');
            shareChatBtn.disabled = false;
            chatContainer.classList.remove('pdf-export-mode');
            document.querySelectorAll('.copy-btn, .suggested-questions-container').forEach(el => el.classList.remove('no-print'));
        }
    };

    shareChatBtn.addEventListener('click', shareChatAsPDF);

    function displayPlaces(places, type) {
        placesListContainer.innerHTML = '';
        if (!places || places.length === 0) {
            placesListContainer.innerHTML = `<div class="error-message">${t('placesNoResults', {placeType: type})}</div>`;
            return;
        }

        places.forEach(place => {
            const placeCard = document.createElement('div');
            placeCard.className = 'place-card';

            const photoUrl = place.photos && place.photos.length > 0 ?
                place.photos[0].getUrl({
                    'maxWidth': 100,
                    'maxHeight': 100
                }) :
                null;

            const photoHTML = photoUrl ?
                `<img src="${photoUrl}" alt="${place.name}">` :
                `<i class="fa-solid fa-hospital"></i>`;

            const rating = place.rating || 0;
            let starsHTML = '';
            for (let i = 0; i < 5; i++) {
                if (i < Math.floor(rating)) {
                    starsHTML += '<i class="fa-solid fa-star"></i>';
                } else if (i < Math.ceil(rating) && (rating % 1) !== 0) {
                    starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
                } else {
                    starsHTML += '<i class="fa-regular fa-star"></i>';
                }
            }

            const directionsURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;

            placeCard.innerHTML = `
                <div class="place-photo">${photoHTML}</div>
                <div class="place-card-header">
                    <span class="place-name">${place.name}</span>
                    ${rating > 0 ? `<span class="place-rating">${rating.toFixed(1)} ${starsHTML}</span>` : ''}
                </div>
                <p class="place-address">${place.vicinity}</p>
                <a href="${directionsURL}" target="_blank" rel="noopener noreferrer" class="directions-btn">
                    <i class="fa-solid fa-location-arrow"></i>
                    <span>${t('placesDirections')}</span>
                </a>
            `;
            placesListContainer.appendChild(placeCard);
        });
    }

    function displayPlacesError(message, showTryAgain = true) {
        let tryAgainButton = showTryAgain ? `<button class="directions-btn try-again-btn">${t('placesTryAgain')}</button>` : '';
        placesListContainer.innerHTML = `
            <div class="error-message">
                <i class="fa-solid fa-circle-exclamation"></i>
                <p>${message}</p>
                ${tryAgainButton}
            </div>
        `;
        if (showTryAgain) {
            placesListContainer.querySelector('.try-again-btn').addEventListener('click', () => {
                const activeFilter = placesFilters.querySelector('.active');
                openPlacesModal(activeFilter ? activeFilter.dataset.type : 'hospital', true);
            });
        }
    }

    function findNearbyPlaces(location, type) {
        placesListContainer.innerHTML = '<div class="loader"></div>';
        const request = {
            location: location,
            radius: '5000',
            keyword: type
        };
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                displayPlaces(results, type);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                displayPlaces([], type);
            } else {
                displayPlacesError(t('placesFetchError', {
                    status: status
                }));
            }
        });
    }

    function initializePlacesAutocomplete() {
        if (placesAutocomplete) return;

        placesAutocomplete = new google.maps.places.Autocomplete(placesSearchInput, {
            types: ['geocode'],
            componentRestrictions: {
                'country': 'in'
            }
        });
        placesAutocomplete.setFields(['geometry', 'name']);

        placesAutocomplete.addListener('place_changed', () => {
            const place = placesAutocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                currentSearchLocation = place.geometry.location;
                const activeFilter = placesFilters.querySelector('.active').dataset.type;
                findNearbyPlaces(currentSearchLocation, activeFilter);
            }
        });
    }

    function handleManualLocationSearch(e) {
        e.preventDefault();
        const query = placesSearchInput.value.trim();
        if (!query) return;

        placesListContainer.innerHTML = '<div class="loader"></div>';
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': query,
            'componentRestrictions': {
                'country': 'in'
            }
        }, (results, status) => {
            if (status === 'OK') {
                const newLocation = results[0].geometry.location;
                currentSearchLocation = newLocation;
                const activeFilter = placesFilters.querySelector('.active').dataset.type;
                findNearbyPlaces(newLocation, activeFilter);
            } else {
                displayPlacesError(t('placesSearchError', {
                    query: query
                }), false);
            }
        });
    }

    function openPlacesModal(type, useGeolocation = false) {
        placesModalOverlay.classList.remove('hidden');
        placesModalOverlay.classList.add('visible');
        placesSearchInput.value = '';

        initializePlacesAutocomplete();

        placesFilters.querySelectorAll('.places-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        if (useGeolocation) {
            placesListContainer.innerHTML = '<div class="loader"></div>';
            if (!navigator.geolocation) {
                displayPlacesError(t('placesGeoNotSupported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    currentSearchLocation = userLocation;
                    findNearbyPlaces(userLocation, type);
                },
                (error) => {
                    let errorMessage = t('placesGeoUnknownError');
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = t('placesGeoPermissionDenied');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = t('placesGeoUnavailable');
                            break;
                        case error.TIMEOUT:
                            errorMessage = t('placesGeoTimeout');
                            break;
                    }
                    displayPlacesError(errorMessage);
                }
            );
        } else {
            placesListContainer.innerHTML = `<div class="error-message" style="padding: 40px 0;">${t('placesSearchPrompt')}</div>`;
        }
    }

    function closePlacesModal() {
        placesModalOverlay.classList.remove('visible');
        setTimeout(() => {
            placesModalOverlay.classList.add('hidden');
        }, 300);
    }

    placesFilters.addEventListener('click', (e) => {
        const target = e.target.closest('.places-filter-btn');
        if (target && !target.classList.contains('active')) {
            placesFilters.querySelector('.active').classList.remove('active');
            target.classList.add('active');
            if (currentSearchLocation) {
                findNearbyPlaces(currentSearchLocation, target.dataset.type);
            } else {
                placesListContainer.innerHTML = `<div class="error-message" style="padding: 40px 0;">${t('placesSearchFirst')}</div>`;
            }
        }
    });

    placesSearchForm.addEventListener('submit', handleManualLocationSearch);
    closePlacesModalBtn.addEventListener('click', closePlacesModal);

    let familyMembers = [];

    const calculateAge = (dobString) => {
        if (!dobString) return 0;
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    const openFamilyModal = () => {
        if (!auth.currentUser) {
            showCustomAlert('signInRequiredTitle', 'signInToManageFamily', () => openAuthModal(), {
                okTextKey: 'signInAction',
                okBtnClass: 'btn-primary'
            });
            return;
        }
        familyModalOverlay.classList.remove('hidden');
        familyModalOverlay.classList.add('visible');
        fetchFamilyMembers();
    };

    const closeFamilyModal = () => {
        familyModalOverlay.classList.remove('visible');
        setTimeout(() => {
            familyModalOverlay.classList.add('hidden');
            hideFamilyForm();
        }, 300);
    };

    const fetchFamilyMembers = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const snapshot = await db.collection('users').doc(user.uid).collection('familyMembers').orderBy('name').get();
        familyMembers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderFamilyList();
    };

    const renderFamilyList = () => {
        familyListContainer.innerHTML = '';
        if (familyMembers.length === 0) {
            familyListContainer.innerHTML = `<p>${t('noFamilyMembers')}</p>`;
            return;
        }
        familyMembers.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'family-member-card';
            memberCard.dataset.id = member.id;

            const initial = member.name.charAt(0).toUpperCase();
            const avatarHTML = `<div class="profile-avatar family-member-avatar"><div class="initials-avatar">${initial}</div></div>`;

            const age = calculateAge(member.dob);

            memberCard.innerHTML = `
                ${avatarHTML}
                <div class="family-member-info">
                    <strong>${member.name}</strong>
                    <p>${member.relation} - ${age} ${t('ageLabel')}, ${t('gender' + member.gender.charAt(0).toUpperCase() + member.gender.slice(1))}</p>
                </div>
                <div class="family-member-actions">
                    <button class="edit-btn"><i class="fa-solid fa-pencil"></i></button>
                    <button class="delete-btn"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            familyListContainer.appendChild(memberCard);
        });
    };

    const showFamilyForm = (member = null) => {
        familyForm.classList.remove('hidden');
        addMemberBtn.classList.add('hidden');
        if (member) {
            familyFormTitle.textContent = t('editFamilyMember');
            familyForm.querySelector('#family-member-id').value = member.id;
            familyForm.querySelector('#family-name').value = member.name;
            familyForm.querySelector('#family-relation').value = member.relation;
            familyDobInput.value = member.dob;
            familyForm.querySelector('#family-gender').value = member.gender;
        } else {
            familyFormTitle.textContent = t('addFamilyMember');
            familyForm.reset();
            familyForm.querySelector('#family-member-id').value = '';
        }
    };

    const hideFamilyForm = () => {
        familyForm.classList.add('hidden');
        addMemberBtn.classList.remove('hidden');
        familyForm.reset();
    };

    const handleFamilyFormSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const memberId = familyForm.querySelector('#family-member-id').value;
        const memberData = {
            name: familyForm.querySelector('#family-name').value,
            relation: familyForm.querySelector('#family-relation').value,
            dob: familyDobInput.value,
            gender: familyForm.querySelector('#family-gender').value,
        };

        const collectionRef = db.collection('users').doc(user.uid).collection('familyMembers');
        try {
            if (memberId) {
                await collectionRef.doc(memberId).update(memberData);
                showCustomAlert('myFamily', 'familyMemberUpdatedSuccess', null, {
                    okTextKey: 'closeAction',
                    okBtnClass: 'btn-primary'
                });
            } else {
                await collectionRef.add(memberData);
                showCustomAlert('myFamily', 'familyMemberAddedSuccess', null, {
                    okTextKey: 'closeAction',
                    okBtnClass: 'btn-primary'
                });
            }
            hideFamilyForm();
            fetchFamilyMembers();
            checkAllNotifications();
        } catch (error) {
            showCustomAlert('errorTitle', 'errorFamilyOperation');
            console.error("Error saving family member:", error);
        }
    };

    const handleDeleteFamilyMember = (id, name) => {
        showCustomAlert('confirmDeleteMemberTitle', t('confirmDeleteMemberMessage', {
            name
        }), async () => {
            const user = auth.currentUser;
            if (!user) return;
            try {
                const memberRef = db.collection('users').doc(user.uid).collection('familyMembers').doc(id);
                await deleteSubcollection(memberRef, 'vaccinations');
                await memberRef.delete();

                showCustomAlert('myFamily', 'familyMemberDeletedSuccess', null, {
                    okTextKey: 'closeAction',
                    okBtnClass: 'btn-primary'
                });
                fetchFamilyMembers();
                checkAllNotifications();
            } catch (error) {
                showCustomAlert('errorTitle', 'errorFamilyOperation');
                console.error("Error deleting member:", error);
            }
        });
    };

    myFamilyLink.addEventListener('click', (e) => {
        e.preventDefault();
        openFamilyModal();
        profileDropdown.classList.remove('show');
    });
    closeFamilyModalBtn.addEventListener('click', closeFamilyModal);
    addMemberBtn.addEventListener('click', () => showFamilyForm());
    cancelFamilyFormBtn.addEventListener('click', hideFamilyForm);
    familyForm.addEventListener('submit', handleFamilyFormSubmit);

    familyListContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        if (editBtn) {
            const card = editBtn.closest('.family-member-card');
            const member = familyMembers.find(m => m.id === card.dataset.id);
            if (member) showFamilyForm(member);
        }
        if (deleteBtn) {
            const card = deleteBtn.closest('.family-member-card');
            const member = familyMembers.find(m => m.id === card.dataset.id);
            if (member) handleDeleteFamilyMember(member.id, member.name);
        }
    });

    const vaccinationSchedule = {
        'At Birth': [{
            name: 'BCG',
            protectsAgainst: 'Tuberculosis'
        }, {
            name: 'OPV 0',
            protectsAgainst: 'Poliomyelitis'
        }, {
            name: 'Hepatitis B - 1',
            protectsAgainst: 'Hepatitis B'
        }],
        '6 Weeks': [{
            name: 'DTwP / DTaP - 1',
            protectsAgainst: 'Diphtheria, Tetanus, Pertussis'
        }, {
            name: 'IPV - 1',
            protectsAgainst: 'Poliomyelitis'
        }, {
            name: 'Hepatitis B - 2',
            protectsAgainst: 'Hepatitis B'
        }, {
            name: 'HiB - 1',
            protectsAgainst: 'Haemophilus influenzae type b'
        }, {
            name: 'Rotavirus - 1',
            protectsAgainst: 'Rotavirus diarrhea'
        }, {
            name: 'PCV - 1',
            protectsAgainst: 'Pneumococcal disease'
        }],
        '10 Weeks': [{
            name: 'DTwP / DTaP - 2',
            protectsAgainst: 'Diphtheria, Tetanus, Pertussis'
        }, {
            name: 'IPV - 2',
            protectsAgainst: 'Poliomyelitis'
        }, {
            name: 'HiB - 2',
            protectsAgainst: 'Haemophilus influenzae type b'
        }, {
            name: 'Rotavirus - 2',
            protectsAgainst: 'Rotavirus diarrhea'
        }],
        '14 Weeks': [{
            name: 'DTwP / DTaP - 3',
            protectsAgainst: 'Diphtheria, Tetanus, Pertussis'
        }, {
            name: 'IPV - 3',
            protectsAgainst: 'Poliomyelitis'
        }, {
            name: 'HiB - 3',
            protectsAgainst: 'Haemophilus influenzae type b'
        }, {
            name: 'Rotavirus - 3',
            protectsAgainst: 'Rotavirus diarrhea'
        }, {
            name: 'PCV - 2',
            protectsAgainst: 'Pneumococcal disease'
        }],
        '6 Months': [{
            name: 'Influenza - 1',
            protectsAgainst: 'Influenza (Flu)'
        }, {
            name: 'OPV 1',
            protectsAgainst: 'Poliomyelitis'
        }],
        '7 Months': [{
            name: 'Influenza - 2',
            protectsAgainst: 'Influenza (Flu)'
        }],
        '9 Months': [{
            name: 'MMR - 1',
            protectsAgainst: 'Measles, Mumps, Rubella'
        }, {
            name: 'Typhoid Conjugate Vaccine',
            protectsAgainst: 'Typhoid fever'
        }, {
            name: 'OPV 2',
            protectsAgainst: 'Poliomyelitis'
        }],
        '9-12 Months': [{
            name: 'PCV Booster',
            protectsAgainst: 'Pneumococcal disease'
        }],
        '12 Months': [{
            name: 'Hepatitis A - 1',
            protectsAgainst: 'Hepatitis A'
        }],
        '15 Months': [{
            name: 'MMR - 2',
            protectsAgainst: 'Measles, Mumps, Rubella'
        }, {
            name: 'Varicella (Chickenpox) - 1',
            protectsAgainst: 'Chickenpox'
        }],
        '16-18 Months': [{
            name: 'DTwP / DTaP Booster 1',
            protectsAgainst: 'Diphtheria, Tetanus, Pertussis'
        }, {
            name: 'IPV Booster 1',
            protectsAgainst: 'Poliomyelitis'
        }, {
            name: 'HiB Booster 1',
            protectsAgainst: 'Haemophilus influenzae type b'
        }],
        '18 Months': [{
            name: 'Hepatitis A - 2',
            protectsAgainst: 'Hepatitis A'
        }],
        '2 Years': [{
            name: 'Meningococcal',
            protectsAgainst: 'Meningitis'
        }],
        '4-6 Years': [{
            name: 'DTwP / DTaP Booster 2',
            protectsAgainst: 'Diphtheria, Tetanus, Pertussis'
        }, {
            name: 'OPV 3',
            protectsAgainst: 'Poliomyelitis'
        }, {
            name: 'Varicella (Chickenpox) - 2',
            protectsAgainst: 'Chickenpox'
        }, {
            name: 'MMR - 3',
            protectsAgainst: 'Measles, Mumps, Rubella'
        }],
        '10-12 Years': [{
            name: 'Tdap / Td',
            protectsAgainst: 'Tetanus, Diphtheria, Pertussis'
        }, {
            name: 'HPV (2 doses)',
            protectsAgainst: 'Human Papillomavirus'
        }],
    };

    const getVaccineDate = (dobString, ageGroupString) => {
        const dob = new Date(dobString);
        if (isNaN(dob.getTime())) return null;

        const number = parseFloat(ageGroupString.split('-')[0].trim());
        let date = new Date(dob);

        if (ageGroupString.toLowerCase().includes('birth')) {} else if (ageGroupString.toLowerCase().includes('week')) {
            date.setDate(date.getDate() + number * 7);
        } else if (ageGroupString.toLowerCase().includes('month')) {
            date.setMonth(date.getMonth() + number);
        } else if (ageGroupString.toLowerCase().includes('year')) {
            date.setFullYear(date.getFullYear() + number);
        }
        return date;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    const checkAllNotifications = async () => {
        const user = auth.currentUser;
        if (!user) {
            updateNotificationBadge(0);
            return;
        }

        const [vaccineNotifications, accessRequests] = await Promise.all([
            getVaccineNotifications(user.uid),
            getAccessRequests(user.uid)
        ]);

        const groupedNotifications = {
            accessRequests: accessRequests,
            due: [],
            upcoming: []
        };

        vaccineNotifications.forEach(notification => {
            if (notification.status === 'due') {
                groupedNotifications.due.push(notification);
            } else {
                groupedNotifications.upcoming.push(notification);
            }
        });

        groupedNotifications.due.sort((a, b) => (a.sortDate || 0) - (b.sortDate || 0));
        groupedNotifications.upcoming.sort((a, b) => (a.sortDate || 0) - (b.sortDate || 0));

        renderNotifications(groupedNotifications);
        updateNotificationBadge(accessRequests.length + vaccineNotifications.length);
    };


    async function getAccessRequests(uid) {
        const requests = [];
        const querySnapshot = await db.collection('accessRequests')
            .where('userUid', '==', uid)
            .where('status', '==', 'pending')
            .get();

        querySnapshot.forEach(doc => {
            const request = doc.data();
            requests.push({
                type: 'accessRequest',
                id: doc.id,
                workerName: request.workerName,
                workerUid: request.workerUid
            });
        });
        return requests;
    }

    async function getVaccineNotifications(uid) {
        const notifications = [];
        const familySnapshot = await db.collection('users').doc(uid).collection('familyMembers').get();
        if (familySnapshot.empty) return [];

        const members = familySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const member of members) {
            if (!member.dob) continue;
            const vaccinationSnapshot = await db.collection('users').doc(uid).collection('familyMembers').doc(member.id).collection('vaccinations').get();
            const completedVaccines = new Set(vaccinationSnapshot.docs.filter(d => d.data().completed).map(d => d.id));

            for (const [ageGroup, vaccines] of Object.entries(vaccinationSchedule)) {
                for (const vaccine of vaccines) {
                    const vaccineId = `${vaccine.name.replace(/[^a-zA-Z0-9]/g, '')}_${ageGroup.replace(/[^a-zA-Z0-9]/g, '')}`;
                    if (completedVaccines.has(vaccineId)) continue;

                    const dueDate = getVaccineDate(member.dob, ageGroup);
                    if (!dueDate) continue;

                    const dayDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

                    if (dayDiff <= 7) {
                        notifications.push({
                            type: 'vaccine',
                            status: dayDiff <= 0 ? 'due' : 'upcoming',
                            memberName: member.name,
                            vaccineName: vaccine.name,
                            sortDate: dueDate
                        });
                    }
                }
            }
        }
        return notifications;
    }

    const renderNotifications = (groupedNotifications) => {
        notificationList.innerHTML = '';
        const { accessRequests, due, upcoming } = groupedNotifications;

        const totalNotifications = accessRequests.length + due.length + upcoming.length;
        if (totalNotifications === 0) {
            notificationList.innerHTML = `<p>No new notifications.</p>`;
            return;
        }

        const createGroup = (titleKey, items, isInitiallyOpen = false) => {
            if (items.length === 0) return;

            const groupWrapper = document.createElement('div');
            groupWrapper.className = 'notification-group';
            if (isInitiallyOpen) {
                groupWrapper.classList.add('is-open');
            }

            const titleText = t(titleKey);

            let countBadgeColorClass = '';
            if (titleKey === 'vaccineDue') {
                countBadgeColorClass = 'due';
            } else if (titleKey === 'vaccineUpcoming') {
                countBadgeColorClass = 'upcoming';
            }

            groupWrapper.innerHTML = `
                <button class="notification-group-toggle">
                    <span class="notification-group-title">${titleText}</span>
                    <span class="notification-group-count ${countBadgeColorClass}">${items.length}</span>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="notification-group-content"></div>
            `;

            const contentContainer = groupWrapper.querySelector('.notification-group-content');

            items.forEach(notification => {
                const item = document.createElement('div');
                item.className = 'notification-item';

                if (notification.type === 'accessRequest') {
                    item.classList.add('access-request');
                    item.innerHTML = `
                        <div class="notification-icon"><i class="fa-solid fa-user-shield"></i></div>
                        <div class="notification-content">
                            <p><strong>${notification.workerName}</strong> wants to connect with you.</p>
                            <small>They will be able to view your family's health profile.</small>
                            <div class="notification-actions">
                                <button class="btn-deny" data-request-id="${notification.id}">Deny</button>
                                <button class="btn-approve" data-request-id="${notification.id}" data-worker-uid="${notification.workerUid}">Approve</button>
                            </div>
                        </div>`;
                } else if (notification.type === 'vaccine') {
                    item.classList.add(notification.status);
                    item.innerHTML = `
                        <div class="notification-icon"><i class="fa-solid fa-syringe"></i></div>
                        <div class="notification-content">
                            <p><strong>${notification.vaccineName}</strong> vaccine for <strong>${notification.memberName}</strong> is ${notification.status}.</p>
                        </div>`;
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', () => {
                        openVaccinationModal();
                        sidebar.classList.remove('expanded', 'showing-notifications');
                    });
                }
                contentContainer.appendChild(item);
            });

            notificationList.appendChild(groupWrapper);
        };

        const hasAccessRequests = accessRequests.length > 0;
        const hasDue = due.length > 0;

        createGroup('accessRequestsTitle', accessRequests, hasAccessRequests);
        createGroup('vaccineDue', due, !hasAccessRequests && hasDue);
        createGroup('vaccineUpcoming', upcoming, !hasAccessRequests && !hasDue);
    };

    const updateNotificationBadge = (count) => {
        if (count > 0) {
            notificationBadge.textContent = count;
            notificationBadge.classList.remove('hidden');
        } else {
            notificationBadge.classList.add('hidden');
        }
    };

    const displayVaccinationSchedule = (member, vaccineStatuses = []) => {
        vaccinationScheduleContainer.innerHTML = '';
        if (!member || !member.dob) {
            vaccinationScheduleContainer.innerHTML = `<p>${t('noMembersForVaccine')}</p>`;
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        Object.entries(vaccinationSchedule).forEach(([ageGroup, vaccines]) => {
            const ageGroupEl = document.createElement('div');
            ageGroupEl.className = 'vaccine-age-group';

            const vaccineDueDate = getVaccineDate(member.dob, ageGroup);
            const formattedDate = formatDate(vaccineDueDate);

            const ageGroupHeader = document.createElement('h3');
            ageGroupHeader.className = 'vaccine-age-group-header';
            ageGroupHeader.innerHTML = `
                <span>${ageGroup}</span>
                <span class="vaccine-due-date">${formattedDate ? `Due by: ${formattedDate}` : ''}</span>
            `;
            ageGroupEl.appendChild(ageGroupHeader);

            vaccines.forEach(vaccine => {
                const vaccineId = `${vaccine.name.replace(/[^a-zA-Z0-9]/g, '')}_${ageGroup.replace(/[^a-zA-Z0-9]/g, '')}`;
                const statusRecord = vaccineStatuses.find(s => s.id === vaccineId);
                const isCompleted = statusRecord ? statusRecord.completed : false;

                let status = 'upcoming';
                let statusKey = 'vaccineUpcoming';

                if (isCompleted) {
                    status = 'completed';
                    statusKey = 'vaccineCompleted';
                } else if (vaccineDueDate) {
                    const timeDiff = vaccineDueDate.getTime() - today.getTime();
                    const dayDiff = timeDiff / (1000 * 3600 * 24);
                    if (dayDiff <= 0) {
                        status = 'due';
                        statusKey = 'vaccineDue';
                    }
                }

                const vaccineItem = document.createElement('div');
                vaccineItem.className = 'vaccine-item';
                vaccineItem.innerHTML = `
                    <input
                        type="checkbox"
                        class="vaccine-checkbox"
                        ${isCompleted ? 'checked' : ''}
                        data-vaccine-id="${vaccineId}"
                        data-vaccine-name="${vaccine.name}"
                        data-age-group="${ageGroup}"
                        data-is-custom="false"
                    >
                    <div class="vaccine-item-details">
                        <div class="vaccine-name">
                            ${vaccine.name}
                            <small>${vaccine.protectsAgainst}</small>
                        </div>
                        <span class="vaccine-status ${status}">${t(statusKey)}</span>
                    </div>
                `;
                ageGroupEl.appendChild(vaccineItem);
            });
            vaccinationScheduleContainer.appendChild(ageGroupEl);
        });

        const customVaccines = vaccineStatuses.filter(v => v.isCustom);
        if (customVaccines.length > 0) {
            const customHeader = document.createElement('h3');
            customHeader.className = 'vaccine-custom-header';
            customHeader.textContent = 'Custom Vaccines';
            vaccinationScheduleContainer.appendChild(customHeader);

            customVaccines.forEach(vaccine => {
                const isCompleted = vaccine.completed || false;
                const vaccineItem = document.createElement('div');
                vaccineItem.className = 'vaccine-item';

                let status = '';
                let statusKey = '';
                let dateText = '';
                let statusSpanHTML = '';

                if (isCompleted) {
                    status = 'completed';
                    statusKey = 'vaccineCompleted';
                    dateText = `Given on: ${vaccine.dateGiven || vaccine.dueDate}`;
                    statusSpanHTML = `<span class="vaccine-status ${status}">${t(statusKey)}</span>`;
                } else {
                    dateText = `Due by: ${vaccine.dueDate}`;
                    const dueDate = new Date(vaccine.dueDate);
                    if (!isNaN(dueDate.getTime())) {
                        const timeDiff = dueDate.getTime() - today.getTime();
                        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        if (dayDiff <= 0) {
                            status = 'due';
                            statusKey = 'vaccineDue';
                        } else if (dayDiff <= 7) {
                            status = 'due';
                            statusKey = 'vaccineDue';
                        } else {
                            status = 'upcoming';
                            statusKey = 'vaccineUpcoming';
                        }
                        statusSpanHTML = `<span class="vaccine-status ${status}">${t(statusKey)}</span>`;
                    }
                }

                vaccineItem.innerHTML = `
                    <input
                        type="checkbox"
                        class="vaccine-checkbox"
                        ${isCompleted ? 'checked' : ''}
                        data-vaccine-id="${vaccine.id}"
                        data-vaccine-name="${vaccine.name}"
                        data-age-group="custom"
                        data-is-custom="true"
                        data-due-date="${vaccine.dueDate || ''}"
                    >
                    <div class="vaccine-item-details">
                        <div class="vaccine-name">
                            ${vaccine.name}
                            <small>${dateText}</small>
                        </div>
                        ${statusSpanHTML}
                    </div>
                `;
                vaccinationScheduleContainer.appendChild(vaccineItem);
            });
        }
    };

    const loadAndDisplayScheduleForMember = async (member) => {
        if (!member) {
            displayVaccinationSchedule(null);
            return;
        }
        const user = auth.currentUser;
        const snapshot = await db.collection('users').doc(user.uid)
            .collection('familyMembers').doc(member.id)
            .collection('vaccinations').get();
        const vaccineStatuses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayVaccinationSchedule(member, vaccineStatuses);
    };

    const openVaccinationModal = async () => {
        vaccinationModalOverlay.classList.remove('hidden');
        vaccinationModalOverlay.classList.add('visible');
        await fetchFamilyMembers();

        vaccineMemberSelect.innerHTML = '';
        if (familyMembers.length > 0) {
            familyMembers.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = member.name;
                vaccineMemberSelect.appendChild(option);
            });
            loadAndDisplayScheduleForMember(familyMembers[0]);
        } else {
            loadAndDisplayScheduleForMember(null);
        }
    };

    const closeVaccinationModal = () => {
        vaccinationModalOverlay.classList.remove('visible');
        setTimeout(() => {
            vaccinationModalOverlay.classList.add('hidden');
            customVaccineForm.classList.add('hidden');
        }, 300);
    };

    vaccineMemberSelect.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const selectedMember = familyMembers.find(m => m.id === selectedId);
        loadAndDisplayScheduleForMember(selectedMember);
    });

    closeVaccinationModalBtn.addEventListener('click', closeVaccinationModal);

    addCustomVaccineBtn.addEventListener('click', () => {
        customVaccineForm.classList.remove('hidden');
    });

    cancelCustomVaccineBtn.addEventListener('click', () => {
        customVaccineForm.classList.add('hidden');
    });

    customVaccineForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        const selectedMemberId = vaccineMemberSelect.value;
        if (!user || !selectedMemberId) {
            alert("Please select a family member first.");
            return;
        }

        const vaccineData = {
            name: document.getElementById('custom-vaccine-name').value,
            protectsAgainst: document.getElementById('custom-vaccine-protects').value,
            dueDate: document.getElementById('custom-vaccine-date').value,
            isCustom: true,
            completed: false
        };

        try {
            const memberRef = db.collection('users').doc(user.uid).collection('familyMembers').doc(selectedMemberId);
            await memberRef.collection('vaccinations').add(vaccineData);

            customVaccineForm.reset();
            customVaccineForm.classList.add('hidden');

            const selectedMember = familyMembers.find(m => m.id === selectedMemberId);
            loadAndDisplayScheduleForMember(selectedMember);
            checkAllNotifications();
        } catch (error) {
            console.error("Error saving custom vaccine:", error);
            alert("Could not save custom vaccine. Please try again.");
        }
    });

    vaccinationScheduleContainer.addEventListener('change', async (e) => {
        if (!e.target.classList.contains('vaccine-checkbox')) return;

        const checkbox = e.target;
        const user = auth.currentUser;
        const selectedMemberId = vaccineMemberSelect.value;
        if (!user || !selectedMemberId) return;

        const {
            vaccineId,
            ageGroup,
            isCustom,
            dueDate
        } = checkbox.dataset;
        const isCompleted = checkbox.checked;

        try {
            const docRef = db.collection('users').doc(user.uid)
                .collection('familyMembers').doc(selectedMemberId)
                .collection('vaccinations').doc(vaccineId);

            let updateData = {};
            if (isCompleted) {
                updateData.completed = true;
                updateData.dateGiven = new Date().toISOString().split('T')[0];
            } else {
                updateData.completed = false;
                updateData.dateGiven = firebase.firestore.FieldValue.delete();
            }

            await docRef.set(updateData, {
                merge: true
            });

            const detailsDiv = checkbox.nextElementSibling;
            const nameDiv = detailsDiv.querySelector('.vaccine-name');
            let statusSpan = detailsDiv.querySelector('.vaccine-status');
            const smallEl = nameDiv.querySelector('small');

            if (isCompleted) {
                if (!statusSpan) {
                    statusSpan = document.createElement('span');
                    detailsDiv.appendChild(statusSpan);
                }
                statusSpan.className = 'vaccine-status completed';
                statusSpan.textContent = t('vaccineCompleted');
                smallEl.textContent = `Given on: ${updateData.dateGiven}`;
            } else {
                let status = 'upcoming';
                let statusKey = 'vaccineUpcoming';
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                let vaccineDueDate;

                if (isCustom === 'true') {
                    smallEl.textContent = `Due by: ${dueDate}`;
                    vaccineDueDate = new Date(dueDate);
                } else {
                    const member = familyMembers.find(m => m.id === selectedMemberId);
                    vaccineDueDate = getVaccineDate(member.dob, ageGroup);
                }

                if (vaccineDueDate && !isNaN(vaccineDueDate.getTime())) {
                    const timeDiff = vaccineDueDate.getTime() - today.getTime();
                    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (dayDiff <= 0) {
                        status = 'due';
                        statusKey = 'vaccineDue';
                    }
                }

                if (!statusSpan) {
                    statusSpan = document.createElement('span');
                    detailsDiv.appendChild(statusSpan);
                }
                statusSpan.className = `vaccine-status ${status}`;
                statusSpan.textContent = t(statusKey);
            }
            checkAllNotifications();
        } catch (error) {
            console.error("Error updating vaccine status: ", error);
            alert("Could not update status. Please try again.");
            checkbox.checked = !isCompleted;
        }
    });

    const savedLang = localStorage.getItem('remediLang') || 'en';
    setLanguage(savedLang);

    const openWorkerLoginModal = () => {
        if (!workerLoginModalOverlay) return;
        workerLoginModalOverlay.classList.remove('hidden');
        workerLoginModalOverlay.classList.add('visible');
    };

    const closeWorkerLoginModal = () => {
        if (!workerLoginModalOverlay) return;
        workerLoginModalOverlay.classList.remove('visible');
        setTimeout(() => {
            workerLoginModalOverlay.classList.add('hidden');
        }, 300);
    };

    closeWorkerLoginModalBtn.addEventListener('click', closeWorkerLoginModal);

    workerLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('worker-email-main').value;
        const password = document.getElementById('worker-password-main').value;
        workerLoginError.textContent = '';
        const submitBtn = workerLoginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            const userDocRef = db.collection('users').doc(user.uid);
            const doc = await userDocRef.get();

            if (doc.exists && doc.data().role === 'worker') {
                window.location.href = 'worker.html';
            } else {
                workerLoginError.textContent = 'Access Denied. Not a worker account.';
                await auth.signOut();
            }
        } catch (error) {
            workerLoginError.textContent = 'Invalid email or password.';
            console.error("Worker login failed:", error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = t('signInAction');
        }
    });

    notificationList.addEventListener('click', async (e) => {
        const user = auth.currentUser;
        if (!user) return;

        const toggleButton = e.target.closest('.notification-group-toggle');
        if (toggleButton) {
            const group = toggleButton.parentElement;
            group.classList.toggle('is-open');
            return;
        }

        if (e.target.classList.contains('btn-approve')) {
            const button = e.target;
            const {
                requestId,
                workerUid
            } = button.dataset;

            button.disabled = true;
            button.textContent = 'Approving...';

            try {
                await db.collection('users').doc(user.uid).update({
                    assignedWorker: workerUid
                });
                await db.collection('accessRequests').doc(requestId).update({
                    status: 'approved'
                });
                checkAllNotifications();
            } catch (error) {
                console.error("Error approving request:", error);
                button.disabled = false;
                button.textContent = 'Approve';
            }

        } else if (e.target.classList.contains('btn-deny')) {
            const button = e.target;
            const {
                requestId
            } = button.dataset;

            button.disabled = true;
            button.textContent = 'Denying...';

            try {
                await db.collection('accessRequests').doc(requestId).update({
                    status: 'denied'
                });
                checkAllNotifications();
            } catch (error) {
                console.error("Error denying request:", error);
                button.disabled = false;
                button.textContent = 'Deny';
            }
        }
    });
});