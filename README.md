# Swahili Spam Detection

A Flask-based web application for detecting spam messages in Swahili communications using machine learning. Maintains clean communication channels with real-time analysis and user feedback capabilities.

## Features

- Real-time Swahili message spam detection
- User authentication system
- Feedback submission and storage
- Message history tracking
- Machine learning model integration
- Responsive web interface

## Technical Stack

- **Backend**: Python/Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Machine Learning**: scikit-learn (Pickle model)
- **Data Storage**: JSON (users & feedback)
- **Styling**: Custom CSS with Flexbox layout
- **Deployment**: WSGI compatible

## Project Structure

```bash
├── ssd/
│   ├── db/                 # JSON databases
│   │   ├── feedback.json
│   │   └── users.json
│   ├── logs/               # Application logs
│   ├── model/              # ML models
│   │   ├── newlyTrainedModel_27_jan_25/
│   │   └── swahiliSpamDetectionModel.pkl
│   ├── static/             # Static assets
│   │   ├── assets/         # Images
│   │   ├── js/             # JavaScript modules
│   │   ├── styles/         # CSS files
│   │   └── sweetalert/     # Alert library
│   ├── templates/          # Flask templates
│   │   ├── 404.html
│   │   ├── index.html
│   │   └── login.html
│   ├── app.py              # Main application
│   ├── wsgi.py            # WSGI entry point
│   └── requirements.txt    # Dependencies
```

## Getting Started

### Prerequisites
- Python 3.8+
- pip package manager
- Modern web browser

### Installation

1. Clone the repository
```bash
git clone https://github.com/patrick-paul/ssd.git
cd ssd
```

2. Create virtual environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

### Configure Environment

1. Create `.env` file in project root:
```env
SECRET_KEY=your-secure-key-here
```

2. Generate a strong key using:
```python
import secrets
print(secrets.token_hex(24))
```

3. Initialize databases
```bash
touch db/users.json db/feedback.json
echo "{}" > db/users.json
echo "{}" > db/feedback.json
```

### Running the Application
```bash
python wsgi.py
```
Access the application at http://localhost:2001

## Model Training

The spam detection model was trained using custom Swahili datasets. Training code and datasets are available in the separate repository: [ssd-training Repository](https://github.com/patrick-paul/ssd-training)

Key training features:
- Custom Swahili spam corpus
- TF-IDF vectorization
- Naive Bayes classifier
- Model versioning system

## Usage

1. Register a new account:
2. Enter Swahili text in the message input field
3. Get instant spam classification results
4. Provide feedback on detection accuracy using the feedback system

## Configuration

### Environment Variables
```env
FLASK_ENV=development
FLASK_DEBUG=0
PORT=2001
```

### Model Selection
Replace `model/swahiliSpamDetectionModel.pkl` with updated models

### Styling
Modify CSS files in `static/styles/`

## Contributing

Set up development environment:
```bash
pip install -r requirements.txt
```

Contribution guidelines:
- Write tests for new features
- Maintain JSON schema consistency
- Update documentation accordingly
- Follow PEP-8 standards

## Known Issues

- Limited concurrent user support
- Model accuracy variance with regional dialects
- Session management improvements needed

## Future Improvements

- 📊 Real-time analytics dashboard
- 🔄 Model auto-update system
- 📱 Progressive Web App implementation

## License

MIT License - See LICENSE.md for details

## Contact

- Development Team: patrickpaul367@gmail.com
- Maintainer: @patrick-paul
- Project Link: https://github.com/patrick-paul/ssd
