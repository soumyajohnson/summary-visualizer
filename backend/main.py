import os
import google.generativeai as genai
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

# Get the API key from the environment variable
# Create a .env file in the backend directory and add the following line:
# GOOGLE_API_KEY="your_api_key"
from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

# Pydantic models based on the shared schema
class Node(BaseModel):
    id: str
    label: str

class Edge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None

class DiagramSpec(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class GenerateRequest(BaseModel):
    text: str

@app.post("/api/generate", response_model=DiagramSpec)
async def generate_diagram(request: GenerateRequest):
    """
    Receives text and generates a DiagramSpec JSON.
    """
    prompt = f"""
    You are a helpful assistant that generates flowcharts from text.
    The user will provide a text, and you need to generate a JSON object that represents a flowchart.
    The JSON object should follow this schema:
    {{
        "nodes": [
            {{"id": "node1", "label": "Node 1"}},
            {{"id": "node2", "label": "Node 2"}}
        ],
        "edges": [
            {{"id": "edge1", "source": "node1", "target": "node2", "label": "Edge Label"}}
        ]
    }}

    - The "nodes" array should contain objects, each with a unique "id" and a "label".
    - The "edges" array should contain objects, each with a unique "id", a "source" node id, a "target" node id, and an optional "label".
    - The graph should be a single connected component.
    - Do not generate SVG or any other format, only the JSON object.

    Here is the text from the user:
    {request.text}
    """

    model = genai.GenerativeModel('gemini-pro')
    response = await model.generate_content_async(prompt)

    # The response from the model is expected to be a JSON string.
    # We need to parse it and return a DiagramSpec object.
    # Adding error handling for JSON parsing.
    try:
        import json
        # The model sometimes returns the json in a code block, so we need to extract it.
        json_string = response.text.replace("```json", "").replace("```", "").strip()
        diagram_spec = json.loads(json_string)
        return DiagramSpec(**diagram_spec)
    except (json.JSONDecodeError, TypeError) as e:
        print(f"Error parsing JSON from model: {e}")
        # Return a default or error response
        return DiagramSpec(nodes=[], edges=[])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
