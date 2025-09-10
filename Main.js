document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCGO9vLvYRUOVz4urMatIvoyMoVOwoa0_8",
        authDomain: "smart-india-hackathon-fb417.firebaseapp.com",
        projectId: "smart-india-hackathon-fb417",
        storageBucket: "smart-india-hackathon-fb417.firebasestorage.app",
        messagingSenderId: "1049386565394",
        appId: "1:1049386565394:web:a1fbd1f9f820c180b6bdcb",
        measurementId: "G-D0CTBFWHYE"
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

    const sidebar = document.getElementById('sidebar');
    const mainInterface = document.getElementById('main-interface');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const micBtn = document.getElementById('mic-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const fileInput = document.getElementById('file-input');
    const filePreviewContainer = document.getElementById('file-preview-container');
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
    const exploreCards = document.querySelectorAll('.explore-card');
    const newThreadBtn = document.getElementById('new-thread-btn');
    const homeBtn = document.getElementById('home-btn');
    const cameraModal = document.getElementById('camera-modal');
    const cameraView = document.getElementById('camera-view');
    const cameraCanvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');
    const discoverSection = document.getElementById('discover-section');
    const discoverItems = document.querySelectorAll('.discover-item');
    const customAlertOverlay = document.getElementById('custom-alert-overlay');
    const customAlertTitle = document.getElementById('custom-alert-title');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertOkBtn = document.getElementById('custom-alert-ok');
    const welcomeModalOverlay = document.getElementById('welcome-modal-overlay');
    const closeWelcomeModalBtn = document.getElementById('close-welcome-modal');
    const dismissWelcomeModalBtn = document.getElementById('dismiss-welcome-modal');
    const signupWelcomeModalBtn = document.getElementById('signup-welcome-modal');
    const loggedOutView = profileDropdown.querySelector('.logged-out-view');
    const loggedInView = profileDropdown.querySelector('.logged-in-view');
    const loginBtnDropdown = document.getElementById('login-btn-dropdown');
    const signupBtnDropdown = document.getElementById('signup-btn-dropdown');
    const logoutLink = document.getElementById('logout-link');
    const userNameDropdown = document.getElementById('user-name-dropdown');
    const userEmailDropdown = document.getElementById('user-email-dropdown');
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
    const deleteHistoryBtn = document.getElementById('delete-history-btn');
    const deleteHistoryDropdown = document.getElementById('delete-history-dropdown');

    const API_KEY = "AIzaSyBolo_dfR-aHyjmvNpTSuAZb2D3LfQi-48";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const updateUIText = (lang) => {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        const elements = document.querySelectorAll('[data-i18n-key]');
        elements.forEach(el => {
            const key = el.dataset.i18nKey;
            const attr = el.dataset.i18nAttr;
            const translation = translations[lang][key];
            if (attr) {
                el.setAttribute(attr, translation);
            } else {
                el.textContent = translation;
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
        }
    };

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
        updateMicIcon();
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
            micBtn.setAttribute('data-tooltip', translations[currentLanguage].micStopTooltip);
            userInput.placeholder = translations[currentLanguage].listeningPlaceholder;
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
            alert(`Sorry, a speech recognition error occurred: ${event.error}\n\nPlease check your microphone connection and browser permissions.`);
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
            userInput.placeholder = translations[currentLanguage].askAnythingPlaceholder;
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
        if (!auth.currentUser) {
            profileBtnText.textContent = translations[lang].profileSignIn;
        }
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
                mobileSlider.addEventListener('animationend', () => mobileSlider.classList.remove('is-animating'), { once: true });
            }
            authCard.classList.toggle("right-panel-active", isSignUp);
        }
        signInMobileLink.addEventListener('click', (e) => { e.preventDefault(); toggleMobilePanel(false); });
        signUpMobileLink.addEventListener('click', (e) => { e.preventDefault(); toggleMobilePanel(true); });
        authContainer.addEventListener('click', (event) => {
            if (event.target === authContainer) authContainer.classList.remove('show');
        });
    }

    function openAuthModal(showSignUp = false) {
        if (!authContainer) return;
        authCard.classList.toggle("right-panel-active", showSignUp);
        authContainer.classList.add('show');
    }
    loginBtnDropdown.addEventListener('click', () => { openAuthModal(false); profileDropdown.classList.remove('show'); });
    signupBtnDropdown.addEventListener('click', () => { openAuthModal(true); profileDropdown.classList.remove('show'); });

    let onAlertOk = null;

    function showCustomAlert(titleKey, messageKey, onOkCallback) {
        if (!customAlertOverlay) return;
        customAlertTitle.textContent = translations[currentLanguage][titleKey] || "Alert";
        customAlertMessage.textContent = translations[currentLanguage][messageKey] || "";
        onAlertOk = onOkCallback;
        customAlertOverlay.classList.remove('hidden');
        customAlertOverlay.classList.add('visible');
    }

    function hideCustomAlert() {
        if (!customAlertOverlay) return;
        customAlertOverlay.classList.remove('visible');
        setTimeout(() => {
            customAlertOverlay.classList.add('hidden');
        }, 300);
        if (typeof onAlertOk === 'function') {
            onAlertOk();
            onAlertOk = null;
        }
    }

    if (customAlertOkBtn) {
        customAlertOkBtn.addEventListener('click', hideCustomAlert);
    }

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
        localStorage.setItem('welcomeMessageShown', 'true');
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
            profileBtnText.textContent = translations[currentLanguage].profileSignIn;
            avatarCapsule.innerHTML = '<i class="fa-solid fa-user-circle"></i>';
            avatarDropdown.innerHTML = '<i class="fa-solid fa-user-circle fa-2x"></i>';
            if (unsubscribeHistory) unsubscribeHistory();
            historyList.innerHTML = '<p>Log in to see your chat history.</p>';
            startNewChat();
        }
    }
    auth.onAuthStateChanged(user => {
        updateUserProfileUI(user);
        if (user) {
            profileDropdown.classList.remove('show');
            if (authContainer) authContainer.classList.remove('show');
        } else {
            if (!localStorage.getItem('welcomeMessageShown')) {
                setTimeout(showWelcomeModal, 2000);
            }
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupForm['signup-name'].value;
        const email = signupForm['signup-email'].value;
        const password = signupForm['signup-password'].value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(cred => {
                return cred.user.updateProfile({ displayName: name })
                    .then(() => {
                        updateUserProfileUI(auth.currentUser);
                    });
            })
            .then(() => { signupForm.reset(); })
            .catch(err => { alert(err.message); });
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
    logoutLink.addEventListener('click', (e) => { e.preventDefault(); auth.signOut(); });

    function addMessage(text, sender, file = null, shouldAnimate = true) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        if(!shouldAnimate) messageElement.style.animation = 'none';
        let contentHTML = '';
        if (file && sender === 'user') {
            const isImage = file.mimeType.startsWith('image/');
            const thumbnailContent = isImage 
                ? `<img src="${file.previewUrl}" alt="preview" class="chat-file-thumbnail">`
                : `<div class="chat-file-thumbnail"><i class="fa-solid fa-file-pdf"></i></div>`;
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
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }

    function typeWriter(element, text, speed = 20, callback) {
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
        await chatRef.set({
            lastMessage: message.text.substring(0, 40),
            timestamp: message.timestamp
        }, { merge: true });
    }

    async function getBotResponse(chatHistory) {
        let langInstruction = '';
        if (currentLanguage === 'hi') langInstruction = 'IMPORTANT: You must respond in Hindi.';
        else if (currentLanguage === 'or') langInstruction = 'IMPORTANT: You must respond in Odia.';
        const systemPrompt = `${langInstruction} You are an AI Personal Health Companion for rural citizens of Odisha, India. **Your Persona & Style:** 1. **Warm and Empathetic:** Your tone must be caring, friendly, and human-like. When a user mentions they are feeling unwell, ALWAYS start with an empathetic response first. 2. **Detailed and Clear:** Always give detailed explanations. When you list symptoms or advice, don't just state the point. Explain it in a simple, easy-to-understand sentence. For example, instead of just "Fever," say "1. **Fever:** You might feel hotter than usual as this is your body's natural way of fighting off an infection." 3. **Structured Formatting:** Use clean, numbered lists (1., 2., 3., etc.) for advice or symptoms. **Crucially, add an extra line break between each number** to ensure there is clear spacing, making the list very easy to read. 4. **Subtle Emojis:** Use emojis sparingly to add a touch of friendliness to your conversation. **Do not use emojis as bullet points for lists.** The numbered list format is what you should use. **Core Guidelines (Safety First!):** 1. **Primary Focus on Health**: Your main purpose is to answer health-related questions. 2. **Handling Off-Topic Questions**: If the user asks about something unrelated to health, politely decline. 3. **Disclaimer is Crucial**: ALWAYS include this clear, bold disclaimer at the beginning of any detailed health advice: "**Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Please consult a qualified doctor for any health concerns.**" 4. **Safety First - No Prescriptions**: NEVER prescribe specific medicines or dosages. 5. **Encourage Professional Help**: Always conclude your health advice by encouraging the user to visit a nearby health center.`;
        const payload = { contents: chatHistory, systemInstruction: { parts: [{ text: systemPrompt }] } };
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    function clearAttachedFile() {
        if(attachedFile && attachedFile.previewUrl) {
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
        
        // BUG FIX: Reset main and header titles to their initial state
        const mainTitle = document.querySelector('.main-title');
        const headerTitle = document.getElementById('header-title');
        if (mainTitle) mainTitle.classList.remove('disappearing');
        if (headerTitle) headerTitle.classList.remove('visible');
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
            const newChatRef = await db.collection('users').doc(user.uid).collection('chats').add({ started: firebase.firestore.FieldValue.serverTimestamp() });
            currentChatId = newChatRef.id;
        }
        activateChatView();
        const fileToSend = attachedFile;
        addMessage(text, 'user', fileToSend);
        const userMessageParts = [{ text }];
        if (fileToSend) {
            userMessageParts.push({ inlineData: { mimeType: fileToSend.mimeType, data: fileToSend.data } });
        }
        conversationHistory.push({ role: 'user', parts: userMessageParts });
        if(user && currentChatId){
            saveMessage(currentChatId, { text: text, sender: 'user', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }
        userInput.value = '';
        userInput.dispatchEvent(new Event('input'));
        clearAttachedFile();
        updateMicIcon();
        showTypingIndicator();
        userInput.disabled = true;
        micBtn.disabled = true;
        const botResponse = await getBotResponse(conversationHistory);
        conversationHistory.push({ role: 'model', parts: [{ text: botResponse }] });
        if(user && currentChatId){
            saveMessage(currentChatId, { text: botResponse, sender: 'bot', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }
        removeTypingIndicator();
        const botMessageBubble = addMessage('', 'bot');
        const p_element = botMessageBubble.querySelector('p');
        typeWriter(p_element, botResponse, 20, () => {
            userInput.disabled = false;
            micBtn.disabled = false;
            userInput.focus();
        });
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
            micBtn.setAttribute('data-tooltip', translations[currentLanguage].sendTooltip);
        } else {
            micIcon.className = 'fa-solid fa-microphone';
            micBtn.classList.remove('send-mode');
            micBtn.setAttribute('data-tooltip', translations[currentLanguage].micTooltip);
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
            alert("Voice input is not supported in your browser.");
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
        filePreviewContainer.innerHTML = `<div class="file-preview-item">${thumbnailContent}<span class="file-info">${file.name}</span><button class="remove-file-btn" title="Remove file">&times;</button></div>`;
        filePreviewContainer.querySelector('.remove-file-btn').addEventListener('click', () => {
            clearAttachedFile();
            updateMicIcon();
        });
    }

    async function handleFile(file) {
        if (!file) return;
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert(`File is too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB.`);
            clearAttachedFile();
            return;
        }
        try {
            const base64Data = await fileToBase64(file);
            const objectURL = URL.createObjectURL(file);
            attachedFile = { name: file.name, mimeType: file.type, data: base64Data, previewUrl: objectURL };
            displayFilePreview(file, objectURL);
            updateMicIcon();
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Could not process the file.");
            clearAttachedFile();
        }
    }

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    
    async function openCamera() {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            alert("Your browser does not support camera access.");
            return;
        }
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            cameraView.srcObject = cameraStream;
            cameraModal.style.display = 'flex';
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access the camera. Please check permissions.");
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
            const imageFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFile(imageFile);
            closeCamera();
        }, 'image/jpeg');
    }

    cameraBtn.addEventListener('click', openCamera);
    closeCameraBtn.addEventListener('click', closeCamera);
    captureBtn.addEventListener('click', takePicture);

    if(welcomeModalOverlay) {
        closeWelcomeModalBtn.addEventListener('click', hideWelcomeModal);
        dismissWelcomeModalBtn.addEventListener('click', hideWelcomeModal);
        signupWelcomeModalBtn.addEventListener('click', () => {
            hideWelcomeModal();
            openAuthModal(true);
        });
    }

    historyBtn.addEventListener('click', () => {
        if (auth.currentUser) {
            if (sidebar.classList.contains('showing-discover') || !sidebar.classList.contains('expanded')) {
                sidebar.classList.remove('showing-discover');
                sidebar.classList.add('showing-history');
                sidebar.classList.add('expanded');
            } else {
                sidebar.classList.toggle('expanded');
            }
        } else {
            showCustomAlert('signInRequiredTitle', 'signInToViewHistory', () => openAuthModal());
        }
    });

    discoverBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.currentUser) {
            if (sidebar.classList.contains('showing-history') || !sidebar.classList.contains('expanded')) {
                sidebar.classList.remove('showing-history');
                sidebar.classList.add('showing-discover');
                sidebar.classList.add('expanded');
            } else {
                sidebar.classList.toggle('expanded');
            }
        } else {
            showCustomAlert('signInRequiredTitle', 'signInToUseDiscover', () => openAuthModal());
        }
    });

    notificationBtn.addEventListener('click', () => {
        if (auth.currentUser) {
            showCustomAlert('Notifications', 'The Notifications feature is coming soon!');
        } else {
            showCustomAlert('signInRequiredTitle', 'signInToUseNotifications', () => openAuthModal());
        }
    });

    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sidebar.classList.remove('expanded');
    });
    
    discoverItems.forEach(card => {
        card.addEventListener('click', () => {
            const query = card.dataset.query;
            const feature = card.dataset.feature;
            if (query) {
                userInput.value = query;
                handleSendMessage();
                sidebar.classList.remove('expanded');
            } else if (feature) {
                showCustomAlert('Coming Soon', `The "${feature}" feature is under development!`);
            }
        });
    });

    newThreadBtn.addEventListener('click', startNewChat);

    function fetchChatHistory(uid) {
        if (unsubscribeHistory) unsubscribeHistory();
        const historyQuery = db.collection('users').doc(uid).collection('chats').orderBy('timestamp', 'desc');
        unsubscribeHistory = historyQuery.onSnapshot(snapshot => {
            if (snapshot.empty) {
                historyList.innerHTML = '<p>No chats yet. Start a conversation!</p>';
                return;
            }
            historyList.innerHTML = '';
            snapshot.forEach(doc => {
                const chat = doc.data();
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.dataset.chatId = doc.id;
                
                const title = chat.lastMessage || 'New Chat';
                const date = chat.timestamp ? chat.timestamp.toDate().toLocaleDateString() : '';

                // NEW: HTML structure with delete button
                historyItem.innerHTML = `
                    <div class="history-item-main">
                        <p>${title}</p>
                        <small>${date}</small>
                    </div>
                    <button class="delete-chat-btn" data-chat-id="${doc.id}" title="Delete chat">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                historyList.appendChild(historyItem);
            });
        }, err => {
            console.error("Error fetching history:", err);
            historyList.innerHTML = '<p>Could not load chat history.</p>';
        });
    }

    // NEW: Delegated event listener for the entire history list
    historyList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-chat-btn');
        const historyItemMain = e.target.closest('.history-item-main');
    
        if (deleteBtn) {
            e.stopPropagation(); // Prevent the main item click from firing
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

            // If the deleted chat was the one currently open, reset the view
            if (currentChatId === chatId) {
                startNewChat();
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
            showCustomAlert('Error', 'Could not delete the chat. Please try again.');
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
            addMessage(msg.text, msg.sender, null, false);
            conversationHistory.push({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] });
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
            showCustomAlert('Error', 'You must be logged in to delete history.');
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
            showCustomAlert('Error', 'Could not delete chat history. Please try again.');
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

    const savedLang = localStorage.getItem('remediLang') || 'en';
    setLanguage(savedLang);
});