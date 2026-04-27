import os
import google.generativeai as genai
from typing import List
from dotenv import load_dotenv

load_dotenv()

def embed_text(text: str) -> List[float]:
    """
    Generates embeddings for a given text using Google's text-embedding-004 model.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    
    genai.configure(api_key=api_key)
    
    # Using the synchronous embed_content for simplicity in this service
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        task_type="retrieval_document"
    )
    
    return result['embedding']
