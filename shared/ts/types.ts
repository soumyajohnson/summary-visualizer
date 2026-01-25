export const NODE_KINDS = ['start', 'end', 'process', 'decision', 'data', 'note'] as const;
export type NodeKind = typeof NODE_KINDS[number];

export interface Node {
  id: string;
  text: string;
  kind: NodeKind;
}

export interface Edge {
  from: string;
  to: string;
  text?: string;
}

export interface Group {
    id: string;
    text: string;
    node_ids: string[];
}

export interface DiagramSpec {
  nodes: Node[];
  edges: Edge[];
  groups?: Group[];
  style?: string;
}

// Post-layout types
export interface LayoutNode extends Node {
  x: number;
  y: number;
  width: number;
  height: number;
  locked?: boolean;
}

export type Point = [number, number];

export interface LayoutEdge extends Edge {
  points: Point[];
}

export interface LayoutSpec {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  groups?: Group[];
  style?: string;
}

export interface LayoutConstraints {
    lockedNodes?: { [nodeId: string]: { x: number; y: number } };
}