import { LayoutSpec, LayoutNode as SpecNode, DiagramSpec, LayoutConstraints } from 'shared';
import { Node, Edge } from 'reactflow';

/**
 * Converts a LayoutSpec from our backend into the format required by React Flow.
 */
export function toReactFlow(spec: LayoutSpec): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = spec.nodes.map((node: SpecNode) => ({
    id: node.id,
    type: 'custom', // Use our custom node
    position: { x: node.x, y: node.y },
    data: { 
      label: node.text, 
      kind: node.kind,
      locked: node.locked || false,
    },
    style: {
        width: node.width,
        height: node.height,
    }
  }));

  const edges: Edge[] = spec.edges.map((edge, i) => ({
    id: `e-${edge.from}-${edge.to}-${i}`,
    source: edge.from,
    target: edge.to,
    label: edge.text,
    type: 'smoothstep',
    markerEnd: { type: 'arrowclosed' },
  }));

  return { nodes, edges };
}

/**
 * Converts the current state of React Flow nodes/edges back into a DiagramSpec
 * and a set of layout constraints for the backend.
 */
export function fromReactFlow(nodes: Node[], edges: Edge[]): { diagramSpec: DiagramSpec; constraints: LayoutConstraints } {
  const diagramSpec: DiagramSpec = {
    nodes: nodes.map(n => ({
      id: n.id,
      text: n.data.label,
      kind: n.data.kind,
    })),
    edges: edges.map(e => ({
      from: e.source,
      to: e.target,
      text: e.label as string | undefined,
    })),
  };

  const constraints: LayoutConstraints = {
    lockedNodes: {},
  };

  nodes.forEach(node => {
    // If a node is marked as locked in its data payload...
    if (node.data.locked) {
      // ...add its current position to the constraints object.
      constraints.lockedNodes![node.id] = { x: node.position.x, y: node.position.y };
    }
  });

  return { diagramSpec, constraints };
}