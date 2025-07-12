# Simple AI Chatbot with Persistent Conversation History

## Overview

This is a simple AI chatbot web application built with Flask that integrates with Google's Gemini AI. The application provides a clean chat interface with persistent conversation history stored in JSON files. It's designed to be beginner-friendly with straightforward code and a casual user experience.

## User Preferences

Preferred communication style: Simple, everyday language.
Code style: Very basic and simple code for average human mind
Database preference: Simple JSON file storage, no complex databases
Design preference: Casual interface with simple logo images, black background
Backend preference: Python Flask with simple structure
AI response style: Very brief 1 sentence answers for quick responses (Updated 2025-07-12)
UI interaction style: No page reloads for delete/clear/new chat actions (Updated 2025-07-12)
App title: KIET KHUB TASK - CHATBOT with background pattern (Updated 2025-07-12)

## System Architecture

### Frontend Architecture
- **Technology**: Vanilla HTML, CSS, and JavaScript (no frameworks)
- **Design Philosophy**: Simple, casual interface with emoji icons and touch-friendly design
- **Responsive Design**: Mobile-first approach with larger buttons and touch support
- **Real-time Features**: Live search functionality and instant chat loading

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Architecture Pattern**: Simple MVC pattern with minimal complexity
- **API Design**: RESTful endpoints for chat operations
- **Session Management**: Basic Flask session handling

### Data Storage
- **Primary Storage**: JSON file-based persistence (`chat_history.json`)
- **Storage Strategy**: Simple file I/O operations for chat history
- **Data Structure**: Nested JSON with chats array containing message objects
- **Rationale**: Chosen for simplicity and ease of understanding for beginners

## Key Components

### Core Application (`app.py`)
- Flask application setup and configuration
- Route handlers for main functionality
- Chat history management functions
- Session management and error handling

### AI Integration (`gemini_chat.py`)
- Google Gemini AI client integration
- Message processing and response generation
- Context-aware conversation handling
- Error handling for AI service failures

### Frontend Components
- **HTML Template** (`templates/index.html`): Main chat interface
- **CSS Styling** (`static/style.css`): Dark theme with dotted background pattern
- **JavaScript** (`static/script.js`): Client-side functionality for search, messaging, and UI interactions

### Entry Point (`main.py`)
- Application startup and configuration
- Development server setup

## Data Flow

1. **User Input**: User types message in chat interface
2. **Frontend Processing**: JavaScript captures input and sends to backend
3. **Backend Processing**: Flask receives message and forwards to Gemini AI
4. **AI Processing**: Gemini AI generates response based on context
5. **Data Persistence**: Chat history saved to JSON file
6. **Response Delivery**: AI response sent back to frontend
7. **UI Update**: Chat interface updated with new messages

### Chat History Management
- **Loading**: Chat history loaded from JSON file on startup
- **Saving**: Automatic saving after each message exchange
- **Search**: Real-time search through chat titles and messages
- **Navigation**: Click-to-load previous conversations

## External Dependencies

### Required APIs
- **Google Gemini AI**: Primary AI service for generating responses
- **API Key**: Required via `GEMINI_API_KEY` environment variable

### Python Dependencies
- **Flask**: Web framework for backend
- **google-genai**: Google's Gemini AI client library
- **Standard Library**: json, logging, datetime, os

### Environment Variables
- `GEMINI_API_KEY`: Google Gemini AI API key (required)
- `SESSION_SECRET`: Flask session secret key (optional, has default)

## Deployment Strategy

### Development Setup
- **Local Development**: Run via `python main.py`
- **Debug Mode**: Enabled for development with detailed logging
- **Host Configuration**: Configured to run on `0.0.0.0:5000`

### Production Considerations
- **Environment Variables**: Must be set for API keys
- **File Permissions**: Ensure write permissions for JSON file storage
- **Error Handling**: Graceful degradation when AI service is unavailable
- **Logging**: Basic logging setup for debugging and monitoring

### Scalability Notes
- **Current Limitation**: Single JSON file storage not suitable for high traffic
- **Future Enhancement**: Could be upgraded to database storage (Postgres compatible)
- **Session Management**: Currently uses basic Flask sessions

## Technical Design Decisions

### JSON File Storage
- **Problem**: Need persistent chat history without database complexity
- **Solution**: Simple JSON file with structured data
- **Pros**: Easy to understand, no database setup required, human-readable
- **Cons**: Not suitable for concurrent users or high volume

### Gemini AI Integration
- **Problem**: Need reliable AI responses with context awareness
- **Solution**: Google Gemini API with conversation context
- **Pros**: High-quality responses, good context handling
- **Cons**: Requires API key and internet connection

### Real-time Chat Implementation (Updated 2025-07-12)
- **Problem**: User wanted continuous conversation without page reloads
- **Solution**: AJAX/fetch API for instant messaging with visual icons
- **Pros**: Modern chat experience, immediate responses, better UX
- **Cons**: Slightly more complex JavaScript code

### Vanilla JavaScript Frontend
- **Problem**: Need interactive chat interface
- **Solution**: Pure JavaScript without frameworks, enhanced with real-time features
- **Pros**: Simple to understand, no build process, lightweight, real-time messaging
- **Cons**: More manual DOM manipulation required

### Flask Backend
- **Problem**: Need web server for AI integration and file handling
- **Solution**: Flask with minimal configuration
- **Pros**: Simple setup, easy to understand, good for beginners
- **Cons**: Not as robust as full frameworks for large applications