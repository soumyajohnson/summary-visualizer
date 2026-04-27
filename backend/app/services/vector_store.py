import chromadb
from chromadb.config import Settings
import os
from typing import List, Dict, Any
from app.services.embeddings import embed_text

# Initialize ChromaDB client
# Using a local persistent storage
CHROMA_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'chroma')
os.makedirs(CHROMA_DATA_PATH, exist_ok=True)

client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)

# Get or create the collection
collection = client.get_or_create_collection(
    name="diagram_knowledge",
    metadata={"hnsw:space": "cosine"} # Using cosine similarity
)

def ingest_document(doc_id: str, text: str, metadata: Dict[str, Any]):
    """
    Ingests a document chunk into ChromaDB with its embedding.
    """
    embedding = embed_text(text)
    collection.add(
        ids=[doc_id],
        embeddings=[embedding],
        documents=[text],
        metadatas=[metadata]
    )

def retrieve_context(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieves relevant text chunks for a query with similarity scores.
    """
    query_embedding = embed_text(query)
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )
    
    formatted_results = []
    if results['documents']:
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                "text": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "score": 1 - results['distances'][0][i] # Convert distance to similarity score
            })
            
    return formatted_results
