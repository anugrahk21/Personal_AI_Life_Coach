import os
import random
import uuid
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, url_for, session
from coach import TherapistCoach, GREETINGS, check_api_key

# Initialize Flask app
app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Set a secret key for session management
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24).hex())

# Dictionary to store coach instances by session ID with last access time
coach_instances = {}
MAX_INSTANCE_AGE = 3600  # 1 hour in seconds

# Cleanup function to remove old coach instances
def cleanup_old_instances():
    current_time = time.time()
    to_remove = []
    for session_id, session_data in coach_instances.items():
        if current_time - session_data['last_access'] > MAX_INSTANCE_AGE:
            to_remove.append(session_id)
    
    for session_id in to_remove:
        coach_instances.pop(session_id, None)
    
    if to_remove:
        print(f"Cleaned up {len(to_remove)} inactive coach instances")

# Check if API key is available
has_api_key = check_api_key()

@app.route('/')
def index():
    """Render the main chat interface"""
    return render_template('index.html')

@app.route('/coachai')
def coachai():
    # Always generate a new session ID on page load to reset the conversation
    session['session_id'] = str(uuid.uuid4())
    return render_template('coachai.html')

@app.route('/api/greeting')
def get_greeting():
    """Return a random greeting to start the conversation"""
    # Ensure we have a session ID
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    # Create a new coach instance for this session if needed
    session_id = session['session_id']
    if session_id not in coach_instances and has_api_key:
        coach_instances[session_id] = {'instance': TherapistCoach(), 'last_access': time.time()}
    
    greeting = random.choice(GREETINGS)
    return jsonify({'message': greeting, 'session_id': session_id})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Process a chat message and return the coach's response"""
    # Get the session ID
    session_id = session.get('session_id')
    if not session_id:
        session['session_id'] = str(uuid.uuid4())
        session_id = session['session_id']
    
    # Get or create coach instance
    if session_id not in coach_instances:
        if has_api_key:
            coach_instances[session_id] = {'instance': TherapistCoach(), 'last_access': time.time()}
        else:
            return jsonify({
                'message': "I'm having trouble with my configuration. Please ensure the server has a valid API key.",
                'error': 'No API key configured'
            }), 500
    
    coach_data = coach_instances[session_id]
    coach = coach_data['instance']
    coach_data['last_access'] = time.time()
    
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

@app.route('/api/reset_counter', methods=['POST'])
def reset_counter():
    """Reset only the message counter, not the full session"""
    return jsonify({'status': 'success', 'message': 'Counter reset successfully'})

@app.route('/api/reset_session', methods=['POST'])
def reset_session():
    """Reset the current session"""
    session_id = session.get('session_id')
    if session_id and session_id in coach_instances:
        # Create a new coach instance to reset the conversation
        if has_api_key:
            coach_instances[session_id] = {'instance': TherapistCoach(), 'last_access': time.time()}
        else:
            # Remove the session if no API key
            coach_instances.pop(session_id, None)
    
    return jsonify({'status': 'success', 'message': 'Session reset successfully'})

@app.route('/api/health')
def health_check():
    """Health check endpoint to verify server status"""
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
    print(f"API Key status: {'Configured' if has_api_key else 'Missing'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)