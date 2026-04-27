import time
import uuid
from typing import List
from app.services.vector_store import ingest_document

def chunk_text(text: str, max_tokens: int = 500) -> List[str]:
    """
    Intelligently chunks text by paragraphs.
    A more advanced version would use a tokenizer to count tokens accurately.
    For this implementation, we assume 1 token ~= 4 characters as a rough heuristic.
    """
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    max_chars = max_tokens * 4
    
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
            
        if len(current_chunk) + len(p) < max_chars:
            if current_chunk:
                current_chunk += "\n\n" + p
            else:
                current_chunk = p
        else:
            if current_chunk:
                chunks.append(current_chunk)
            
            # If a single paragraph is larger than max_chars, we have to split it
            if len(p) > max_chars:
                # Basic split by sentence or fixed length if necessary
                # Here we just split by fixed length for simplicity
                for i in range(0, len(p), max_chars):
                    chunks.append(p[i:i+max_chars])
                current_chunk = ""
            else:
                current_chunk = p
                
    if current_chunk:
        chunks.append(current_chunk)
        
    return chunks

def process_ingestion(text: str, source_label: str):
    """
    Chunks, embeds, and stores text in the vector store.
    """
    chunks = chunk_text(text)
    timestamp = time.time()
    
    for i, chunk in enumerate(chunks):
        doc_id = f"{source_label}_{int(timestamp)}_{i}"
        metadata = {
            "source": source_label,
            "chunk_index": i,
            "timestamp": timestamp
        }
        ingest_document(doc_id, chunk, metadata)
    
    return len(chunks)
