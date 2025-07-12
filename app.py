import os
import json
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for
from gemini_chat import get_gemini_response

# Set up basic logging so we can see what's happening
logging.basicConfig(level=logging.DEBUG)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "your-secret-key-here")

# File to store all our chat history
CHAT_HISTORY_FILE = "chat_history.json"

def load_chat_history():
    """Load chat history from JSON file - simple and easy"""
    try:
        with open(CHAT_HISTORY_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # If file doesn't exist, return empty structure
        return {"chats": []}
    except json.JSONDecodeError:
        # If file is corrupted, start fresh
        return {"chats": []}

def save_chat_history(history):
    """Save chat history to JSON file - simple and easy"""
    try:
        with open(CHAT_HISTORY_FILE, 'w') as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        logging.error(f"Error saving chat history: {e}")

def create_new_chat():
    """Create a new empty chat session"""
    return {
        "id": str(datetime.now().timestamp()),
        "title": "New Chat",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "messages": []
    }

@app.route('/')
def home():
    """Main page - show the chatbot interface"""
    return render_template('index.html')

@app.route('/new_chat', methods=['POST'])
def new_chat():
    """Create a new chat and redirect to home"""
    try:
        history = load_chat_history()
        new_chat_data = create_new_chat()
        history["chats"].append(new_chat_data)
        save_chat_history(history)
        
        # Return JSON response for AJAX requests
        if request.is_json:
            return jsonify({
                "success": True,
                "chat_id": new_chat_data["id"],
                "chat_title": new_chat_data["title"],
                "message": "New chat created successfully"
            })
        else:
            return redirect(url_for('home'))
            
    except Exception as e:
        logging.error(f"Error creating new chat: {e}")
        if request.is_json:
            return jsonify({"error": "Error creating new chat"}), 500
        else:
            return redirect(url_for('home'))

@app.route('/send_message', methods=['POST'])
def send_message():
    """Send a message and get AI response via AJAX"""
    try:
        # Get the message from the request
        if request.is_json:
            data = request.get_json()
            user_message = data.get('message', '').strip()
            chat_id = data.get('chat_id', '')
        else:
            user_message = request.form.get('message', '').strip()
            chat_id = request.form.get('chat_id', '')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Load current chat history
        history = load_chat_history()
        
        # Find the current chat or use the last one, or create a new one
        current_chat = None
        if chat_id:
            for chat in history["chats"]:
                if chat["id"] == chat_id:
                    current_chat = chat
                    break
        
        # If no specific chat requested, use the most recent chat
        if not current_chat and history["chats"]:
            current_chat = history["chats"][-1]  # Get the last chat
        
        # If still no chat, create a new one
        if not current_chat:
            current_chat = create_new_chat()
            history["chats"].append(current_chat)
        
        # Add user message to chat
        user_msg_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        current_chat["messages"].append({
            "role": "user",
            "content": user_message,
            "timestamp": user_msg_timestamp
        })
        
        # Set chat title based on first message
        if current_chat["title"] == "New Chat" and user_message:
            current_chat["title"] = user_message[:50] + "..." if len(user_message) > 50 else user_message
        
        # Get AI response using Gemini with conversation context
        from gemini_chat import get_gemini_response_with_context
        ai_response = get_gemini_response_with_context(user_message, current_chat["messages"])
        
        # Add AI response to chat
        ai_msg_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        current_chat["messages"].append({
            "role": "assistant",
            "content": ai_response,
            "timestamp": ai_msg_timestamp
        })
        
        # Save updated history
        save_chat_history(history)
        
        # Return JSON response for AJAX
        return jsonify({
            "success": True,
            "user_message": {
                "content": user_message,
                "timestamp": user_msg_timestamp
            },
            "ai_message": {
                "content": ai_response,
                "timestamp": ai_msg_timestamp
            },
            "chat_id": current_chat["id"],
            "chat_title": current_chat["title"]
        })
        
    except Exception as e:
        logging.error(f"Error sending message: {e}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500

@app.route('/clear_chat', methods=['POST'])
def clear_chat():
    """Clear the current chat messages"""
    try:
        # Handle both form data and JSON data
        if request.is_json:
            data = request.get_json()
            chat_id = data.get('chat_id', '')
        else:
            chat_id = request.form.get('chat_id', '')
        
        history = load_chat_history()
        
        # Find and clear the chat
        for chat in history["chats"]:
            if chat["id"] == chat_id:
                chat["messages"] = []
                break
        
        save_chat_history(history)
        
        # Return JSON response for AJAX requests
        if request.is_json:
            return jsonify({"success": True, "message": "Chat cleared successfully"})
        else:
            return redirect(url_for('home'))
        
    except Exception as e:
        logging.error(f"Error clearing chat: {e}")
        if request.is_json:
            return jsonify({"error": "Error clearing chat"}), 500
        else:
            return redirect(url_for('home'))

@app.route('/delete_chat', methods=['POST'])
def delete_chat():
    """Delete a chat completely"""
    try:
        # Handle both form data and JSON data
        if request.is_json:
            data = request.get_json()
            chat_id = data.get('chat_id', '')
        else:
            chat_id = request.form.get('chat_id', '')
        
        history = load_chat_history()
        
        # Remove the chat from history
        history["chats"] = [chat for chat in history["chats"] if chat["id"] != chat_id]
        
        save_chat_history(history)
        
        # Return JSON response for AJAX requests
        if request.is_json:
            return jsonify({"success": True, "message": "Chat deleted successfully"})
        else:
            return redirect(url_for('home'))
        
    except Exception as e:
        logging.error(f"Error deleting chat: {e}")
        if request.is_json:
            return jsonify({"error": "Error deleting chat"}), 500
        else:
            return redirect(url_for('home'))

@app.route('/get_chat_history')
def get_chat_history():
    """Get all chat history for the sidebar"""
    history = load_chat_history()
    return jsonify(history)

@app.route('/get_chat/<chat_id>')
def get_chat(chat_id):
    """Get a specific chat by ID"""
    history = load_chat_history()
    for chat in history["chats"]:
        if chat["id"] == chat_id:
            return jsonify(chat)
    return jsonify({"error": "Chat not found"}), 404

@app.route('/search_chats')
def search_chats():
    """Search through chat history"""
    search_term = request.args.get('q', '').strip().lower()
    history = load_chat_history()
    
    if not search_term:
        return jsonify(history)
    
    # Filter chats based on search term
    filtered_chats = []
    for chat in history["chats"]:
        # Search in title
        if search_term in chat["title"].lower():
            filtered_chats.append(chat)
            continue
        
        # Search in messages
        for message in chat["messages"]:
            if search_term in message["content"].lower():
                filtered_chats.append(chat)
                break
    
    return jsonify({"chats": filtered_chats})

if __name__ == '__main__':
    # Run the app on port 5000 so it's accessible
    app.run(debug=True, host='0.0.0.0', port=5000)
