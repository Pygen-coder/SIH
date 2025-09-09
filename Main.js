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

    let currentLanguage = 'en';
    let attachedFile = null;
    let cameraStream = null;

    const mainInterface = document.getElementById('main-interface');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const micBtn = document.getElementById('mic-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const fileInput = document.getElementById('file-input');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const historyBtn = document.getElementById('history-btn');
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const micIcon = micBtn.querySelector('i');
    const profileBtnText = document.getElementById('profile-btn-text');
    const exploreCards = document.querySelectorAll('.explore-card');

    const cameraModal = document.getElementById('camera-modal');
    const cameraView = document.getElementById('camera-view');
    const cameraCanvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');

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
    let silenceTimeout;
    let baseText = '';

    const stopListening = () => {
        if (!isListening) return;
        isListening = false;
        micBtn.classList.remove('listening');
        userInput.placeholder = translations[currentLanguage].askAnythingPlaceholder;
        clearTimeout(silenceTimeout);
        updateMicIcon();
    };

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        const resetSilenceTimer = () => { /* Silence timer disabled */ };

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            micIcon.className = 'fa-solid fa-stop';
            micBtn.setAttribute('data-tooltip', translations[currentLanguage].micStopTooltip);
            userInput.placeholder = translations[currentLanguage].listeningPlaceholder;
            userInput.focus();
            baseText = userInput.value ? userInput.value.trim() + ' ' : '';
            resetSilenceTimer();
        };

        recognition.onresult = (event) => {
            const finalTranscriptParts = [];
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptParts.push(transcript.trim());
                } else {
                    interimTranscript = transcript;
                }
            }
            const finalTranscript = finalTranscriptParts.join(' ');
            let fullTranscript = baseText + finalTranscript;
            if (interimTranscript) {
                if (finalTranscript) {
                    fullTranscript += ' ';
                }
                fullTranscript += interimTranscript;
            }
            userInput.value = fullTranscript;
            if (finalTranscript.trim() || interimTranscript.trim()) {
                updateMicIcon();
                userInput.dispatchEvent(new Event('input'));
            }
            resetSilenceTimer();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopListening();
        };

        recognition.onend = () => {
            if (isListening) {
                userInput.value = userInput.value.trim();
                stopListening();
                userInput.dispatchEvent(new Event('input'));
            }
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
        if (dropdown === profileDropdown) {
            langDropdown.classList.remove('show');
        } else {
            profileDropdown.classList.remove('show');
        }
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
    window.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        langDropdown.classList.remove('show');
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
        } else {
            loggedOutView.style.display = 'block';
            loggedInView.style.display = 'none';
            profileBtnText.textContent = translations[currentLanguage].profileSignIn;
            avatarCapsule.innerHTML = '<i class="fa-solid fa-user-circle"></i>';
            avatarDropdown.innerHTML = '<i class="fa-solid fa-user-circle fa-2x"></i>';
        }
    }
    auth.onAuthStateChanged(user => {
        updateUserProfileUI(user);
        if (user) {
            profileDropdown.classList.remove('show');
            if (authContainer) authContainer.classList.remove('show');
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

    function addMessage(text, sender, file = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;

        let contentHTML = '';

        if (file && sender === 'user') {
            const isImage = file.mimeType.startsWith('image/');
            const thumbnailContent = isImage 
                ? `<img src="${file.previewUrl}" alt="preview" class="chat-file-thumbnail">`
                : `<div class="chat-file-thumbnail"><i class="fa-solid fa-file-pdf"></i></div>`;
            
            contentHTML += `
                <div class="chat-file-preview">
                    ${thumbnailContent}
                    <span class="chat-file-name">${file.name}</span>
                </div>
            `;
        }
        
        const p = document.createElement('p');
        if (sender === 'user' && text) {
            p.textContent = text;
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
                element.innerHTML = renderMarkdown(currentText); // Remove cursor at the end
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

    async function getBotResponse(userText, file = null) {
        let langInstruction = '';
        if (currentLanguage === 'hi') langInstruction = 'IMPORTANT: You must respond in Hindi.';
        else if (currentLanguage === 'or') langInstruction = 'IMPORTANT: You must respond in Odia.';

        const systemPrompt = `
            ${langInstruction}
            You are an AI Personal Health Companion for rural citizens of Odisha, India.
            **Your Persona & Style:**
            1.  **Warm and Empathetic:** Your tone must be caring, friendly, and human-like. When a user mentions they are feeling unwell, ALWAYS start with an empathetic response first.
            2.  **Detailed and Clear:** Always give detailed explanations. When you list symptoms or advice, don't just state the point. Explain it in a simple, easy-to-understand sentence. For example, instead of just "Fever," say "1. **Fever:** You might feel hotter than usual as this is your body's natural way of fighting off an infection."
            3.  **Structured Formatting:** Use clean, numbered lists (1., 2., 3., etc.) for advice or symptoms. **Crucially, add an extra line break between each number** to ensure there is clear spacing, making the list very easy to read.
            4.  **Subtle Emojis:** Use emojis sparingly to add a touch of friendliness to your conversation. **Do not use emojis as bullet points for lists.** The numbered list format is what you should use.
            **Core Guidelines (Safety First!):**
            1.  **Primary Focus on Health**: Your main purpose is to answer health-related questions.
            2.  **Handling Off-Topic Questions**: If the user asks about something unrelated to health, politely decline.
            3.  **Disclaimer is Crucial**: ALWAYS include this clear, bold disclaimer at the beginning of any detailed health advice: "**Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Please consult a qualified doctor for any health concerns.**"
            4.  **Safety First - No Prescriptions**: NEVER prescribe specific medicines or dosages.
            5.  **Encourage Professional Help**: Always conclude your health advice by encouraging the user to visit a nearby health center.
        `;
        
        const textPart = userText || (file ? "Please analyze this file." : "");
        
        const parts = [
            { text: systemPrompt },
            { text: `User's question: "${textPart}"` }
        ];
        
        if (file) {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data
                }
            });
        }

        const payload = { contents: [{ parts }] };
        
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

    async function handleSendMessage() {
        if (isListening) recognition.stop();
        const text = userInput.value.trim();
        
        if (!text && !attachedFile) return;

        activateChatView();
        
        const fileToSend = attachedFile;
        addMessage(text, 'user', fileToSend);

        userInput.value = '';
        userInput.dispatchEvent(new Event('input'));
        clearAttachedFile();
        updateMicIcon();

        showTypingIndicator();
        userInput.disabled = true;
        micBtn.disabled = true;

        const botResponse = await getBotResponse(text, fileToSend);

        removeTypingIndicator();
        const botMessageBubble = addMessage('', 'bot');
        const p_element = botMessageBubble.querySelector('p');

        typeWriter(p_element, botResponse, 20, () => {
            // This code runs when typing is finished
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
        const thumbnailContent = isImage 
            ? `<img src="${objectURL}" alt="preview" class="file-thumbnail">`
            : `<div class="file-thumbnail"><i class="fa-solid fa-file-pdf"></i></div>`;

        filePreviewContainer.innerHTML = `
            <div class="file-preview-item">
                ${thumbnailContent}
                <span class="file-info">${file.name}</span>
                <button class="remove-file-btn" title="Remove file">&times;</button>
            </div>
        `;

        filePreviewContainer.querySelector('.remove-file-btn').addEventListener('click', () => {
            clearAttachedFile();
            updateMicIcon();
        });
    }

    async function handleFile(file) {
        if (!file) return;

        const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
        if (file.size > MAX_SIZE) {
            alert(`File is too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB.`);
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

    historyBtn.addEventListener('click', () => alert("Chat history is coming soon!"));
    
    exploreCards.forEach(card => {
        card.addEventListener('click', () => {
            const query = card.dataset.query;
            const feature = card.dataset.feature;
            if (query) {
                userInput.value = query;
                handleSendMessage();
            } else if (feature) {
                alert(`The "${feature}" feature is coming soon!`);
            }
        });
    });

    const savedLang = localStorage.getItem('remediLang') || 'en';
    setLanguage(savedLang);
});