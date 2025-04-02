// Main application script
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const messageForm = document.getElementById('message-form');
    const typingIndicator = document.getElementById('typing-indicator');
    const connectionStatus = document.getElementById('connection-status');
    const themeToggle = document.getElementById('theme-toggle'); // This might not exist on all pages
    
    // State
    let conversationHistory = [];
    let isWaitingForResponse = false;
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // Initialize the chat with greeting - only run on pages with chat functionality
    function initializeChat() {
        // Check if we're on the chat page
        if (!chatMessages || !userInput || !messageForm || !typingIndicator) {
            console.log("Chat elements not found - not on chat page");
            return;
        }
        
        console.log("Initializing chat with greeting...");
        
        // Show typing indicator immediately
        typingIndicator.classList.remove('d-none');
        
        // Show connecting status
        if (connectionStatus) {
            updateConnectionStatus('connecting', 'Connecting to chat service...');
        }
        
        // Fetch initial greeting
        fetch('/api/greeting')
            .then(response => {
                if (!response.ok) throw new Error('Server connection failed');
                return response.json();
            })
            .then(data => {
                console.log("Greeting received:", data.message);
                
                // Update connection status
                if (connectionStatus) {
                    updateConnectionStatus('connected', 'Connected to chat service');
                }
                
                // Show greeting after a delay to simulate typing
                setTimeout(() => {
                    // Hide typing indicator
                    typingIndicator.classList.add('d-none');
                    
                    // Add greeting message to chat
                    addMessage(data.message, 'coach');
                    
                    // Focus input field
                    userInput.focus();
                }, 1500); // 1.5 second delay
            })
            .catch(error => {
                console.error('Error fetching greeting:', error);
                if (typingIndicator) typingIndicator.classList.add('d-none');
                if (connectionStatus) {
                    updateConnectionStatus('error', 'Failed to connect to chat service. Please refresh the page.');
                }
            });
    }
    
    // Handle message submission
    if (messageForm) {
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = userInput.value.trim();
            
            if (message && !isWaitingForResponse) {
                sendMessage(message);
                userInput.value = '';
                resizeTextarea(userInput);
            }
        });
    }
    
    // Send message to server
    function sendMessage(message) {
        // Add user message to chat
        addMessage(message, 'user');
        
        // Set typing indicator
        isWaitingForResponse = true;
        showTypingIndicator();
        
        // Send to server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, history: conversationHistory })
        })
        .then(response => {
            if (!response.ok) throw new Error('Server communication error');
            return response.json();
        })
        .then(data => {
            hideTypingIndicator();
            addMessage(data.message, 'coach');
            isWaitingForResponse = false;
        })
        .catch(error => {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            addMessage('I seem to be having trouble connecting right now. Could you try again in a moment?', 'coach');
            isWaitingForResponse = false;
        });
    }
    
    // Add message to chat
    function addMessage(text, sender) {
        // Create message wrapper
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper', `${sender}-message-wrapper`);
        
        // Create profile icon
        const profileIcon = document.createElement('div');
        profileIcon.classList.add('profile-icon');
        
        const profileCircle = document.createElement('div');
        profileCircle.classList.add('profile-circle');
        profileCircle.textContent = sender === 'user' ? 'You' : 'AI';
        
        profileIcon.appendChild(profileCircle);
        
        // Create message container
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // Add message text - with proper formatting for line breaks
        if (sender === 'coach') {
            // Replace newlines with <br> tags for proper formatting
            const formattedText = text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
            messageDiv.innerHTML = formattedText;
        } else {
            messageDiv.textContent = text;
        }
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.classList.add('message-time');
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timestamp);
        
        // Assemble the message
        if (sender === 'user') {
            messageWrapper.appendChild(messageDiv);
            messageWrapper.appendChild(profileIcon);
        } else {
            messageWrapper.appendChild(profileIcon);
            messageWrapper.appendChild(messageDiv);
        }
        
        // Create a wrapper with scroll-bottom class if needed
        if (shouldScrollToBottom()) {
            const scrollWrapper = document.createElement('div');
            scrollWrapper.classList.add('scroll-bottom');
            scrollWrapper.appendChild(messageWrapper);
            chatMessages.appendChild(scrollWrapper);
        } else {
            chatMessages.appendChild(messageWrapper);
        }
        
        // Scroll to bottom
        scrollToBottom();
        
        // Store in history
        if (sender === 'user' || sender === 'coach') {
            conversationHistory.push({ sender, text });
        }
    }
    
    // Check if should auto-scroll to bottom (when user is already at bottom)
    function shouldScrollToBottom() {
        if (!chatMessages) return false;
        const tolerance = 30; // pixels from bottom to still trigger auto-scroll
        return chatMessages.scrollHeight - chatMessages.clientHeight - chatMessages.scrollTop <= tolerance;
    }
    
    // Auto-resize textarea as user types
    if (userInput) {
        userInput.addEventListener('input', () => {
            resizeTextarea(userInput);
        });
    }
    
    function resizeTextarea(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
    
    // Allow Enter to send (but Shift+Enter for new line)
    if (userInput) {
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && messageForm) {
                e.preventDefault();
                messageForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Toggle dark/light theme
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        });
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.classList.remove('d-none');
            scrollToBottom();
        }
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.classList.add('d-none');
        }
    }
    
    // Scroll chat to bottom
    function scrollToBottom() {
        if (!chatMessages) return;
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 10); // Small delay to ensure DOM has updated
    }
    
    // Update connection status
    function updateConnectionStatus(status, message) {
        if (!connectionStatus) return;
        
        connectionStatus.className = `connection-status ${status} text-center text-sm py-2 rounded-lg`;
        connectionStatus.textContent = message;
        connectionStatus.classList.remove('d-none');
        
        if (status === 'error' && userInput && messageForm) {
            userInput.disabled = true;
            const submitButton = messageForm.querySelector('button');
            if (submitButton) submitButton.disabled = true;
        } else if (status === 'connected' && userInput && messageForm) {
            userInput.disabled = false;
            const submitButton = messageForm.querySelector('button');
            if (submitButton) submitButton.disabled = false;
            
            // Hide status after 3 seconds if connected successfully
            setTimeout(() => {
                connectionStatus.classList.add('d-none');
            }, 3000);
        }
    }
    
    // Initialize chat on page load
    initializeChat();
});