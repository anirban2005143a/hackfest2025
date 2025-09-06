from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, GoogleGenerativeAI
from dotenv import load_dotenv
import sys

load_dotenv()

# 1. Initialize LLM and embeddings
llm = GoogleGenerativeAI(model="gemini-1.5-flash")
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

# 2. Load existing Chroma vector store
vector_store = Chroma(
    collection_name="documents",
    embedding_function=embeddings,
    persist_directory="chroma_db"
)

# Read user prompt from stdin
user_prompt = sys.stdin.read().strip()

if not user_prompt:
    print("Error: No input provided")
    exit(1)

print(f"Searching for: {user_prompt}", file=sys.stderr)

# 3. Search for relevant documents
docs = vector_store.similarity_search(user_prompt, k=5)
context = "\n\n".join([doc.page_content for doc in docs])

print(f"Found {len(docs)} relevant documents", file=sys.stderr)

# 4. Premium RAG Prompt - Designed for optimal performance
final_prompt = f"""# ROLE: Expert Information Retrieval Assistant

## CONTEXT:
You are an AI assistant specialized in retrieving and synthesizing information from provided documents. Your primary goal is to deliver accurate, comprehensive, and contextually relevant answers based EXCLUSIVELY on the information contained in the context provided below.

## SOURCE DOCUMENTS:
{context}

## USER QUERY:
{user_prompt}

## INSTRUCTIONS:

1. **ANALYZE THE CONTEXT FIRST**: Carefully examine the provided context to determine if it contains information relevant to the user's query.

2. **RELEVANCE ASSESSMENT**:
   - If the context contains DIRECTLY RELEVANT information: Provide a comprehensive answer synthesizing all relevant details.
   - If the context contains PARTIALLY RELEVANT information: Answer to the best of your ability using available information, clearly stating limitations.
   - If the context contains NO RELEVANT information: Respond with "I don't have enough information in my knowledge base to answer this question accurately."

3. **RESPONSE GUIDELINES**:
   - Be precise, factual, and objective
   - Structure your answer logically with clear points
   - Include relevant details, statistics, or examples from the context
   - Do not invent, assume, or hallucinate information
   - If uncertain, acknowledge the limitations of the available information
   - Maintain professional and helpful tone

4. **CRITICAL RULE**: NEVER invent information that is not present in the context. Your credibility depends on strict adherence to the provided documents.

5. **FORMATTING**: Use clear, readable formatting. You can use bullet points, numbered lists, or paragraphs as appropriate.

## THINKING PROCESS:
[Analyze the context relevance to the query]
[Extract key information points]
[Synthesize the most accurate response]
[Verify all information is context-based]

## FINAL ANSWER:
"""

# 5. Generate response using LLM
try:
    response = llm.invoke(final_prompt)
    print(response)
except Exception as e:
    print(f"Error generating response: {str(e)}")