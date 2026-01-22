from fastapi import APIRouter, Response
from pydantic import BaseModel
from typing import List

from app.models.spec import DiagramSpec, LayoutSpec, LayoutNode, LayoutEdge

# Request/Response Models
class AnalysisRequest(BaseModel):
    text: str

class AnalysisResponse(BaseModel):
    steps: List[str]

class GenerateRequest(BaseModel):
    text: str
    diagram_type: str = "flowchart"

class LayoutRequest(BaseModel):
    diagram_spec: DiagramSpec

class ExportRequest(BaseModel):
    layout_spec: LayoutSpec

router = APIRouter(prefix="/v1")

@router.post("/analyze", response_model=AnalysisResponse, tags=["Diagram Generation"])
async def analyze_text(request: AnalysisRequest):
    """
    (Placeholder) Analyzes input text and returns a sequence of steps.
    This is the first stage for a multi-step generation process.
    """
    return AnalysisResponse(steps=["Step 1: Analyze user text", "Step 2: Identify key entities", "Step 3: Determine relationships"])

from app.services.generator import generate_diagram_spec, DiagramGenerationError
from fastapi import HTTPException

# ... (other code)

@router.post("/generate", response_model=DiagramSpec, tags=["Diagram Generation"])
async def generate_diagram(request: GenerateRequest):
    """
    Generates a diagram specification from a text prompt using an LLM.
    The output does not contain any layout information.
    """
    try:
        diagram_spec = await generate_diagram_spec(request.text)
        return diagram_spec
    except DiagramGenerationError as e:
        # This is a controlled failure from our generation service
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # This catches other unexpected errors (e.g., API client issues)
        print(f"An unexpected error occurred in generate_diagram: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred.")

@router.post("/layout", response_model=LayoutSpec, tags=["Layout & Export"])
async def layout_diagram(request: LayoutRequest):
    """
    (Placeholder) Takes a diagram specification and adds layout information.
    This simulates a layout engine positioning nodes and routing edges.
    """
    layout_nodes: List[LayoutNode] = []
    y_pos = 100.0
    for i, node in enumerate(request.diagram_spec.nodes):
        layout_nodes.append(
            LayoutNode(
                id=node.id,
                text=node.text,
                kind=node.kind,
                x=150.0 * i + 50,
                y=y_pos,
                width=120.0,
                height=80.0,
            )
        )

    layout_edges: List[LayoutEdge] = []
    for edge in request.diagram_spec.edges:
        from_node = next((n for n in layout_nodes if n.id == edge.from_node), None)
        to_node = next((n for n in layout_nodes if n.id == edge.to_node), None)

        points = []
        if from_node and to_node:
            # Simple straight line from bottom-center of source to top-center of target
            points = [
                (from_node.x + from_node.width / 2, from_node.y + from_node.height),
                (to_node.x + to_node.width / 2, to_node.y),
            ]
        
        layout_edges.append(
            LayoutEdge(
                from_node=edge.from_node,
                to_node=edge.to_node,
                text=edge.text,
                points=points,
            )
        )

    return LayoutSpec(
        nodes=layout_nodes,
        edges=layout_edges,
        groups=request.diagram_spec.groups,
        style=request.diagram_spec.style,
    )

@router.post("/export/svg", response_model=str, tags=["Layout & Export"], responses={200: {"content": {"image/svg+xml": {}}}})
async def export_svg(request: ExportRequest):
    """
    (Placeholder) Exports a layout specification to an SVG image string.
    """
    svg_elements = []
    max_x, max_y = 0, 0
    for node in request.layout_spec.nodes:
        svg_elements.append(f'<rect x="{node.x}" y="{node.y}" rx="5" ry="5" width="{node.width}" height="{node.height}" fill="#fff" stroke="#333" stroke-width="2"/>')
        svg_elements.append(f'<text x="{node.x + node.width / 2}" y="{node.y + node.height / 2}" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12">{node.text}</text>')
        max_x = max(max_x, node.x + node.width)
        max_y = max(max_y, node.y + node.height)

    for edge in request.layout_spec.edges:
        if edge.points:
            path_data = "M " + " L ".join([f"{p[0]},{p[1]}" for p in edge.points])
            svg_elements.append(f'<path d="{path_data}" stroke="#333" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />')
            
    svg_header = f'''<svg width="{max_x + 50}" height="{max_y + 50}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
    </defs>
    '''
    svg_content = f'{svg_header}{"".join(svg_elements)}</svg>'
    return Response(content=svg_content, media_type="image/svg+xml")
