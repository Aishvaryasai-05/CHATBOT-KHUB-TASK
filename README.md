# Simple AI Chatbot

A beginner-friendly AI chatbot built with Flask and Google Gemini AI. Features real-time messaging, conversation history, and a clean interface.

## Features

- **Real-time messaging** - No page reloads, instant responses
- **Short AI responses** - Simple 1-2 sentence answers, not long text
- **Conversation history** - All chats saved automatically
- **Visual logos** - Clean human and robot logo images
- **Simple design** - Easy to use with touch support
- **Search functionality** - Find previous conversations quickly
- **Mobile friendly** - Works great on phones and tablets

## Getting Started

1. **Get a Gemini API Key**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key

2. **Add the API Key**
   - Add `GEMINI_API_KEY` to your Replit Secrets
   - Or update the `.env` file with your key

3. **Run the App**
   - The app will start automatically
   - Open the web view to start chatting

## How to Use

- **Start chatting** - Type a message and press Enter or click Send
- **New conversation** - Click "New Chat" to start fresh
- **Clear chat** - Click "Clear Chat" to empty current conversation
- **Search** - Use the search box to find old conversations
- **Delete chats** - Click the trash can icon to remove chats

## Technical Details

- **Backend**: Python Flask with JSON file storage
- **AI**: Google Gemini 2.5 Flash model
- **Frontend**: Vanilla JavaScript with AJAX for real-time updates
- **Design**: Black background with green accents, mobile-first approach

## Files

- `app.py` - Main Flask application
- `gemini_chat.py` - AI integration
- `templates/index.html` - Main page
- `static/style.css` - Styling
- `static/script.js` - Real-time messaging
- `chat_history.json` - Conversation storage

Perfect for beginners learning web development and AI integration!