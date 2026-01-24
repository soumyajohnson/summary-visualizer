import subprocess
import json
import os
from app.models.spec import DiagramSpec, LayoutSpec

class LayoutError(Exception):
    """Custom exception for layout service errors."""
    pass

def calculate_layout(spec: DiagramSpec) -> LayoutSpec:
    """
    Calculates the layout for a DiagramSpec by calling the Node.js layout engine.

    This function serializes the DiagramSpec to JSON, executes a Node.js script
    as a subprocess, passes the JSON to its stdin, and reads the resulting
    LayoutSpec JSON from its stdout.
    """
    node_script_path = os.path.normpath(
        os.path.join(os.path.dirname(__file__), '..', '..', 'tools', 'layout_engine.js')
    )
    
    tools_dir = os.path.dirname(node_script_path)

    if not os.path.exists(node_script_path):
        raise FileNotFoundError(f"Layout engine script not found at: {node_script_path}")
    
    # Ensure node_modules exists, otherwise provide a helpful error
    if not os.path.exists(os.path.join(tools_dir, 'node_modules')):
        raise FileNotFoundError(f"node_modules not found in {tools_dir}. Please run 'npm install' in that directory.")

    # Using by_alias=True to convert Pydantic fields like 'from_node' back to 'from' for the JS script.
    input_json = spec.json(by_alias=True)
    
    try:
        # Execute the Node.js script as a subprocess
        process = subprocess.Popen(
            ['node', node_script_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            # Run from the 'tools' dir so 'node' can find 'node_modules'
            cwd=tools_dir 
        )
        
        stdout, stderr = process.communicate(input=input_json)
        
        if process.returncode != 0:
            raise LayoutError(f"Layout engine script exited with error code {process.returncode}:\n{stderr}")
            
        layout_data = json.loads(stdout)
        return LayoutSpec(**layout_data)

    except FileNotFoundError:
        # This error fires if 'node' is not in the system's PATH
        raise LayoutError("The 'node' runtime was not found. Please ensure Node.js is installed and accessible in your system's PATH.")
    except Exception as e:
        raise LayoutError(f"An unexpected error occurred during layout calculation: {e}")
