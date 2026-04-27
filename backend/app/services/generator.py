import json
import jsonschema
import os
from typing import Dict, Any, List, TypedDict, Optional, Annotated
import operator

from app.models.spec import DiagramSpec
from app.services.llm_client import gemini_client
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

# --- LangGraph State Definition ---

class AgentState(TypedDict):
    original_text: str
    rag_context: str
    extraction: Optional[Dict[str, Any]]
    diagram_spec: Optional[Dict[str, Any]]
    validation_errors: Optional[str]
    critique_feedback: Optional[str]
    retry_count: int
    critique_count: int
    final_spec: Optional[DiagramSpec]

# --- Constants & Schema ---

MAX_SCHEMA_RETRIES = 3
MAX_CRITIQUE_RETRIES = 1

def load_schema():
    try:
        schema_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'shared', 'schema', 'diagram_spec.schema.json')
        with open(os.path.normpath(schema_path), "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise RuntimeError(f"Schema file not found at: {schema_path}")

DIAGRAM_SPEC_SCHEMA = load_schema()

# --- Agent Nodes ---

async def extraction_agent(state: AgentState):
    """Extracts key entities and relationships from text."""
    print("--- EXTRACTION AGENT ---")
    
    prompt = f"""
    You are an analyst. Extract topics, steps, dependencies, and decision points from the text.
    Focus on logic and flow.
    
    Relevant Context: {state['rag_context']}
    User Text: {state['original_text']}
    {f"Previous Critique: {state['critique_feedback']}" if state['critique_feedback'] else ""}
    
    Return a structured summary of the logic in JSON format.
    """
    
    response = await gemini_client.generate_json(prompt, "")
    extraction = json.loads(response)
    
    return {"extraction": extraction}

async def schema_agent(state: AgentState):
    """Converts extraction into a valid DiagramSpec JSON."""
    print(f"--- SCHEMA AGENT (Retry: {state['retry_count']}) ---")
    
    repair_context = f"\nValidation Error to fix: {state['validation_errors']}" if state['validation_errors'] else ""
    
    prompt = f"""
    Convert the following extraction into a valid `DiagramSpec` JSON object.
    
    Extraction: {json.dumps(state['extraction'])}
    {repair_context}
    
    RULES:
    1. JSON ONLY.
    2. VALID `kind`: 'start', 'end', 'process', 'decision', 'data', 'note'.
    3. Use `text` for labels, NOT `label`.
    4. Use `from` and `to` for edges.
    """
    
    response = await gemini_client.generate_json(prompt, "")
    diagram_spec = json.loads(response)
    
    return {"diagram_spec": diagram_spec, "validation_errors": None}

async def validation_agent(state: AgentState):
    """Validates the DiagramSpec against Pydantic and JSON Schema."""
    print("--- VALIDATION AGENT ---")
    spec_data = state['diagram_spec']
    
    try:
        # JSON Schema validation
        jsonschema.validate(instance=spec_data, schema=DIAGRAM_SPEC_SCHEMA)
        # Pydantic validation
        spec = DiagramSpec(**spec_data)
        return {"final_spec": spec, "validation_errors": None}
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"Validation failed: {error_msg}")
        return {"validation_errors": error_msg, "retry_count": state['retry_count'] + 1}

async def critique_agent(state: AgentState):
    """Critiques the diagram for accuracy and completeness."""
    print("--- CRITIQUE AGENT ---")
    
    prompt = f"""
    Original Text: {state['original_text']}
    Generated Diagram: {json.dumps(state['diagram_spec'])}
    
    Critique this diagram. Does it accurately represent the original text? 
    Are any key steps or decisions missing?
    
    Return a JSON object: {{"satisfied": true/false, "feedback": "..."}}
    """
    
    response = await gemini_client.generate_json(prompt, "")
    critique = json.loads(response)
    
    if critique.get("satisfied"):
        return {"critique_feedback": None}
    else:
        return {
            "critique_feedback": critique.get("feedback"), 
            "critique_count": state['critique_count'] + 1
        }

# --- Routing Logic ---

def should_continue_schema(state: AgentState):
    if state['validation_errors']:
        if state['retry_count'] < MAX_SCHEMA_RETRIES:
            return "schema"
        else:
            return "fail"
    return "critique"

def should_continue_extraction(state: AgentState):
    if state['critique_feedback'] and state['critique_count'] < MAX_CRITIQUE_RETRIES:
        return "extraction"
    return "end"

# --- Graph Setup ---

workflow = StateGraph(AgentState)

workflow.add_node("extraction", extraction_agent)
workflow.add_node("schema", schema_agent)
workflow.add_node("validation", validation_agent)
workflow.add_node("critique", critique_agent)

workflow.set_entry_point("extraction")

workflow.add_edge("extraction", "schema")
workflow.add_edge("schema", "validation")

workflow.add_conditional_edges(
    "validation",
    should_continue_schema,
    {
        "schema": "schema",
        "critique": "critique",
        "fail": END
    }
)

workflow.add_conditional_edges(
    "critique",
    should_continue_extraction,
    {
        "extraction": "extraction",
        "end": END
    }
)

app_graph = workflow.compile()

# --- Main Entry Point ---

class DiagramGenerationError(Exception):
    pass

async def generate_diagram_spec(text: str, context: str = "") -> DiagramSpec:
    """
    Invokes the LangGraph multi-agent workflow to generate a DiagramSpec.
    """
    initial_state: AgentState = {
        "original_text": text,
        "rag_context": context,
        "extraction": None,
        "diagram_spec": None,
        "validation_errors": None,
        "critique_feedback": None,
        "retry_count": 0,
        "critique_count": 0,
        "final_spec": None
    }
    
    try:
        final_state = await app_graph.ainvoke(initial_state)
        
        if final_state.get("final_spec"):
            return final_state["final_spec"]
        
        if final_state.get("validation_errors"):
            raise DiagramGenerationError(f"Failed to generate valid schema: {final_state['validation_errors']}")
            
        raise DiagramGenerationError("Diagram generation failed to produce a valid result.")
        
    except Exception as e:
        if isinstance(e, DiagramGenerationError):
            raise
        print(f"Error in multi-agent workflow: {e}")
        raise DiagramGenerationError(f"An error occurred during multi-agent generation: {str(e)}")
