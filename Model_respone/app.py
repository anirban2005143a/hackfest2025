from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess

app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run_rag")
async def run_rag(input: str = Body(..., embed=True)):
    try:
        print(f"Input received: {input}")

        # 1. Run rag_agent.py with input prompt
        print("Running RAG query...")
        
        rag_process = subprocess.Popen(
            ["python", "rag_agent.py"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = rag_process.communicate(input=input)
        
        if rag_process.returncode != 0:
            error_msg = stderr if stderr else "Unknown error"
            print(f"RAG error: {error_msg}")
            return {"error": True, "message": f"RAG failed: {error_msg}"}

        print("RAG completed successfully")
        return {"error": False, "output": stdout.strip()}

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {"error": True, "message": f"Unexpected error: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "RAG API Server is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)