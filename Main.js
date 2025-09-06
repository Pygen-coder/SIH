document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Configuration ---
    const firebaseConfig = {
      apiKey: "AIzaSyDZpgomP6wL0shJBytulfaLqjj0c0kXa2k",
      authDomain: "sih-health-bot.firebaseapp.com",
      projectId: "sih-health-bot",
      storageBucket: "sih-health-bot.appspot.com",
      messagingSenderId: "453736771753",
      appId: "1:453736771753:web:2cd6beb18ea09aae3b39b8",
      measurementId: "G-Z08N0GQ794"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();


    // --- DOM Element Selection ---
    const chatPanel = document.getElementById('chat-panel');
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

    // Auth Dropdown Elements
    const loggedOutView = document.querySelector('.logged-out-view');
    const loggedInView = document.querySelector('.logged-in-view');
    const loginBtnDropdown = document.getElementById('login-btn-dropdown');
    const signupBtnDropdown = document.getElementById('signup-btn-dropdown');
    const logoutLink = document.getElementById('logout-link');
    const userNameDropdown = document.getElementById('user-name-dropdown');
    const userEmailDropdown = document.getElementById('user-email-dropdown');

    // Auth Modal Elements
    const authContainer = document.querySelector('.auth-container');
    const authCard = document.getElementById('auth-card');
    const signUpBtnCard = document.getElementById('signUp');
    const signInBtnCard = document.getElementById('signIn');
    const signInMobileLink = document.getElementById('signInMobile');
    const signUpMobileLink = document.getElementById('signUpMobile');
    
    // Auth Forms
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const googleSignupBtn = document.getElementById('google-signup-btn');
    const googleSigninBtn = document.getElementById('google-signin-btn');


    // --- Gemini API Configuration ---
    // IMPORTANT: Replace "YOUR_GEMINI_API_KEY" with your actual API key from Google AI Studio.
    const API_KEY = "AIzaSyBECBXaynBqi1J4kD0rabcRhW97Sps28mc";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    // --- Theme Management ---
    const applyTheme = () => {
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    };

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        applyTheme();
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // --- Dashboard Card Animation ---
    const cards = document.querySelectorAll('.dashboard-card');
    const dashboardColumn = document.getElementById('dashboard-column');

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { root: dashboardColumn, threshold: 0.2 });

    cards.forEach(card => cardObserver.observe(card));

    // --- Dropdown Menu Logic ---
    function toggleDropdown(dropdown, otherDropdown) {
        otherDropdown.classList.remove('show');
        dropdown.classList.toggle('show');
    }

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(profileDropdown, langDropdown);
    });

    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(langDropdown, profileDropdown);
    });

    window.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        langDropdown.classList.remove('show');
    });

    // --- Auth Modal Logic ---
    if (authContainer) {
        // Desktop Toggle
        signUpBtnCard.addEventListener('click', () => authCard.classList.add("right-panel-active"));
        signInBtnCard.addEventListener('click', () => authCard.classList.remove("right-panel-active"));
        
        // Get the new mobile slider element
        const mobileSlider = document.querySelector('.mobile-accent-slider');

        // Mobile Toggle with Animation
        signInMobileLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Only run animation if we are switching panels
            if (authCard.classList.contains("right-panel-active")) {
                if (mobileSlider) {
                    mobileSlider.classList.add('is-animating');
                    // Important: remove the class after animation to allow it to run again
                    mobileSlider.addEventListener('animationend', () => {
                        mobileSlider.classList.remove('is-animating');
                    }, { once: true });
                }
                authCard.classList.remove("right-panel-active");
            }
        });

        signUpMobileLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Only run animation if we are switching panels
            if (!authCard.classList.contains("right-panel-active")) {
                if (mobileSlider) {
                    mobileSlider.classList.add('is-animating');
                    // Important: remove the class after animation to allow it to run again
                    mobileSlider.addEventListener('animationend', () => {
                        mobileSlider.classList.remove('is-animating');
                    }, { once: true });
                }
                authCard.classList.add("right-panel-active");
            }
        });


        authContainer.addEventListener('click', (event) => {
            if (event.target === authContainer) {
                authContainer.classList.remove('show');
            }
        });
    }

    function openAuthModal(showSignUp = false) {
        if (!authContainer) return;
        
        if(showSignUp) {
            authCard.classList.add("right-panel-active");
        } else {
            authCard.classList.remove("right-panel-active");
        }
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


    // --- Firebase Authentication Logic ---

    function updateUserProfileUI(user) {
        const avatarCapsule = document.getElementById('profile-avatar-capsule');
        const avatarDropdown = document.getElementById('profile-avatar-dropdown');

        if (user) {
            // --- User is SIGNED IN ---
            loggedOutView.style.display = 'none';
            loggedInView.style.display = 'block';

            const displayName = user.displayName || user.email.split('@')[0];
            profileBtnText.textContent = displayName;
            userNameDropdown.textContent = user.displayName || 'User';
            userEmailDropdown.textContent = user.email;

            // Avatar Logic
            if (user.photoURL) {
                const imgHTML = `<img src="${user.photoURL}" alt="Profile Picture">`;
                avatarCapsule.innerHTML = imgHTML;
                avatarDropdown.innerHTML = imgHTML;
            } else {
                const initial = (displayName).charAt(0).toUpperCase();
                const colors = ["#ffc107", "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#00bcd4", "#4caf50", "#8bc34a", "#ff9800", "#795548"];
                const colorIndex = Math.abs(displayName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)) % colors.length;
                const bgColor = colors[colorIndex];
                
                const avatarHTML = `<div class="initials-avatar" style="background-color: ${bgColor}; color: #fff;">${initial}</div>`;
                avatarCapsule.innerHTML = avatarHTML;
                avatarDropdown.innerHTML = avatarHTML;
            }

        } else {
            // --- User is SIGNED OUT ---
            loggedOutView.style.display = 'block';
            loggedInView.style.display = 'none';
            profileBtnText.textContent = 'Welcome';

            // Reset avatars to default icon
            avatarCapsule.innerHTML = '<i class="fa-solid fa-user-circle"></i>';
            avatarDropdown.innerHTML = '<i class="fa-solid fa-user-circle fa-2x"></i>';
        }
    }
    
    // Listen for authentication state changes
    auth.onAuthStateChanged(user => {
        updateUserProfileUI(user);
        if (user) {
            // Close dropdowns and modal on successful login/signup
            profileDropdown.classList.remove('show');
            authContainer.classList.remove('show');
        }
    });

    // Sign Up with Email and Password
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupForm['signup-name'].value;
        const email = signupForm['signup-email'].value;
        const password = signupForm['signup-password'].value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // After creation, update the profile with the name
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                // onAuthStateChanged has already fired, but maybe without the displayName.
                // We manually call our UI update function with the latest user data to fix the name instantly.
                updateUserProfileUI(auth.currentUser);
                signupForm.reset();
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Sign In with Email and Password
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signinForm['signin-email'].value;
        const password = signinForm['signin-password'].value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                // onAuthStateChanged will handle UI updates
                signinForm.reset();
            })
            .catch((error) => {
                alert(error.message);
            });
    });
    
    // Sign In/Up with Google
    const handleGoogleSignIn = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .catch((error) => {
                 alert(error.message);
            });
    };

    googleSignupBtn.addEventListener('click', handleGoogleSignIn);
    googleSigninBtn.addEventListener('click', handleGoogleSignIn);


    // Sign Out
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().catch(error => alert(error.message));
    });


    // --- Chat Functionality ---
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        const p = document.createElement('p');
        p.innerText = text;
        messageElement.appendChild(p);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        typingIndicator.id = 'typing-indicator';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async function getBotResponse(userText) {
        const payload = {
            contents: [{
                parts: [{
                    text: userText
                }]
            }]
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                 const errorBody = await response.text();
                 console.error("API Error Response:", errorBody);
                 if (API_KEY === "YOUR_GEMINI_API_KEY") {
                    return "API Key not set. Please add your Gemini API key in Main.js.";
                 }
                 return `Error: ${response.statusText}. Please check your API key and network connection.`;
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                 const botText = data.candidates[0].content.parts[0].text;
                 return botText;
            } else {
                return "I'm sorry, I couldn't generate a response. Please try again.";
            }

        } catch (error) {
            console.error("Error fetching from API:", error);
            return "An error occurred. Please check the console for details.";
        }
    }

    async function handleSendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Activate the chat view on the first message
        if (!chatPanel.classList.contains('chat-active')) {
            chatPanel.classList.add('chat-active');
        }

        addMessage(text, 'user');
        userInput.value = '';
        updateMicIcon();
        
        const chatStarter = document.getElementById('chat-starter');
        if (chatStarter) {
            chatStarter.remove();
        }

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
    
    // --- Event Listeners ---
    userInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    function updateMicIcon() {
        if (userInput.value.trim().length > 0) {
            micIcon.classList.replace('fa-microphone', 'fa-paper-plane');
            micBtn.classList.add('send-mode');
            micBtn.setAttribute('data-tooltip', 'Send message');
        } else {
            micIcon.classList.replace('fa-paper-plane', 'fa-microphone');
            micBtn.classList.remove('send-mode');
            micBtn.setAttribute('data-tooltip', 'Speak your message');
        }
    }
    
    userInput.addEventListener('input', updateMicIcon);

    micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('send-mode')) {
            handleSendMessage();
        } else {
            alert("Voice input feature is coming soon!");
        }
    });
    
    uploadBtn.addEventListener('click', () => {
        alert("Image upload feature for symptom checking is coming soon!");
    });

    historyBtn.addEventListener('click', () => {
        alert("Chat history feature is coming soon!");
    });
    
    document.querySelectorAll('.query-btn').forEach(button => {
        button.addEventListener('click', () => {
            userInput.value = button.innerText;
            handleSendMessage();
        });
    });

    document.querySelectorAll('.feature-btn').forEach(button => {
        button.addEventListener('click', () => {
            const featureName = button.closest('.dashboard-card').querySelector('h3').textContent;
            alert(`${featureName} is coming soon!`);
        });
    });
});
