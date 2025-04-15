from flask import Flask, request, jsonify
from model.rag_model import predict


app = Flask(__name__)

@app.route('/')
def home():
    return "🚀 Flask RAG API is running!"

@app.route('/predict', methods=['POST'])
def handle_predict():
    data = request.json
    input_text = data.get("input")
    print(input_text)
    if not input_text:
        return jsonify({"error": "Input text is required"}), 400
    
    try:
        result = predict(input_text)
        return jsonify({"response": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
