import os
from io import BytesIO
from flask import Flask, Blueprint, render_template, request, jsonify, send_file
from openai import OpenAI
from .config import OPENAI_API_KEY, DEBUG # Adjusted import for blueprint

# Create a Blueprint
leila_bp = Blueprint('leila', __name__, url_prefix='/leila', template_folder='../templates', static_folder='../static')

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

@leila_bp.route('/')
def index():
    # This will look for index.html in a templates folder at the root of kid_chat,
    # or you might need to adjust the path if your main app serves it.
    # For now, assuming it's relative to the blueprint's template_folder
    return render_template('index.html')

@leila_bp.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {'role': 'system', 'content': 'You are Leila, an energetic sheep who loves to chat with children ages 6-7. Keep your replies short, fun, and easy to understand. Use simple words and short sentences. Be encouraging and positive. Ask questions to keep the conversation going. Never use emojis or symbols in your responses.'},
                {'role': 'user', 'content': user_message}
            ],
            temperature=0.7,
            max_tokens=60,
        )
        assistant_reply = response.choices[0].message.content
    except Exception as e:
        print(f"Error: {str(e)}")  # Print error to console
        assistant_reply = f"Error: {str(e)}"
    return jsonify({'reply': assistant_reply})

@leila_bp.route('/tts', methods=['POST'])
def tts():
    """Convert text to speech using OpenAI's API and return an MP3."""
    text = request.json.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=text
        )
        audio_data = response.content
        return send_file(
            BytesIO(audio_data),
            mimetype='audio/mpeg'
        )
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# This part is for running the Flask app independently for development/testing if needed.
# You would typically register the blueprint in your main application's app.py
if __name__ == '__main__':
    app = Flask(__name__)
    # Adjust template and static folder paths if running standalone directly from this file
    # This setup assumes app.py is in leila_chatbot and templates/static are one level up.
    # For a more robust standalone execution, you might need to adjust these paths
    # or ensure the kid_chat project structure is replicated.
    app.register_blueprint(leila_bp)
    app.run(debug=DEBUG)
