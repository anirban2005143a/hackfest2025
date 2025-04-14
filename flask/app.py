"""
Financial PDF Assistant - Flask Application
This application monitors a Google Drive folder for PDFs, processes them,
and provides a chat interface to query the content.
"""

import os
import io
import time
import json
import threading
import logging
from typing import List, Dict, Any
import numpy as np
from pathlib import Path
from datetime import datetime

# Flask and web related
from flask import Flask, request, jsonify
from flask_cors import CORS

# PDF processing
import fitz  # PyMuPDF
import tempfile

# Google Drive API
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# Vector database and embeddings
import faiss
from sentence_transformers import SentenceTransformer

# LLM for response generation
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Flask app initialization
app = Flask(__name__)
CORS(app)

# Configuration
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
TOKEN_FILE = 'token.json'
CREDENTIALS_FILE = 'credentials.json'
FOLDER_ID = '1mhSW0crBJj1-HPizMI-4ddtquidHZmWW'  # Replace with your folder ID
CHECK_INTERVAL = 300  # Check for new files every 5 minutes
CHUNK_SIZE = 500  # Text chunk size for processing
CHUNK_OVERLAP = 50  # Overlap between chunks

# Global variables
pdf_documents = {}  # Store processed documents
vector_db = None  # FAISS index
embedding_model = None  # Sentence transformer model
tokenizer = None  # LLM tokenizer
model = None  # LLM model
drive_service = None  # Google Drive API service
last_check_time = 0  # Last time we checked for new files
processed_files = set()  # Keep track of processed file IDs
embeddings_dimension = 384  # Default for many sentence transformers

class Document:
    """Class to represent a processed document with its metadata and chunks"""
    def __init__(self, file_id: str, filename: str, content: str, last_modified: str):
        self.file_id = file_id
        self.filename = filename
        self.content = content
        self.last_modified = last_modified
        self.chunks = []
        self.chunk_indices = []  # To map FAISS indices to document chunks
        
    def create_chunks(self):
        """Split document content into overlapping chunks"""
        text = self.content
        chunks = []
        i = 0
        while i < len(text):
            chunk = text[i:i + CHUNK_SIZE]
            chunks.append(chunk)
            i += CHUNK_SIZE - CHUNK_OVERLAP
        self.chunks = chunks
        return chunks

def initialize_models():
    """Initialize embedding model and language model"""
    global embedding_model, tokenizer, model, embeddings_dimension, vector_db
    
    # Initialize embedding model
    logger.info("Initializing embedding model...")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')  # Small but effective model
    embeddings_dimension = embedding_model.get_sentence_embedding_dimension()
    
    # Initialize vector database
    logger.info("Initializing vector database...")
    vector_db = faiss.IndexFlatL2(embeddings_dimension)
    
    # Initialize language model and tokenizer
    logger.info("Initializing language model...")
    model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"  # Small model for CPU usage (under 2GB)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float32,  # Use float32 for CPU compatibility
        low_cpu_mem_usage=True
    )
    model.eval()  # Set model to evaluation mode
    
    logger.info("All models initialized successfully")

def authenticate_google_drive():
    """Authenticate with Google Drive API"""
    global drive_service
    
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_info(json.load(open(TOKEN_FILE)))
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
    
    drive_service = build('drive', 'v3', credentials=creds)
    logger.info("Google Drive authentication successful")

def extract_text_from_pdf(file_content):
    """Extract text from PDF content"""
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name
    
    try:
        text = ""
        with fitz.open(temp_file_path) as doc:
            for page in doc:
                text += page.get_text()
        return text
    finally:
        os.unlink(temp_file_path)

def process_file(file_id, filename, modified_time):
    """Download and process a single file from Google Drive"""
    global pdf_documents, vector_db, processed_files
    
    logger.info(f"Processing file: {filename}")
    
    # Download file from Google Drive
    request = drive_service.files().get_media(fileId=file_id)
    file_content = io.BytesIO()
    downloader = MediaIoBaseDownload(file_content, request)
    
    done = False
    while not done:
        status, done = downloader.next_chunk()
    
    # Extract text from PDF
    text_content = extract_text_from_pdf(file_content.getvalue())
    
    # Create document object
    document = Document(file_id, filename, text_content, modified_time)
    chunks = document.create_chunks()
    
    # Generate embeddings for chunks
    for i, chunk in enumerate(chunks):
        embedding = embedding_model.encode([chunk])[0]
        current_index = vector_db.ntotal
        vector_db.add(np.array([embedding], dtype=np.float32))
        document.chunk_indices.append(current_index)
    
    # Store document in memory
    pdf_documents[file_id] = document
    processed_files.add(file_id)
    
    logger.info(f"File processed: {filename}, {len(chunks)} chunks extracted")

def check_for_new_files():
    """Check Google Drive folder for new or updated PDF files"""
    global last_check_time
    
    if not drive_service:
        logger.error("Drive service not initialized")
        return
    
    current_time = time.time()
    
    # Only check if enough time has passed since last check
    if current_time - last_check_time < CHECK_INTERVAL and last_check_time > 0:
        return
    
    logger.info("Checking for new files in Google Drive folder")
    
    query = f"'{FOLDER_ID}' in parents and mimeType='application/pdf'"
    results = drive_service.files().list(
        q=query,
        fields="files(id, name, modifiedTime)",
    ).execute()
    
    files = results.get('files', [])
    for file in files:
        file_id = file['id']
        filename = file['name']
        modified_time = file['modifiedTime']
        
        # Process file if it's new or updated
        if file_id not in processed_files:
            process_file(file_id, filename, modified_time)
    
    last_check_time = current_time
    logger.info(f"Folder check complete. {len(processed_files)} files processed in total.")

def monitor_drive_folder():
    """Background thread to monitor Google Drive folder"""
    while True:
        try:
            check_for_new_files()
        except Exception as e:
            logger.error(f"Error checking for new files: {e}")
        time.sleep(CHECK_INTERVAL)

def search_documents(query, top_k=5):
    """Search for relevant document chunks using semantic search"""
    if vector_db.ntotal == 0:
        return []
    
    # Generate embedding for the query
    query_embedding = embedding_model.encode([query])[0]
    query_embedding = np.array([query_embedding], dtype=np.float32)
    
    # Search for similar chunks
    distances, indices = vector_db.search(query_embedding, top_k)
    
    results = []
    for i, idx in enumerate(indices[0]):
        # Find which document and chunk this belongs to
        for doc_id, doc in pdf_documents.items():
            if idx in doc.chunk_indices:
                chunk_idx = doc.chunk_indices.index(idx)
                results.append({
                    'document': doc.filename,
                    'chunk': doc.chunks[chunk_idx],
                    'score': float(distances[0][i])
                })
                break
    
    return results

def is_financial_query(query):
    """Determine if a query is related to financial information"""
    financial_keywords = [
        'money', 'finance', 'financial', 'bank', 'account', 'balance', 'statement',
        'transaction', 'payment', 'income', 'expense', 'budget', 'investment',
        'stock', 'fund', 'retirement', 'saving', 'credit', 'debit', 'loan',
        'mortgage', 'interest', 'tax', 'salary', 'revenue', 'profit', 'loss',
        'invoice', 'receipt', 'bill', 'cost', 'price', 'dollar', 'euro', 'pound',
        'pay', 'spent', 'spend', 'earned', 'saved', 'invested', 'calculate',
        'how much', 'total', 'amount'
    ]
    
    query_words = query.lower().split()
    return any(keyword in query.lower() for keyword in financial_keywords)

def generate_response(query, context_chunks=None):
    """Generate a response using the language model"""
    if context_chunks is None:
        context_chunks = []
    
    # Create a prompt for the model
    if context_chunks:
        context_text = "\n\n".join([chunk["chunk"] for chunk in context_chunks])
        prompt = f"""You are a helpful assistant that answers questions based on the provided documents.
        
Document content:
{context_text}

User: {query}
Assistant:"""
    else:
        prompt = f"""You are a helpful assistant.

User: {query}
Assistant:"""
    
    # Tokenize the prompt
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    
    # Generate response
    with torch.no_grad():
        output = model.generate(
            inputs.input_ids,
            max_length=1024,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    # Decode the response
    response = tokenizer.decode(output[0], skip_special_tokens=True)
    
    # Extract only the assistant's response
    assistant_response = response.split("Assistant:")[-1].strip()
    return assistant_response

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """Endpoint to handle chat requests"""
    data = request.get_json()
    query = data.get('message', '')
    
    # Check for new files before responding
    try:
        check_for_new_files()
    except Exception as e:
        logger.error(f"Error checking for files: {e}")
    
    # If it's a financial query, search through documents
    context_chunks = []
    if is_financial_query(query) and vector_db.ntotal > 0:
        context_chunks = search_documents(query)
    
    # Generate response
    response = generate_response(query, context_chunks)
    
    return jsonify({
        'response': response,
        'source_documents': [chunk['document'] for chunk in context_chunks] if context_chunks else []
    })

@app.route('/status', methods=['GET'])
def status():
    """Endpoint to check the status of the system"""
    return jsonify({
        'status': 'running',
        'documents_processed': len(processed_files),
        'vector_db_size': vector_db.ntotal if vector_db else 0,
        'last_check': datetime.fromtimestamp(last_check_time).isoformat() if last_check_time > 0 else None
    })

def initialize_app():
    """Initialize all components of the application"""
    try:
        initialize_models()
        authenticate_google_drive()
        
        # Start monitoring thread
        monitor_thread = threading.Thread(target=monitor_drive_folder, daemon=True)
        monitor_thread.start()
        
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing application: {e}")
        raise

if __name__ == '__main__':
    initialize_app()
    app.run(host='0.0.0.0', port=5000, debug=False)