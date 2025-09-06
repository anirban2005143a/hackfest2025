from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain.docstore.document import Document
import os
import fitz  # PyMuPDF
from dotenv import load_dotenv
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

load_dotenv()

DIR_PATH = "pdfs"
files = os.listdir(DIR_PATH)
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

# Initialize Chroma vector store
vector_store = Chroma(
    collection_name="documents",
    embedding_function=embeddings,
    persist_directory="chroma_db"
)

def load_pdf(file_path):
    """Read PDF pages and return list of Documents"""
    docs = []
    try:
        pdf = fitz.open(file_path)
        for page_num in range(len(pdf)):
            text = pdf[page_num].get_text("text")
            if text.strip():
                docs.append(Document(page_content=text, metadata={"source": file_path, "page": page_num+1}))
        pdf.close()
    except Exception as e:
        print(f"Error reading {file_path}: {str(e)}")
    return docs

print("Starting PDF processing...")
print(f"Found {len(files)} files in pdfs folder")

for file in files:
    if file.endswith('.pdf'):
        file_path = os.path.join(DIR_PATH, file)
        print(f"Processing: {file}")
        
        documents = load_pdf(file_path)
        print(f"Extracted {len(documents)} pages from {file}")

        if documents:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            docs = text_splitter.split_documents(documents)
            print(f"Split into {len(docs)} chunks")

            vector_store.add_documents(docs)
            print(f"SUCCESS: File {file} processed and stored in Chroma!")
        else:
            print(f"WARNING: No text extracted from {file}")

print("All PDFs processed successfully!")