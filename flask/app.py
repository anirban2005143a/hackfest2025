from flask import Flask, request, jsonify
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer  # Example, adjust based on your model
import os

app = Flask(__name__)

# Load the model and any necessary preprocessing objects
model = None
vectorizer = None

def load_model():
    global model, vectorizer
    
    # Load your model (adjust paths as needed)
    model_path = 'model.pkl'  # or your .pfl file path
    vectorizer_path = 'vectorizer.pkl'  # if you have a separate vectorizer
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    # If you have a separate vectorizer
    if os.path.exists(vectorizer_path):
        with open(vectorizer_path, 'rb') as f:
            vectorizer = pickle.load(f)

# Load model when starting the app
load_model()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get text input from request
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Preprocess the text (adjust based on your model requirements)
        if vectorizer:
            processed_text = vectorizer.transform([text])
        else:
            processed_text = text  # if your model handles raw text
        
        # Get prediction
        prediction = model.predict(processed_text)
        
        # Convert prediction to a serializable format
        if hasattr(prediction, 'tolist'):  # for numpy arrays
            prediction = prediction.tolist()
        
        return jsonify({
            'input_text': text,
            'prediction': prediction
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return "AI Model Prediction Service - Send a POST request to /predict with JSON containing 'text'"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)