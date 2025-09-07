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

    const mainInterface = document.getElementById('main-interface');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const micBtn = document.getElementById('mic-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const historyBtn = document.getElementById('history-btn');
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const micIcon = micBtn.querySelector('i');
    const profileBtnText = document.getElementById('profile-btn-text');

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

    const stopListening = () => {
        if (!isListening) return;
        isListening = false;
        micBtn.classList.remove('listening');
        userInput.placeholder = "Ask anything...";
        clearTimeout(silenceTimeout);
        updateMicIcon();
    };

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        const resetSilenceTimer = () => {
            clearTimeout(silenceTimeout);
            silenceTimeout = setTimeout(() => {
                if (isListening) {
                    recognition.stop();
                }
            }, 3000); // Stop after 3 seconds of silence
        };

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            micIcon.className = 'fa-solid fa-stop';
            micBtn.setAttribute('data-tooltip', 'Stop listening');
            userInput.placeholder = "Listening... please speak clearly.";
            userInput.focus();
            resetSilenceTimer();
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            userInput.value = finalTranscript + interimTranscript;
            if (finalTranscript.trim()) {
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
                stopListening();
            }
        };
    }

    const langLinks = langDropdown.querySelectorAll('a');
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLangText = e.target.textContent;
            const langBtnSpan = langBtn.querySelector('span');
            let newLang = 'en-US';

            if (selectedLangText === 'ଓଡ଼ିଆ') {
                newLang = 'or-IN';
                langBtnSpan.textContent = 'OR';
            } else if (selectedLangText === 'हिन्दी') {
                newLang = 'hi-IN';
                langBtnSpan.textContent = 'HI';
            } else {
                newLang = 'en-US';
                langBtnSpan.textContent = 'EN';
            }

            if (recognition) {
                recognition.lang = newLang;
            }
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
            profileBtnText.textContent = 'Sign in';
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
                return cred.user.updateProfile({
                    displayName: name
                }).then(() => {
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

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        const p = document.createElement('p');
        if (sender === 'bot') {
            p.innerHTML = renderMarkdown(text);
        } else {
            p.innerText = text;
        }
        messageElement.appendChild(p);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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

    async function getBotResponse(userText) {
        const systemPrompt = `
            You are an AI Personal Health Companion for rural citizens of Odisha, India.

            **Your Persona & Style:**
            1.  **Warm and Empathetic:** Your tone must be caring, friendly, and human-like. When a user mentions they are feeling unwell, ALWAYS start with an empathetic response first.
            2.  **Detailed and Clear:** Always give detailed explanations. When you list symptoms or advice, don't just state the point. Explain it in a simple, easy-to-understand sentence. For example, instead of just "Fever," say "1. **Fever:** You might feel hotter than usual as this is your body's natural way of fighting off an infection."
            3.  **Structured Formatting:** Use clean, numbered lists (1., 2., 3., etc.) for advice or symptoms. **Crucially, add an extra line break between each number** to ensure there is clear spacing, making the list very easy to read.
            4.  **Subtle Emojis:** Use emojis sparingly to add a touch of friendliness to your conversation. **Do not use emojis as bullet points for lists.** The numbered list format is what you should use.

            **Core Guidelines (Safety First!):**
            1.  **Primary Focus on Health**: Your main purpose is to answer health-related questions. You can also discuss topics closely related to wellness, such as nutrition, hygiene, exercise, and mental well-being.
            2.  **Handling Off-Topic Questions**: If the user asks about something completely unrelated to health (like politics, sports, etc.), politely decline with a friendly touch. You can say something like: "My purpose is to help with health and wellness questions, so I can't really help with that. Is there a health topic I can assist you with? 😊"
            3.  **Disclaimer is Crucial**: ALWAYS include this clear, bold disclaimer at the beginning of any detailed health advice: "**Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Please consult a qualified doctor for any health concerns.**"
            4.  **Safety First - No Prescriptions**: NEVER prescribe specific medicines or dosages. You can mention general over-the-counter options (like paracetamol for fever) but must immediately state that it's essential to follow packaging directions and check with a doctor or pharmacist first.
            5.  **Encourage Professional Help**: Always conclude your health advice by encouraging the user to visit a nearby health center or consult with a healthcare professional for a proper diagnosis.
        `;
        const payload = {
            contents: [{
                parts: [{
                    text: systemPrompt
                }, {
                    text: `User's question: "${userText}"`
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
            if (!response.ok) {
                console.error("API Error Response:", await response.text());
                return `Error: ${response.statusText}. Please check your API key and network.`;
            }
            const data = await response.json();
            if (data.candidates && data.candidates[0]) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "I'm sorry, I couldn't generate a response. Please try again.";
            }
        } catch (error) {
            console.error("Error fetching from API:", error);
            return "An error occurred. Please check the console.";
        }
    }

    async function handleSendMessage() {
        if (isListening) recognition.stop();
        const text = userInput.value.trim();
        if (!text) return;

        activateChatView();
        addMessage(text, 'user');
        userInput.value = '';
        userInput.dispatchEvent(new Event('input'));

        showTypingIndicator();
        userInput.disabled = true;
        micBtn.disabled = true;

        const botResponse = await getBotResponse(text);

        removeTypingIndicator();
        addMessage(botResponse, 'bot');

        userInput.disabled = false;
        micBtn.disabled = false;
        userInput.focus();
    }

    userInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });

    function updateMicIcon() {
        if (isListening) return;

        if (userInput.value.trim().length > 0) {
            micIcon.className = 'fa-solid fa-paper-plane';
            micBtn.classList.add('send-mode');
            micBtn.setAttribute('data-tooltip', 'Send message');
        } else {
            micIcon.className = 'fa-solid fa-microphone';
            micBtn.classList.remove('send-mode');
            micBtn.setAttribute('data-tooltip', 'Speak your message');
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

    uploadBtn.addEventListener('click', () => alert("Image upload is coming soon!"));
    historyBtn.addEventListener('click', () => alert("Chat history is coming soon!"));
});

