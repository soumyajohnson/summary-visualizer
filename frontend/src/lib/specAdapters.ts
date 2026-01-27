import { LayoutSpec, LayoutNode as SpecNode, DiagramSpec, LayoutConstraints } from 'shared';
import { Node, Edge } from 'reactflow';

/**
 * Converts a LayoutSpec from our backend into the format required by React Flow.
 * This adapter is now updated for the new "playful" design.
 */
export function toReactFlow(spec: LayoutSpec): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = spec.nodes.map((node: SpecNode) => ({
    id: node.id,
    type: 'custom', // We will always use our custom node for styling
    position: { x: node.x, y: node.y },
    data: { 
      label: node.text, 
      kind: node.kind,
      locked: node.locked || false,
    },
    // We remove direct styling here to rely on the CustomNode's CSS
    // but keep width/height to let React Flow know the node's dimensions.
style: {
      width: node.width,
      height: node.height,
      // This is the fix: make the wrapper invisible so our custom node's styles can be seen.
      background: 'transparent',
      border: 'none',
      padding: 0,
    }
  }));

  const edges: Edge[] = spec.edges.map((edge, i) => ({
    id: `e-${edge.from}-${edge.to}-${i}`,
    source: edge.from,
    target: edge.to,
    label: edge.text,
    type: 'smoothstep', // Use smooth, curved lines
    // No arrowhead for a softer look
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
    if (node.data.locked) {
      constraints.lockedNodes![node.id] = { x: node.position.x, y: node.position.y };
    }
  });

  return { diagramSpec, constraints };
}
