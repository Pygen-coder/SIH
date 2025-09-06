document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
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

        addMessage(text, 'user');
        userInput.value = '';
        updateMicIcon();
        document.getElementById('suggested-queries').style.display = 'none';

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
            updateMicIcon();
            userInput.focus();
        });
    });

    document.querySelectorAll('.feature-btn').forEach(button => {
        button.addEventListener('click', () => {
            const featureName = button.closest('.dashboard-card').querySelector('h3').textContent;
            alert(`${featureName} is coming soon!`);
        });
    });
});
