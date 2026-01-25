import subprocess
import json
import os
from app.models.spec import DiagramSpec, LayoutSpec, LayoutConstraints
from typing import Optional

class LayoutError(Exception):
    """Custom exception for layout service errors."""
    pass

def calculate_layout(spec: DiagramSpec, constraints: Optional[LayoutConstraints] = None) -> LayoutSpec:
    """
    Calculates the layout for a DiagramSpec by calling the Node.js layout engine.
    """
    node_script_path = os.path.normpath(
        os.path.join(os.path.dirname(__file__), '..', '..', 'tools', 'layout_engine.js')
    )
    tools_dir = os.path.dirname(node_script_path)

    if not os.path.exists(node_script_path):
        raise FileNotFoundError(f"Layout engine script not found at: {node_script_path}")
    
    if not os.path.exists(os.path.join(tools_dir, 'node_modules')):
        raise FileNotFoundError(f"node_modules not found in {tools_dir}. Please run 'npm install' in that directory.")

    # Construct the payload for the Node.js script
    payload = {
        "diagram_spec": json.loads(spec.json(by_alias=True)),
        "constraints": json.loads(constraints.json(by_alias=True, exclude_none=True)) if constraints else None,
    }
    input_json = json.dumps(payload)
    
    try:
        process = subprocess.Popen(
            ['node', node_script_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=tools_dir
        )
        stdout, stderr = process.communicate(input=input_json)
        
        if process.returncode != 0:
            raise LayoutError(f"Layout engine script exited with error code {process.returncode}:\n{stderr}")
            
        layout_data = json.loads(stdout)
        return LayoutSpec(**layout_data)

    except FileNotFoundError:
        raise LayoutError("The 'node' runtime was not found. Please ensure Node.js is installed and accessible in your system's PATH.")
    except Exception as e:
        raise LayoutError(f"An unexpected error occurred during layout calculation: {e}")