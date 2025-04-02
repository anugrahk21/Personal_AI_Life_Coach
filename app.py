import os
import random
from flask import Flask, request, jsonify, render_template, url_for
from coach import TherapistCoach, GREETINGS, check_api_key

# Initialize Flask app
app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Initialize the TherapistCoach
if check_api_key():
    coach = TherapistCoach()
else:
    print("Warning: API key not found. Chat functionality will be limited.")
    coach = None

@app.route('/')
def index():
    """Render the main chat interface"""
    return render_template('index.html')

@app.route('/coachai')
def coachai():
    return render_template('coachai.html')

@app.route('/api/greeting')
def get_greeting():
    """Return a random greeting to start the conversation"""
    greeting = random.choice(GREETINGS)
    return jsonify({'message': greeting})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Process a chat message and return the coach's response"""
    if not coach:
        return jsonify({
            'message': "I'm having trouble with my configuration. Please ensure the server has a valid API key.",
            'error': 'No API key configured'
        }), 500
    
    # Get message from request
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'message': 'Please provide a message'}), 400
    
    try:
        # Get response from the TherapistCoach
        response = coach.get_response(user_message)
        return jsonify({'message': response})
    except Exception as e:
        print(f"Error processing message: {e}")
        return jsonify({
            'message': "I'm experiencing a momentary pause in our connection. Could you share your thoughts again?",
            'error': str(e)
        }), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint to verify server status"""
    has_api_key = coach is not None
    return jsonify({
        'status': 'healthy',
        'api_key_configured': has_api_key,
        'version': '1.0.0'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Enable debug mode for development
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Starting server on http://localhost:{port}")
    print(f"API Key status: {'Configured' if coach else 'Missing'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)