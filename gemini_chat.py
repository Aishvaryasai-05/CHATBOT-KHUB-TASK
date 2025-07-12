import os
import logging
from google import genai

# Set up the Gemini AI client
# This gets the API key from environment variables
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "your-api-key-here"))

def get_gemini_response(user_message):
    """
    Get a response from Gemini AI
    This is where the magic happens - we send the user's message to AI and get a response
    """
    try:
        # Create a very simple prompt for quick responses
        prompt = f"""Answer briefly in 1 sentence: {user_message}"""
        
        # Send the message to Gemini and get response
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # Using the newest model
            contents=prompt
        )
        
        # Return the AI's response, or a fallback message if something went wrong
        if response.text:
            return response.text.strip()
        else:
            return "Sorry, I didn't understand that. Could you try asking in a different way?"
            
    except Exception as e:
        # Log the error so we can see what happened
        logging.error(f"Error getting Gemini response: {e}")
        return "Oops! Something went wrong. Please try again in a moment."

def get_gemini_response_with_context(user_message, chat_history):
    """
    Get a response from Gemini AI with chat history context
    This makes the AI remember previous messages in the conversation
    """
    try:
        # Build the conversation context with simple formatting
        context = """Answer briefly in 1 sentence. Here's our conversation:
        
        """
        
        # Add the last few messages for context (to avoid making requests too long)
        recent_messages = chat_history[-4:]  # Last 4 messages for faster responses
        for message in recent_messages:
            role = "Human" if message["role"] == "user" else "Assistant"
            context += f"{role}: {message['content']}\n"
        
        context += f"\nHuman: {user_message}\nAssistant:"
        
        # Send to Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=context
        )
        
        if response.text:
            return response.text.strip()
        else:
            return "Sorry, I didn't understand that. Could you try asking in a different way?"
            
    except Exception as e:
        logging.error(f"Error getting Gemini response with context: {e}")
        return "Oops! Something went wrong. Please try again in a moment."
