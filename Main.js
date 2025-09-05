document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to our HTML elements ---
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const historyBtn = document.getElementById('history-btn');
    
    // --- Header dropdown elements ---
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // --- Get reference to the icon inside the mic button ---
    const micIcon = micBtn.querySelector('i');

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

    const cards = document.querySelectorAll('.dashboard-card');
    const dashboardColumn = document.getElementById('dashboard-column');

    const observerOptions = {
      root: dashboardColumn,
      rootMargin: '0px',
      threshold: 0.2
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        cardObserver.observe(card);
    });
    
    function toggleDropdown(dropdown) {
        dropdown.classList.toggle('show');
    }

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.remove('show');
        toggleDropdown(profileDropdown);
    });

    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.remove('show');
        toggleDropdown(langDropdown);
    });

    window.addEventListener('click', () => {
        if (profileDropdown.classList.contains('show')) {
            profileDropdown.classList.remove('show');
        }
        if (langDropdown.classList.contains('show')) {
            langDropdown.classList.remove('show');
        }
    });

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    
        const p = document.createElement('p');
        p.innerText = text;
        messageElement.appendChild(p);
    
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function resetIcon() {
        micIcon.classList.remove('fa-paper-plane');
        micIcon.classList.add('fa-microphone');
        micBtn.classList.remove('send-mode');
        micBtn.setAttribute('data-tooltip', 'Speak your message');
    }

    // In Main.js, replace your existing handleSendMessage function

    function handleSendMessage() {
        const text = userInput.value.trim();

        if (text) {
            addMessage(text, 'user');
            userInput.value = '';
            resetIcon();
            document.getElementById('suggested-queries').style.display = 'none';

            // --- Start of new code ---
            // Add the typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.classList.add('typing-indicator');
            typingIndicator.innerHTML = '<span></span><span></span><span></span>';
            typingIndicator.id = 'typing-indicator'; // Give it an ID to easily remove it
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            // --- End of new code ---

            userInput.disabled = true;
            micBtn.disabled = true;

            setTimeout(() => {
                // --- Remove the indicator before adding the real message ---
                document.getElementById('typing-indicator').remove();

                addMessage("Thank you for your message. I am processing your request.", 'bot');
                userInput.disabled = false;
                micBtn.disabled = false;
                userInput.focus();
            }, 1500); // You can adjust this delay
        }
    }
    
    userInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });
    
    userInput.addEventListener('input', () => {
        const text = userInput.value.trim();
        if (text.length > 0) {
            micIcon.classList.remove('fa-microphone');
            micIcon.classList.add('fa-paper-plane');
            micBtn.classList.add('send-mode');
            micBtn.setAttribute('data-tooltip', 'Send message');
        } else {
            resetIcon();
        }
    });

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
    
    const queryButtons = document.querySelectorAll('.query-btn');
    queryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const queryText = button.innerText;
            userInput.value = queryText;
            userInput.dispatchEvent(new Event('input')); // Update icon to send
            userInput.focus(); // Focus on the input field
        });
    });

    const featureButtons = document.querySelectorAll('.feature-btn');
    featureButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cardHeader = button.closest('.dashboard-card').querySelector('.panel-header h3');
            const featureName = cardHeader ? cardHeader.textContent : 'This feature';
            alert(`${featureName} is coming soon!`);
        });
    });

});