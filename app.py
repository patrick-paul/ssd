from flask import Flask, request, jsonify, send_from_directory, session, redirect, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_limiter.util import get_remote_address
from datetime import datetime, timezone
from flask_limiter import Limiter
from dotenv import load_dotenv
from datetime import timedelta
from flask_cors import CORS
from functools import wraps
import logging
import bleach
import joblib
import json
import os
import uuid
import re

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set the logging level to DEBUG
    format='%(asctime)s - %(levelname)s - %(message)s',  # Log format
    handlers=[
        logging.FileHandler("app.log"),  # Log to a file
        logging.StreamHandler()  # Also log to console
    ]
)

# Create a logger instance
logger = logging.getLogger(__name__)

app = Flask(__name__)

# App basic configurations
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

app.config.update(
    SESSION_COOKIE_SECURE=True, 
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_HTTPONLY=True,
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
    SESSION_REFRESH_EACH_REQUEST=True,
    SESSION_COOKIE_NAME='ssd-session',
    MAX_CONTENT_LENGTH=1024 * 1024,  # 1MB max-size for incoming requests
    REQUEST_TIMEOUT=30 # 30 seconds timeout
)

# Load environment variables from .env file
load_dotenv()

#configure secret key
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Enable CORS
CORS(app)

# Set up rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["24000 per day", "1000 per hour"],
    storage_uri="memory://"
)

# Ensure required directories exist
os.makedirs('./db', exist_ok=True)
os.makedirs('./logs', exist_ok=True)

# Load the model once (cached)
try:
    model = joblib.load('./model/swahiliSpamDetectionModel.pkl')
except FileNotFoundError:
    print("Error: Model file not found!")
    exit(1)

# File paths
DATA_FILE = './db/feedback.json'
USERS_FILE = './db/users.json'

def sanitize_input(text):
    """Sanitize and validate input text"""
    if not isinstance(text, str):
        return None
    # Remove any HTML tags
    text = bleach.clean(text, tags=[], strip=True)
    # Basic text cleaning
    text = text.strip()
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    return text

def safe_json_operation(file_path, operation, default_value=None):
    try:
        if operation == 'read':
            if not os.path.exists(file_path):
                with open(file_path, 'w') as f:
                    json.dump({}, f)
            with open(file_path, 'r') as f:
                return json.load(f)
        elif operation == 'write':
            with open(file_path, 'w') as f:
                json.dump(default_value, f)
            return True
    except Exception as e:
        logger.debug(f"JSON operation error: {str(e)}")
        return {} if operation == 'read' else False

def get_user_data():
    return safe_json_operation(USERS_FILE, 'read')

def save_user_data(data):
    return safe_json_operation(USERS_FILE, 'write', data)

def load_feedback_data():
    return safe_json_operation(DATA_FILE, 'read')

def save_feedback_data(data):
    return safe_json_operation(DATA_FILE, 'write', data)

# Authentication middleware
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for both session and valid session data
        if not session or 'username' not in session:
            # Handle API routes differently from page routes
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized', 'message': 'Please log in'}), 401
            return redirect('/login')
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login')
def login_page():
    if 'username' in session:
        return redirect('/')
    return send_from_directory('templates', 'login.html')

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Taarifa zimekosekana'}), 400

        users = get_user_data()
        username = data['username']
        
        if username in users and check_password_hash(
                users[username]['password'], data['password']):
            # Set session data
            session.clear()  # Clear any existing session
            session['username'] = username
            session.permanent = True
            
            response = jsonify({
                'success': True,
                'name': users[username]['name']
            })
            return response

        return jsonify({'error': 'Taarifa sio zenyewe'}), 401
    except Exception as e:
        logger.debug(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or not all(k in data and data[k] for k in ['username', 'password', 'name']):
            return jsonify({'error': 'Taarifa zimekosekana'}), 400

        users = get_user_data()
        if data['username'] in users:
            return jsonify({'error': 'Jina tumizi hili tayari limesha chukuliwa'}), 400

        users[data['username']] = {
            'name': data['name'],
            'password': generate_password_hash(data['password']),
            'messages': []
        }
        
        if save_user_data(users):
            return jsonify({'success': True})
        return jsonify({'error': 'Imeshidwa kutunza taarifa'}), 500
    except Exception as e:
        logger.debug(f"Registration error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/auth/logout')
@login_required
def logout():
    try:
        session.pop('username', None)
        return jsonify({'success': True})
    except Exception as e:
        logger.debug(f"Error during logout: {e}")  # Use the logger instance
        return "An error occurred while logging out", 500

@app.route('/')
@login_required
def index():
    print("Session data:", session)  # Add this to see what session data exists
    print("Cookies:", request.cookies)
    return send_from_directory('templates', 'index.html')

@app.route('/clear-history', methods=['POST'])
@login_required
def clear_history():
    try:
        data = request.json
        username = session.get('username')

        if not username or username != data.get('username'):
            return jsonify({'error': 'Hauruhusiwi'}), 403

        users = get_user_data()
        if username in users:
            users[username]['messages'] = []  # Clear the user's message history
            if save_user_data(users):
                return jsonify({'success': True}), 200
            return jsonify({'error': 'Imeshidwa futa historia'}), 500

        return jsonify({'error': 'Mtumiaji hatapatikana'}), 404
    except Exception as e:
        logger.debug(f"Tatizo kwenye kufuta historia: {str(e)}")
        return jsonify({'error': 'Tatizo la seva.'}), 500


@app.route('/predict', methods=['POST'])
@login_required
@limiter.limit("500 per minute")
def predict():
    try:
        if not request.is_json:
            return jsonify({'error': 'Invalid content type'}), 415

        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'Jumbe haujawekwa'}), 400
        
        text = sanitize_input(data.get('text', ''))
        if not text:
            return jsonify({'error': 'Jumbe sio sahihi'}), 400
        
        if len(text) > 1000:  # Reasonable limit for SMS/message
            return jsonify({'error': 'Jumbe ndefu sana (mwisho karakta 1000)'}), 400

        new_number = bool(data.get('newNumber', False))

        try:
            prediction = model.predict([text])
            result = 'UTAPELI' if prediction[0] == "spam" else 'SIO UTAPELI'
        except Exception as e:
            logger.debug(f"Model prediction error: {str(e)}")
            return jsonify({'error': 'Prediction failed'}), 500

        # Save feedback data
        feedback_data = load_feedback_data()
        request_id = str(uuid.uuid4())
        
        feedback_entry = {
            'text': text,
            'label': None,
            'newNumber': new_number,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'user': session['username']  # Track which user made the request
        }
        
        feedback_data[request_id] = feedback_entry
        if not save_feedback_data(feedback_data):
            logger.debug("Imeshidwa kutunza taarifa")
            # Continue anyway as this isn't critical

        # Save to user history with error handling
        try:
            users = get_user_data()
            if session['username'] in users:
                history_entry = {
                    'message': text,
                    'date': datetime.now().isoformat(),
                    'new_number': new_number,
                    'output': result,
                    'id': request_id  # Store the ID for future reference
                }
                
                # Initialize messages list if it doesn't exist
                if 'messages' not in users[session['username']]:
                    users[session['username']]['messages'] = []
                    
                users[session['username']]['messages'].append(history_entry)
                save_user_data(users)
        except Exception as e:
            logger.debug(f"Imeshidwa kutunza chambuzi: {str(e)}")
            # Continue anyway as this isn't critical

        return jsonify({
            'prediction': result,
            'id': request_id,
            'status': 'success'
        })

    except RequestEntityTooLarge:
        return jsonify({'error': 'Maombi yamezidi'}), 413
    except Exception as e:
        logger.debug(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/feedback', methods=['POST'])
@login_required
@limiter.limit("500 per minute")
def feedback():
    try:
        data = request.json
        if not data or not all(k in data for k in ['id', 'isTrue', 'predicted_value']):
            return jsonify({'error': 'Taarifa sio sahihi'}), 400

        request_id = data.get('id')
        is_true = bool(data.get('isTrue'))
        predicted_value = sanitize_input(data.get('predicted_value', ''))

        if not predicted_value or predicted_value not in ['UTAPELI', 'SIO UTAPELI']:
            return jsonify({'error': 'Invalid prediction value'}), 400

        feedback_data = load_feedback_data()
        if request_id not in feedback_data:
            return jsonify({'error': 'Invalid ID'}), 404

        # Verify user owns this feedback
        if feedback_data[request_id].get('user') != session['username']:
            return jsonify({'error': 'Unauthorized'}), 403

        if predicted_value == "UTAPELI" and is_true:
            feedback_data[request_id]['label'] = "spam"      # Correctly identified spam
        elif predicted_value == "UTAPELI" and not is_true:
            feedback_data[request_id]['label'] = "ham"  # Falsely identified as spam
        elif predicted_value == "SIO UTAPELI" and is_true:
            feedback_data[request_id]['label'] = "ham"  # Correctly identified as not spam
        elif predicted_value == "SIO UTAPELI" and not is_true:
            feedback_data[request_id]['label'] = "spam"      # Missed spam detection
        else:
            feedback_data[request_id]['label'] = "ham"

        feedback_data[request_id]['feedback_timestamp'] = datetime.now(timezone.utc).isoformat()

        if not save_feedback_data(feedback_data):
            return jsonify({'error': 'Imeshidwa kutunza mrejesho'}), 500

        return jsonify({'status': 'success'})

    except Exception as e:
        logger.debug(f"Feedback error: {str(e)}")
        return jsonify({'error': 'Kuna tatizo kwenye mfumo'}), 500

@app.route('/user/history')
@login_required
def get_user_history():
    try:
        users = get_user_data()
        if session['username'] in users:
            return jsonify({
                'messages': users[session['username']]['messages'],
                'name': users[session['username']]['name']
            })
        return jsonify({'error': 'Mtumiaji hajapatikana'}), 404
    except Exception as e:
        logger.debug(f"History error: {str(e)}")
        return jsonify({'error': 'Kuna tatizo kwenye mfumo'}), 500

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
    app.run(host='127.0.0.1', port=2001, debug=False)