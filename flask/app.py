from flask import Flask, request, jsonify, render_template
from huggingface_hub import login
import os, io, json
import pdfplumber
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import torch
import re
# from datasets import load_dataset
import requests
from datetime import datetime
import requests_cache
import copy
from retry_requests import retry
from tqdm.notebook import tqdm
import time
from typing import List, Dict, Tuple, Optional, Literal, Union, Callable, Any
from dataclasses import dataclass
import google.generativeai as genai
from enum import Enum
# from tavily import TavilyClient
from transformers import T5Tokenizer, T5ForSequenceClassification, T5ForConditionalGeneration, PreTrainedTokenizer, PreTrainedModel, AutoTokenizer, AutoModelForSeq2SeqLM, AutoConfig, AutoModel, AutoModelForCausalLM, BitsAndBytesConfig

app = Flask(__name__)

# Initialize device
device = 'cuda' if torch.cuda.is_available() else 'cpu'

# Authentication
login(token='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')
genai.configure(api_key="AIzaSyC3agDsyGBI11XEmzAaT2-WlEgHhjwAjTg")

# --- Model Initialization ---
def initialize_models():
    print("Initializing models...")
    
    # Initialize Mistral model
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    )
    
    llmagent = AutoModelForCausalLM.from_pretrained(
        "mistralai/Mistral-7B-Instruct-v0.3",
        device_map="auto",
        trust_remote_code=True,
        use_auth_token=True,
        quantization_config=bnb_config
    ).to(device)
    
    llmtokenizer = AutoTokenizer.from_pretrained(
        "mistralai/Mistral-7B-Instruct-v0.3", 
        use_auth_token=True
    )
    
    # Initialize embedding model
    embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    
    return llmagent, llmtokenizer, embed_model

# --- Tool Classes ---
class Tool:
    def __init__(self, name: str, description: str, func: Callable):
        self.name = name
        self.description = description
        self.func = func

    def __call__(self, **kwargs) -> Any:
        return self.func(**kwargs)

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
    
    def register(self, tool: Tool):
        self.tools[tool.name] = tool
    
    def get_tool(self, name: str) -> Tool:
        return self.tools.get(name)
    
    def get_tool_descriptions(self) -> str:
        descriptions = []
        for name, tool in self.tools.items():
            descriptions.append(f"Tool: {name}\nDescription: {tool.description}")

        if len(descriptions) == 0:
            descriptions.append("No Tools Available")
        return "\n\n".join(descriptions)

# --- Helper Functions ---
def prompt_template(description: str) -> str:
    return f"""You are a helpful AI assistant that can use tools. Available tools:

{description}

To use a tool, output in this format:
{{
    "name": "tool_name",
    "arguments": {{
        "arg1": "value1",
        "arg2": "value2"
    }}
}}

Respond to the user's request, using tools whenever necessary. You are not allowed to make nested tool calls. You can only allowed to make a single tool call."""

def generate_until_pattern(model, tokenizer, initial_prompt, pattern, max_length=2048):
    eos_token_id = tokenizer.eos_token_id
    input_ids = tokenizer.encode(initial_prompt, return_tensors='pt')
    
    output_tokens = copy.deepcopy(input_ids).to(device)
    attention_mask = torch.ones_like(input_ids)
    past_key_values = None
    generated_text = ""
    current_length = input_ids.shape[1]
    
    while current_length < max_length:
        with torch.no_grad():
            outputs = model(
                input_ids=input_ids.to(device), 
                attention_mask=attention_mask.to(device),
                past_key_values=past_key_values
            )
            
            logits = outputs.logits
            past_key_values = outputs.past_key_values
            next_token_logits = logits[0, -1, :]
            next_token_id = torch.argmax(next_token_logits).unsqueeze(0).unsqueeze(0)
            output_tokens = torch.cat([output_tokens, next_token_id], dim=-1)
            
            if next_token_id.item() == eos_token_id:
                return tokenizer.decode(output_tokens[0], skip_special_tokens=True), False, None
            
            next_token_text = tokenizer.decode(
                next_token_id[0],
                skip_special_tokens=True
            )
            generated_text += next_token_text
            print(tokenizer.decode(output_tokens[0], skip_special_tokens=True))
            for match in re.finditer(pattern, generated_text, re.DOTALL):
                return tokenizer.decode(output_tokens[0], skip_special_tokens=True), True, (match.start(), match.end())
            
            input_ids = next_token_id
            attention_mask = torch.ones_like(input_ids)
            current_length += 1
            return tokenizer.decode(output_tokens[0], skip_special_tokens=True), False, None

class LLMToolCaller:
    def __init__(self, model, tokenizer, tool_registry: ToolRegistry):
        self.tokenizer = tokenizer
        self.model = model
        self.tool_registry = tool_registry

    def _extract_tool_calls(self, text: str) -> List[Dict]:
        tool_pattern = r'\{\s*"name"\s*:\s*"(.?)"\s,\s*"arguments"\s*:\s*\{(.?)\}\s\}'
        tool_calls = []
        for match in re.finditer(tool_pattern, text, re.DOTALL):
            tool_calls.append(json.loads(match.group()))
        return tool_calls

    def _execute_tool_calls(self, tool_calls: List[Dict]) -> List[Dict]:
        results = []
        for call in tool_calls:
            tool_name = call.get("name")
            arguments = call.get("arguments", {})
            tool = self.tool_registry.get_tool(tool_name)
            if tool:
                try:
                    result = tool() if not arguments else tool(**arguments)
                    results.append({
                        "tool": tool_name,
                        "status": "success",
                        "result": result
                    })
                except Exception as e:
                    results.append({
                        "tool": tool_name,
                        "status": "error",
                        "error": repr(e)
                    })
            else:
                results.append({
                    "tool": tool_name,
                    "status": "error",
                    "error": "Tool not found"
                })
        return results

    def generate_response(self, prompt: str, max_new_tokens: int = 2048) -> str:
        system_prompt = prompt_template(self.tool_registry.get_tool_descriptions())
        full_prompt = f"User: {prompt}\n\nAssistant:"
        inputs = self.tokenizer(full_prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=10,
            pad_token_id=self.tokenizer.eos_token_id,
            do_sample=False
        )

        final_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        # return final_response[len(tool_results_prompt):].strip()
        return final_response[len(full_prompt):].strip()

class GeminiRAGAgent:
    def __init__(self, agent_name: str, df: pd.DataFrame, index: faiss.Index, embed_model: SentenceTransformer):
        self.agent_name = agent_name
        self.df = df
        self.index = index
        self.embed_model = embed_model
        self.model = genai.GenerativeModel("gemini-1.5-pro")

    def query(self, question: str, top_k: int = 3) -> str:
        q_emb = self.embed_model.encode([question], convert_to_numpy=True)
        D, I = self.index.search(q_emb, top_k)
        
        context = ""
        for idx in I[0]:
            row = self.df.iloc[idx]
            context += f"[{row['folder']}] {row['title']} - chunk {row['chunk_id']}:\n{row['text']}\n\n"

        prompt = f"You are a helpful assistant answering based on the following context:\n\n{context}\n\nQuestion: {question}\nAnswer:"
        response = self.model.generate_content(prompt)
        return response.text

# --- Initialize System ---

dfs = {}  # DataFrames for each subfolder
indexes = {}  # FAISS indexes for each subfolder 

def initialize_system():
    print(torch.cuda.is_available())
    print("Initializing system...")
    
    # Initialize models
    llmagent, llmtokenizer, embed_model = initialize_models()
    
    # Initialize Google Drive service
    SERVICE_ACCOUNT_FILE = r"C:\Users\hs106\OneDrive - Indian Institute of Technology Indian School of Mines Dhanbad\Desktop\haclfest\hackfest2025\flask\concrete-area-455907-j8-fffe5bd448b8.json"  # Update path
    CACHE_FILE = "file_hashes.json"
    CHUNK_SIZE = 250
    SCOPES = ['https://www.googleapis.com/auth/drive']
    
    creds = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)

    SUBFOLDER_INFO = {
        "competitor_intel_index": "13m2Di-eOUd-u0n07UCnXVCCdjiDuNr5H",
        "financial_data_index": "1C0g7GCBMyPKSJGI8jnLhgTfnnO1m9QeA",
        "market_demographics_index": "1VFCsu7QGfFTf8Cnj7NXe_q0fKtcAHcSh",
        "product_info_index": "19jKjQRlIqER2uMeqQqs1paCM7ghrkHcs"
    }

    # Load or initialize hash cache
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            file_cache = json.load(f)
    else:
        file_cache = {}

    for folder_name, folder_id in SUBFOLDER_INFO.items():
        print(f"Processing folder: {folder_name}")
        local_dir = os.path.join("data", folder_name)
        os.makedirs(local_dir, exist_ok=True)

        results = service.files().list(
            q=f"'{folder_id}' in parents and mimeType='application/pdf'",
            fields="files(id, name, md5Checksum)",
            pageSize=1000
        ).execute()

        files = results.get('files', [])
        downloaded_files = []

        for file in files:
            fid, name = file['id'], file['name']
            checksum = file.get('md5Checksum', '')

            if name in file_cache and file_cache[name] == checksum:
                print(f"Skipping unchanged: {name}")
                continue

            print(f"Downloading: {name}")
            request = service.files().get_media(fileId=fid)
            file_path = os.path.join(local_dir, name)
            with open(file_path, 'wb') as f:
                downloader = MediaIoBaseDownload(f, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
            downloaded_files.append(file_path)
            file_cache[name] = checksum

        # Text extraction
        records = []
        for file_path in downloaded_files:
            try:
                with pdfplumber.open(file_path) as pdf:
                    extracted_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            except Exception as e:
                print(f"Failed to read {file_path}: {e}")
                continue

            chunks = [extracted_text[i:i+CHUNK_SIZE] for i in range(0, len(extracted_text), CHUNK_SIZE)]
            for i, chunk in enumerate(chunks):
                if chunk.strip():
                    records.append({
                        "folder": folder_name,
                        "title": os.path.basename(file_path),
                        "chunk_id": i,
                        "text": chunk
                    })

        if not records:
            continue

        # Embedding & Indexing
        texts = [rec["text"] for rec in records]
        embeddings = embed_model.encode(texts, convert_to_numpy=True)

        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(embeddings)
        indexes[folder_name] = index
        dfs[folder_name] = pd.DataFrame(records)

        # Clean up downloaded files
        for file_path in downloaded_files:
            try:
                os.remove(file_path)
                print(f"Deleted: {file_path}")
            except Exception as e:
                print(f"Could not delete {file_path}: {e}")

    # Save updated hash cache
    with open(CACHE_FILE, 'w') as f:
        json.dump(file_cache, f)

    # Initialize RAG agents
    registry = ToolRegistry()
    agents: Dict[str, GeminiRAGAgent] = {}
    for agent_name in dfs.keys():
        agents[agent_name] = GeminiRAGAgent(agent_name, dfs[agent_name],indexes[agent_name],embed_model)

    def make_rag_tool(agent_name: str):
        def rag_tool(query: str) -> str:
            return agents[agent_name].query(query)
        return rag_tool

    for agent_name in dfs.keys():
        agents[agent_name] = GeminiRAGAgent(agent_name, dfs[agent_name], indexes[agent_name], embed_model)
        registry.register(
            Tool(
                name=f"{agent_name}_rag",
                description=f"Use Gemini RAG on {agent_name.replace('_', ' ')} data. Arguments: prompt(str)",
                func=make_rag_tool(agent_name)
            )
        )

    tool_caller = LLMToolCaller(llmagent, llmtokenizer, registry)
    
    return tool_caller

# Initialize the system when the app starts
tool_caller = None
try:
    tool_caller = initialize_system()
    print("System initialization complete!")
except Exception as e:
    print(f"Error during initialization: {e}")

# --- Flask Routes ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/query', methods=['POST'])
def handle_query():
    if not tool_caller:
        return jsonify({"error": "System not initialized", "status": "error"}), 500
    
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({"error": "No query provided", "status": "error"}), 400
        
        query = data['query']
        print(query)
        
        with torch.no_grad():
            response = tool_caller.generate_response(query)

        print(response)
        print("Response generated successfully!")
        return jsonify({
            "response": response,
            "status": "success"
        })
    
    except Exception as e:
        print(f"Error processing query: {e}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)