import sys
# Add your application directory to the Python path
sys.path.insert(0, '/home/ssd')

# Import Flask application
from app import app as application

if __name__ == '__main__':
    application.run(debug=True)  # Add these lines to run the Flask app