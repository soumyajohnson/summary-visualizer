import json
import jsonschema
import os
from typing import Dict, Any

from app.models.spec import DiagramSpec
from app.services.llm_client import gemini_client

MAX_RETRIES = 2

# --- Schema and Prompts ---

def load_schema():
    """Load the DiagramSpec JSON schema from the shared directory."""
    try:
        # Path is relative to the `backend` directory where uvicorn is run
        schema_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'shared', 'schema', 'diagram_spec.schema.json')
        with open(os.path.normpath(schema_path), "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"FATAL: Schema file not found at expected path: {schema_path}")
        raise

DIAGRAM_SPEC_SCHEMA = load_schema()

SYSTEM_PROMPT = """
You are an expert system that converts natural language descriptions into structured `DiagramSpec` JSON for generating flowcharts.

**CRITICAL RULES:**
1.  **OUTPUT MUST BE JSON ONLY**: Your entire response must be a single, raw, valid JSON object. Do not wrap it in markdown (like ```json), add comments, or any other text.
2.  **ADHERE TO THE SCHEMA**: The JSON object's structure, fields, and types MUST strictly conform to the `DiagramSpec` schema.
3.  **NODE `id`s MUST BE UNIQUE**: Every node object in the `nodes` array must have a unique `id` string.
4.  **VALID `kind`**: Node `kind` must be one of: 'start', 'end', 'process', 'decision', 'data', 'note'.
5.  **USE `decision` FOR CONDITIONALS**: For if/else, switch, or any conditional logic, use a 'decision' node. A 'decision' node should have at least two outgoing edges representing the different paths (e.g., labeled "Yes" and "No").
6.  **CREATE A CONNECTED GRAPH**: Ensure all nodes are connected via edges. The graph should not have orphaned nodes. Start with a 'start' node and conclude paths with an 'end' node.
"""

REPAIR_PROMPT_TEMPLATE = """
The previous JSON output failed validation. You MUST correct the error and provide a new, valid `DiagramSpec` JSON object.

**Validation Error:**
{error}

**Original User Text:**
{user_text}

**Instructions:**
1.  Analyze the validation error.
2.  Review the original text and your previous attempt.
3.  Generate a **complete and corrected** JSON object that fixes the error and satisfies all rules.
4.  Your output must be **only the raw JSON object**.

Corrected JSON object:
"""

class DiagramGenerationError(Exception):
    """Custom exception for failures in diagram generation."""
    pass

def _validate_spec_json(data: Dict[str, Any]) -> None:
    """Validates data against the DiagramSpec JSON schema. Raises ValidationError on failure."""
    if not DIAGRAM_SPEC_SCHEMA:
        raise DiagramGenerationError("JSON schema not loaded. Cannot validate.")
    jsonschema.validate(instance=data, schema=DIAGRAM_SPEC_SCHEMA)

async def generate_diagram_spec(text: str) -> DiagramSpec:
    """
    Generates a DiagramSpec from text using an LLM, with schema validation and automated retries.
    """
    if not gemini_client:
        raise DiagramGenerationError("LLM client is not initialized. Check GOOGLE_API_KEY.")

    last_exception = None
    for attempt in range(MAX_RETRIES + 1):
        is_retry = attempt > 0
        prompt = REPAIR_PROMPT_TEMPLATE.format(error=f"{type(last_exception).__name__}: {last_exception}", user_text=text) if is_retry else SYSTEM_PROMPT
        user_input = "" if is_retry else text # User text is in the repair prompt already

        print(f"Generator: Attempt {attempt + 1}/{MAX_RETRIES + 1}...")
        try:
            # 1. Generate JSON string from LLM
            json_str = await gemini_client.generate_json(prompt, user_input)

            # 2. Parse the JSON string
            json_data = json.loads(json_str)

            # 3. Validate against the JSON schema
            _validate_spec_json(json_data)

            # 4. Validate and coerce with Pydantic model
            spec = DiagramSpec(**json_data)
            print(f"Generator: Successfully generated and validated spec on attempt {attempt + 1}.")
            return spec

        except (json.JSONDecodeError, jsonschema.ValidationError, Exception) as e:
            last_exception = e
            print(f"Generator: Attempt {attempt + 1} failed. Reason: {type(e).__name__}: {e}")

    # If all retries fail
    raise DiagramGenerationError(
        f"Failed to generate a valid diagram spec after {MAX_RETRIES + 1} attempts. "
        f"Last error: {type(last_exception).__name__}: {last_exception}"
    )
