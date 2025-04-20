// Main application script
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const messageForm = document.getElementById('message-form');
    const typingIndicator = document.getElementById('typing-indicator');
    const connectionStatus = document.getElementById('connection-status');
    const themeToggle = document.getElementById('theme-toggle'); // This might not exist on all pages
    const freeTrialModal = document.getElementById('free-trial-modal');
    const signupButton = document.getElementById('signup-button');
    const resetDemoButton = document.getElementById('reset-demo');
    
    // State
    let conversationHistory = [];
    let isWaitingForResponse = false;
    let userMessageCount = 0; // Track number of user messages
    const MESSAGE_LIMIT = 10; // Message limit for free trial
    
    // Simple function to check online status
    function checkOnlineStatus() {
        return navigator.onLine === true;
    }
    
    // Check local storage for existing message count
    if (localStorage.getItem('userMessageCount')) {
        userMessageCount = parseInt(localStorage.getItem('userMessageCount'));
    }
    
    // Reset demo functionality
    if (resetDemoButton) {
        resetDemoButton.addEventListener('click', () => {
            // Reset message count
            userMessageCount = 0;
            localStorage.setItem('userMessageCount', userMessageCount);
            
            // Hide modal if it's visible
            if (freeTrialModal && !freeTrialModal.classList.contains('d-none')) {
                freeTrialModal.classList.add('d-none');
                document.body.classList.remove('modal-open');
            }
            
            // Re-enable input if disabled
            if (userInput) userInput.disabled = false;
            if (messageForm) {
                const submitButton = messageForm.querySelector('button');
                if (submitButton) submitButton.disabled = false;
            }
            
            // Add reset confirmation message and remove after 5 seconds
            const msgElem = addMessage("Demo has been reset. You can now send 10 more messages.", "coach");
            setTimeout(() => {
                if (msgElem && msgElem.parentNode) {
                    msgElem.style.transition = "opacity 0.5s";
                    msgElem.style.opacity = "0";
                    setTimeout(() => {
                        if (msgElem.parentNode) msgElem.parentNode.removeChild(msgElem);
                    }, 500);
                }
            }, 5000);
        });
    }
    
    // Free trial modal functions
    function showFreeTrialModal() {
        freeTrialModal.classList.remove('d-none');
        document.body.classList.add('modal-open');
        
        // Disable textarea and submit button
        if (userInput) userInput.disabled = true;
        if (messageForm) {
            const submitButton = messageForm.querySelector('button');
            if (submitButton) submitButton.disabled = true;
        }
    }
    
    // Add signup button event listener
    if (signupButton) {
        signupButton.addEventListener('click', () => {
            // Here you would redirect to your signup page
            window.location.href = '/signup';
        });
    }
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // Add online/offline event listeners to update status in real-time
    window.addEventListener('online', () => {
        console.log('Browser reports online status');
        if (connectionStatus) {
            updateConnectionStatus('connected', 'Connected to chat service');
        }
        // Re-enable chat interface if it was disabled
        if (userInput) userInput.disabled = false;
        if (messageForm) {
            const submitButton = messageForm.querySelector('button');
            if (submitButton) submitButton.disabled = false;
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('Browser reports offline status');
        if (connectionStatus) {
            updateConnectionStatus('error', 'You are offline. Please check your internet connection.');
        }
        // Disable chat interface when offline
        if (userInput) userInput.disabled = true;
        if (messageForm) {
            const submitButton = messageForm.querySelector('button');
            if (submitButton) submitButton.disabled = true;
        }
    });
    
    // Initialize the chat with greeting - only run on pages with chat functionality
    function initializeChat() {
        // Check if we're on the chat page
        if (!chatMessages || !userInput || !messageForm || !typingIndicator) {
            console.log("Chat elements not found - not on chat page");
            return;
        }
        
        console.log("Initializing chat with greeting...");
        
        // First check if online before attempting to connect
        if (!checkOnlineStatus()) {
            console.log("Browser reports offline");
            if (connectionStatus) {
                updateConnectionStatus('error', 'You are offline. Please check your internet connection.');
            }
            if (typingIndicator) typingIndicator.classList.add('d-none');
            return;
        }
        
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
                    updateConnectionStatus('error', 'Failed to connect to chat service. Please check your internet connection.');
                }
            });
    }
    
    // Handle message submission
    if (messageForm) {
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = userInput.value.trim();
            
            if (message && !isWaitingForResponse) {
                // Check if user has reached message limit
                if (userMessageCount >= MESSAGE_LIMIT) {
                    showFreeTrialModal();
                    return;
                }
                
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
        
        // Increment user message count
        userMessageCount++;
        localStorage.setItem('userMessageCount', userMessageCount);
        
        // Check if this message triggered the limit
        if (userMessageCount === MESSAGE_LIMIT) {
            setTimeout(() => {
                showFreeTrialModal();
            }, 1000); // Show modal after a slight delay
        }
        
        // Check online status before attempting to send
        if (!checkOnlineStatus()) {
            hideTypingIndicator();
            addMessage("I can't reach the server right now. Please check your internet connection and try again.", 'coach');
            isWaitingForResponse = false;
            updateConnectionStatus('error', 'You are offline. Please check your internet connection.');
            return;
        }
        
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
            
            // Update connection status to error if there was a problem
            updateConnectionStatus('error', 'Connection issue. Please check your internet connection.');
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
        let elementToAppend = messageWrapper;
        if (shouldScrollToBottom()) {
            const scrollWrapper = document.createElement('div');
            scrollWrapper.classList.add('scroll-bottom');
            scrollWrapper.appendChild(messageWrapper);
            elementToAppend = scrollWrapper;
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
        
        return elementToAppend;
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