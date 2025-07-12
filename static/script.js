// Simple JavaScript for average human mind - no fancy stuff
let currentChatId = null;
let chatHistory = [];

// Wait for page to load, then set everything up
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    setupEventListeners();
    loadLatestChat(); // Load the latest chat automatically
});

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Search when clicking the search button
    searchBtn.addEventListener('click', function() {
        performSearch();
    });
    
    // Search when pressing Enter in search box
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Real-time search as you type
    searchInput.addEventListener('input', function() {
        performSearch();
    });
    
    // Send message when pressing Enter
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Touch support - tap chat area to focus on input
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.addEventListener('click', function() {
        messageInput.focus();
    });
    
    // Make search input focusable
    searchInput.addEventListener('click', function() {
        this.focus();
    });
}

function loadChatHistory() {
    // Load chat history from the server
    fetch('/get_chat_history')
        .then(response => response.json())
        .then(data => {
            chatHistory = data.chats || [];
            displayChatHistory(chatHistory);
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
            document.getElementById('chatHistory').innerHTML = '<p>Error loading chats</p>';
        });
}

function displayChatHistory(chats) {
    const chatHistoryDiv = document.getElementById('chatHistory');
    
    if (chats.length === 0) {
        chatHistoryDiv.innerHTML = '<p>No chats yet. Start a new conversation!</p>';
        return;
    }
    
    let html = '';
    chats.forEach(chat => {
        html += `
            <div class="chat-item" data-chat-id="${chat.id}" onclick="loadChat('${chat.id}')">
                <div class="chat-item-title">${chat.title}</div>
                <div class="chat-item-date">${formatDate(chat.created_at)}</div>
                <button class="chat-item-delete" onclick="deleteChat('${chat.id}', event)">🗑️</button>
            </div>
        `;
    });
    
    chatHistoryDiv.innerHTML = html;
}

function loadChat(chatId) {
    // Load a specific chat and show its messages
    fetch(`/get_chat/${chatId}`)
        .then(response => response.json())
        .then(chat => {
            if (chat.error) {
                alert('Chat not found');
                return;
            }
            
            currentChatId = chatId;
            document.getElementById('currentChatId').value = chatId;
            document.getElementById('clearChatId').value = chatId;
            document.getElementById('chatTitle').textContent = chat.title;
            
            displayMessages(chat.messages);
            
            // Mark this chat as active
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });
            // Find the chat item that was clicked and mark it active
            const chatItems = document.querySelectorAll('.chat-item');
            chatItems.forEach(item => {
                if (item.getAttribute('data-chat-id') === chatId) {
                    item.classList.add('active');
                }
            });
        })
        .catch(error => {
            console.error('Error loading chat:', error);
            alert('Error loading chat');
        });
}

function displayMessages(messages) {
    const chatMessagesDiv = document.getElementById('chatMessages');
    
    if (messages.length === 0) {
        chatMessagesDiv.innerHTML = `
            <div class="welcome-message">
                <p>👋 This chat is empty. Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    messages.forEach(message => {
        const messageClass = message.role === 'user' ? 'user' : 'assistant';
        const iconSrc = message.role === 'user' ? '/static/human-icon.svg' : '/static/chatbot-icon.svg';
        html += `
            <div class="message ${messageClass}">
                <img src="${iconSrc}" alt="${message.role}" class="message-icon">
                <div class="message-content-wrapper">
                    <div class="message-content">${message.content}</div>
                    <div class="message-timestamp">${formatDate(message.timestamp)}</div>
                </div>
            </div>
        `;
    });
    
    chatMessagesDiv.innerHTML = html;
    
    // Scroll to bottom to show latest messages
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

function deleteChat(chatId, event) {
    // Stop the click from bubbling up to the chat item
    event.stopPropagation();
    
    // Simple confirmation
    if (confirm('Are you sure you want to delete this chat?')) {
        // Send delete request without page reload
        fetch('/delete_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remove the chat from the list immediately
                const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
                if (chatItem) {
                    chatItem.remove();
                }
                
                // If this was the current chat, clear the chat area
                if (currentChatId === chatId) {
                    document.getElementById('chatMessages').innerHTML = `
                        <div class="welcome-message">
                            <p>👋 Hi! I'm your AI assistant. How can I help you today?</p>
                        </div>
                    `;
                    document.getElementById('chatTitle').textContent = '🤖 Chat with AI';
                    currentChatId = null;
                    document.getElementById('currentChatId').value = '';
                    document.getElementById('clearChatId').value = '';
                }
                
                // Update the chat history
                loadChatHistory();
            } else {
                alert('Error deleting chat');
            }
        })
        .catch(error => {
            console.error('Error deleting chat:', error);
            alert('Error deleting chat');
        });
    }
}

function clearChat() {
    // Clear the current chat without page reload
    if (!currentChatId) {
        alert('No chat to clear');
        return;
    }
    
    if (confirm('Are you sure you want to clear this chat?')) {
        // Send clear request without page reload
        fetch('/clear_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: currentChatId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Clear the chat messages immediately
                document.getElementById('chatMessages').innerHTML = `
                    <div class="welcome-message">
                        <p>👋 Chat cleared! Start a new conversation.</p>
                    </div>
                `;
                
                // Update the chat history to reflect the cleared chat
                loadChatHistory();
            } else {
                alert('Error clearing chat');
            }
        })
        .catch(error => {
            console.error('Error clearing chat:', error);
            alert('Error clearing chat');
        });
    }
}

function createNewChat() {
    // Create a new chat without page reload
    fetch('/new_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Set the new chat as current
            currentChatId = data.chat_id;
            document.getElementById('currentChatId').value = data.chat_id;
            document.getElementById('clearChatId').value = data.chat_id;
            document.getElementById('chatTitle').textContent = data.chat_title || '🤖 New Chat';
            
            // Clear the chat messages area
            document.getElementById('chatMessages').innerHTML = `
                <div class="welcome-message">
                    <p>👋 Hi! I'm your AI assistant. How can I help you today?</p>
                </div>
            `;
            
            // Update the chat history to show the new chat
            loadChatHistory();
        } else {
            alert('Error creating new chat');
        }
    })
    .catch(error => {
        console.error('Error creating new chat:', error);
        alert('Error creating new chat');
    });
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!searchTerm) {
        // If search is empty, show all chats
        displayChatHistory(chatHistory);
        return;
    }
    
    // Search through chat history
    fetch(`/search_chats?q=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            displayChatHistory(data.chats || []);
        })
        .catch(error => {
            console.error('Error searching chats:', error);
        });
}

function formatDate(dateString) {
    // Simple date formatting for average human mind
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function loadLatestChat() {
    // Load the most recent chat automatically
    if (chatHistory.length > 0) {
        const latestChat = chatHistory[chatHistory.length - 1];
        currentChatId = latestChat.id;
        document.getElementById('currentChatId').value = latestChat.id;
        document.getElementById('clearChatId').value = latestChat.id;
        document.getElementById('chatTitle').textContent = latestChat.title;
        displayMessages(latestChat.messages);
        
        // Mark the latest chat as active
        document.querySelectorAll('.chat-item').forEach(item => {
            if (item.getAttribute('data-chat-id') === latestChat.id) {
                item.classList.add('active');
            }
        });
    }
}

// Handle form submission for real-time messaging
document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    sendMessage();
});

// Send message function for real-time chat
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // Add user message to chat immediately
    addMessageToChat('user', message);
    
    // Clear the input
    messageInput.value = '';
    
    // Show loading state
    const chatMessagesDiv = document.getElementById('chatMessages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'AI is thinking';
    loadingDiv.id = 'loading-message';
    chatMessagesDiv.appendChild(loadingDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    
    // Send message to server
    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            chat_id: currentChatId
        })
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading message
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.remove();
        }
        
        if (data.success) {
            // Add AI response to chat
            addMessageToChat('assistant', data.ai_message.content);
            
            // Update current chat ID
            currentChatId = data.chat_id;
            document.getElementById('currentChatId').value = data.chat_id;
            document.getElementById('clearChatId').value = data.chat_id;
            
            // Update chat title
            document.getElementById('chatTitle').textContent = data.chat_title;
            
            // Refresh chat history to show updated conversation
            loadChatHistory();
        } else {
            // Show error message
            addMessageToChat('assistant', 'Sorry, something went wrong. Please try again.');
        }
    })
    .catch(error => {
        // Remove loading message
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.remove();
        }
        
        console.error('Error sending message:', error);
        addMessageToChat('assistant', 'Sorry, something went wrong. Please try again.');
    });
}

// Add message to chat display
function addMessageToChat(role, content) {
    const chatMessagesDiv = document.getElementById('chatMessages');
    
    // Remove welcome message if it exists
    const welcomeMessage = chatMessagesDiv.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const now = new Date();
    const timestamp = now.toLocaleString();
    
    // Choose the right icon based on message role
    const iconSrc = role === 'user' ? '/static/human-icon.svg' : '/static/chatbot-icon.svg';
    
    messageDiv.innerHTML = `
        <img src="${iconSrc}" alt="${role}" class="message-icon">
        <div class="message-content-wrapper">
            <div class="message-content">${content}</div>
            <div class="message-timestamp">${timestamp}</div>
        </div>
    `;
    
    chatMessagesDiv.appendChild(messageDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}
