from enum import Enum
from typing import List, Optional, Tuple, Set
from pydantic import BaseModel, Field, validator

MAX_NODES = 40

class NodeKind(str, Enum):
    START = "start"
    END = "end"
    PROCESS = "process"
    DECISION = "decision"
    DATA = "data"
    NOTE = "note"

class Node(BaseModel):
    id: str
    text: str = Field(..., min_length=1)
    kind: NodeKind

class Edge(BaseModel):
    from_node: str = Field(alias="from")
    to_node: str = Field(alias="to")
    text: Optional[str] = None

class Group(BaseModel):
    id: str
    text: str
    node_ids: List[str]

class DiagramSpec(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    groups: Optional[List[Group]] = None
    style: Optional[str] = None

    @validator('nodes')
    def validate_max_nodes(cls, v):
        if len(v) > MAX_NODES:
            raise ValueError(f"Too many nodes. Maximum is {MAX_NODES}.")
        return v

    @validator('nodes')
    def validate_unique_node_ids(cls, v):
        ids: Set[str] = set()
        for node in v:
            if node.id in ids:
                raise ValueError(f"Node ID '{node.id}' is not unique.")
            ids.add(node.id)
        return v

class LayoutNode(Node):
    x: float
    y: float
    width: float
    height: float

class LayoutEdge(Edge):
    points: List[Tuple[float, float]]

class LayoutSpec(DiagramSpec):
    nodes: List[LayoutNode]
    edges: List[LayoutEdge]
