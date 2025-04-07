# **FinanceBrain AI**  
### *Real-Time Document Assistant for Financial Enterprises*  
**🚀 Instantly query financial reports, competitor insights, and support tickets using AI-powered natural language.**  

---

## **✨ Key Features**  
- **📂 Google Drive Integration**: Automatically syncs and indexes PDFs/financial documents.  
- **💬 Voice & Text Chat**: Ask questions like *“Show me Q3 revenue trends”* via voice or text.  
- **🔍 Context-Aware Answers**: RAG (Retrieval-Augmented Generation) ensures responses are **grounded in your documents**.  
- **📊 User Dashboard**: Track query history, manage data sources, and view insights.  
- **🔒 Secure Authentication**: JWT-based login to protect sensitive financial data.  
- **⚡ Real-Time Updates**: Detects and processes new/updated files instantly.  

---

## **🛠️ Tech Stack**  
- **Frontend**: React, Tailwind CSS, Speech-to-Text API  
- **Backend**: Node.js (Express), Flask (Python)  
- **Database**: MongoDB (user auth/history)  
- **AI/ML**:  
  - **Mistral-7B** (query routing)  
  - **Gemini 1.5 Pro** (answer generation)  
  - **FAISS** (vector search) + SentenceTransformers (embeddings)  
- **APIs**: Google Drive API, CUDA (for GPU acceleration)  

---

## **🚀 Setup Guide**  

### **Prerequisites**  
- **Hardware**: NVIDIA GPU (RTX recommended) for local ML inference.  
- **Software**:  
  - Node.js (v18+), Python (3.9+)  
  - [CUDA Toolkit](https://developer.nvidia.com/cuda-downloads) (for GPU support)  

### **Installation**  
1. **Clone the repository**:  
   ```bash
   git clone https://github.com/yourusername/FinanceBrain-AI.git
   cd FinanceBrain-AI
   ```

2. **Frontend Setup**:  
   ```bash
   cd frontend
   npm install
   cp .env.example .env  # Add your API keys (Google Drive, Speech-to-Text)
   npm run dev  # Runs on http://localhost:5173
   ```

3. **Backend Setup**:  
   ```bash
   cd ../backend
   npm install
   cp .env.example .env  # Add MongoDB URI, JWT secret
   npm start  # Runs on http://localhost:3000
   ```

4. **Flask (AI Service) Setup**:  
   ```bash
   cd ../flask-ai-service
   pip install -r requirements.txt
   cp .env.example .env  # Add Gemini/Mistral API keys, Google Drive service account
   python app.py  # Runs on http://localhost:5000
   ```

5. **Google Drive Sync**:  
   - Place your Google Drive service account JSON in `flask-ai-service/config/`.  
   - Configure folder IDs in `.env` (e.g., `FINANCIAL_REPORTS_FOLDER_ID=xyz`).  

---

## **🐛 Common Issues & Fixes**  
- **CUDA Errors**:  
  - Ensure NVIDIA drivers are updated.  
  - Verify CUDA version compatibility with PyTorch (`nvcc --version`).  
- **Google Drive Sync Failures**:  
  - Check service account permissions.  
  - Validate folder IDs in `.env`.  
- **Slow Responses**:  
  - Use `quantized Mistral-7B` (4-bit) for lower GPU memory usage.  

---

## **📈 Use Case: Financial Enterprises**  
- **Portfolio Managers**: Query earnings reports without manual searches.  
- **Competitor Analysts**: Ask *“What’s Company X’s market share?”* and get sourced answers.  
- **Support Teams**: Resolve client queries using up-to-date policy documents.  

---

## **🔮 Future Improvements**  
- Add Slack/Microsoft Teams integration.  
- Support Excel/PPT files via custom parsers.  
- Deploy scalable vector DB (Milvus/Pinecone).  

---

## **📜 License**  
MIT License. See [LICENSE](LICENSE).  

---

## **💬 Contact**  
**Team VAAHM**  
- [Vaibhav Aryan](https://linkedin.com/in/yourprofile)  
- *Hackfest 2025 | IIT (ISM) Dhanbad*  

---

### **🎯 Why FinanceBrain?**  
*"Eliminate manual document searches—get AI-powered answers in seconds, grounded in your financial data."*  

--- 

### **✅ Key Notes for Your Repo**  
- Replace placeholder links (demo GIF, LICENSE, contact).  
- Add screenshots in `/assets` for visual appeal.  
- For **CUDA issues**, link to detailed troubleshooting docs in your wiki.  

This README highlights **financial use cases**, **your web dev contributions**, and **ML integration** while keeping setup instructions clear. Let me know if you’d like to tweak any section!
