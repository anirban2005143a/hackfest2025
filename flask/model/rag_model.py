import os, io, json
import openmeteo_requests
import pdfplumber
import pandas as pd
import numpy as np
import sentence_transformers
from sentence_transformers import SentenceTransformer
import faiss
import google.oauth2
import googleapiclient.discovery
import googleapiclient.http
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import torch
import json
import re
import datasets
import typing
from datasets import load_dataset
from typing import Dict
import requests
import datetime
from datetime import datetime
import requests_cache
import pandas as pd
import copy
import retry_requests
from retry_requests import retry
import tqdm
from tqdm.notebook import tqdm
import time
import numpy as np
from typing import List, Dict, Tuple, Optional, Literal, Union, Callable, Any
import dataclasses
from dataclasses import dataclass
import google.generativeai as genai
from typing import List
import enum
from enum import Enum
from transformers import T5Tokenizer, T5ForSequenceClassification, T5ForConditionalGeneration, PreTrainedTokenizer, PreTrainedModel, AutoTokenizer, AutoModelForSeq2SeqLM, AutoConfig, AutoModel, AutoModelForCausalLM, BitsAndBytesConfig
import gradio as gr


def predict(input_text):
    # --- 🔧 Configuration ---
    # SERVICE_ACCOUNT_FILE = "/home/vaibhaviitian/concrete-area-455907-j8-fffe5bd448b8.json"
    # SERVICE_ACCOUNT_FILE = r"C:\Users\Vaibhav Aryan\OneDrive\Desktop\Hackfest\hackfest2025\flask\concrete-area-455907-j8-fffe5bd448b8.json"
    SERVICE_ACCOUNT_FILE = r"D:\projects\hackfest 2025\flask\concrete-area-455907-j8-fffe5bd448b8.json"
    CACHE_FILE = "/kaggle/working/file_hashes.json"
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

    # --- 🔄 Load or initialize hash cache ---
    model = SentenceTransformer("all-MiniLM-L6-v2")

    # Create a single list to hold all records across folders
    all_records = []
    dfs = {}  # DataFrames for each subfolder
    indexes = {}  # FAISS indexes for each subfolder
    for folder_name, folder_id in SUBFOLDER_INFO.items():
        print(f"\n📁 Processing folder: {folder_name}")
        local_dir = os.path.join(os.getcwd(), folder_name)
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

            print(f"⬇️ Downloading: {name}")
            request = service.files().get_media(fileId=fid)
            file_path = os.path.join(local_dir, name)
            with open(file_path, 'wb') as f:
                downloader = MediaIoBaseDownload(f, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
            downloaded_files.append(file_path)

        # --- 🔍 Text extraction ---
        for file_path in downloaded_files:
            try:
                with pdfplumber.open(file_path) as pdf:
                    extracted_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            except Exception as e:
                print(f"❌ Failed to read {file_path}: {e}")
                continue

            chunks = [extracted_text[i:i+CHUNK_SIZE] for i in range(0, len(extracted_text), CHUNK_SIZE)]
            for i, chunk in enumerate(chunks):
                if chunk.strip():
                    all_records.append({
                        "folder": folder_name,
                        "title": os.path.basename(file_path),
                        "chunk_id": i,
                        "text": chunk
                    })

        # --- 🗑️ Delete downloaded files ---
        for file_path in downloaded_files:
            try:
                os.remove(file_path)
                print(f"🗑️ Deleted: {file_path}")
            except Exception as e:
                print(f"⚠️ Could not delete {file_path}: {e}")

    # --- 🧠 Create a single unified DataFrame and Index ---
    if all_records:
        # Create a single DataFrame with all records
        unified_df = pd.DataFrame(all_records)
        
        # Create embeddings for all texts
        texts = [rec["text"] for rec in all_records]
        embeddings = model.encode(texts, convert_to_numpy=True)
        
        # Create a single FAISS index
        unified_index = faiss.IndexFlatL2(embeddings.shape[1])
        unified_index.add(embeddings)
        
        print(f"\n✅ Created unified index with {len(all_records)} records from all folders")
    else:
        print("\n⚠️ No records found in any folder")
        unified_df = pd.DataFrame()
        unified_index = None

    # --- 🔍 Modified Semantic Search (on unified index) ---
    def semantic_search(query: str, folder_filter: str = None, top_k: int = 5):
        if unified_index is None:
            print("❌ No index available")
            return
        
        q_emb = model.encode([query], convert_to_numpy=True)
        D, I = unified_index.search(q_emb, top_k)
        
        print(f"\n🔍 Top {top_k} matches for: '{query}'")
        if folder_filter:
            print(f"(Filtered to folder: {folder_filter})")
        
        results = []
        for rank, idx in enumerate(I[0]):
            row = unified_df.iloc[idx]
            
            # Skip if a folder filter is applied and this result doesn't match
            if folder_filter and row['folder'] != folder_filter:
                continue
                
            print(f"\n📂 [{row['folder']}] 📄 {row['title']} (chunk {row['chunk_id']}) [Match #{rank + 1}]")
            print(row['text'][:300] + "...\n")
            
            results.append({
                "folder": row['folder'],
                "title": row['title'],
                "chunk_id": row['chunk_id'],
                "text": row['text'],
                "rank": rank + 1
            })
        
        return results

    genai.configure(api_key="AIzaSyC3agDsyGBI11XEmzAaT2-WlEgHhjwAjTg")

    class GeminiRAGAgent:
        def __init__(self, df: pd.DataFrame, index: faiss.Index, embed_model: SentenceTransformer):
            self.df = df
            self.index = index
            self.embed_model = embed_model
            self.model = genai.GenerativeModel("gemini-1.5-pro")

        def query(self, question: str, top_k: int = 3) -> str:
            # Step 1: Embed the query
            q_emb = self.embed_model.encode([question], convert_to_numpy=True)
            D, I = self.index.search(q_emb, top_k)
            
            # Step 2: Retrieve relevant chunks
            context = ""
            for idx in I[0]:
                row = self.df.iloc[idx]
                context += f"[{row['folder']}] {row['title']} - chunk {row['chunk_id']}:\n{row['text']}\n\n"

            # Step 3: Compose prompt
            prompt = f"You are a helpful assistant answering based on the following context if you dont find anything usefull in context then just say you dont know:\n\n{context}\n\nQuestion: {question}\nAnswer:"
            # print(prompt)
            # print('gem------------------------')
            # Step 4: Generate answer
            response = self.model.generate_content(prompt)
            # print(response)
            # print('res--------------------------')
            return response.text

    response=GeminiRAGAgent(unified_df,unified_index,model).query(input_text)
    return response
# just use this in case for testing the ml model now using the gradio interface
# app = gr.Interface(fn=predict, inputs="text", outputs="text")
# app.launch(debug=True)
