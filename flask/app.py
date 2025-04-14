from flask import Flask, request, jsonify
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import pickle
from typing import Dict, Any
from werkzeug.exceptions import BadRequest
import json
import os

app = Flask(__name__)

# Load model and tokenizer (modify paths as needed)
def load_model():
    try:
        # Load your existing model setup
        model_path = os.path.join(os.path.dirname(__file__), 'llmagent.sav')
        llmagent = pickle.load(open(model_path, 'rb')).to(device)
        llmtokenizer = pickle.load(open('/llmtokenizer.sav','rb'))
        return llmagent, llmtokenizer
    except Exception as e:
        raise RuntimeError(f"Failed to load model: {str(e)}")

# Initialize model and tool caller
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model, tokenizer = load_model()
tool_caller = LLMToolCaller(model, tokenizer, registry)  # Assuming registry is defined elsewhere

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data
        data: Dict[str, Any] = request.get_json()
        
        if not data or 'prompt' not in data:
            raise BadRequest("Missing 'prompt' in request body")
        
        # Get prediction
        response = tool_caller.generate_response(data['prompt'])
        
        # Prepare response
        return jsonify({
            'status': 'success',
            'response': response,
            'model': 'LLM Tool Caller',
            'device': device
        })
    
    except BadRequest as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': f"Prediction failed: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': device
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)