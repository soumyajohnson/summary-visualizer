'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
} from 'reactflow';
import CustomNode from './CustomNode';

import 'reactflow/dist/style.css';

interface DiagramPaneProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
}

const defaultEdgeOptions = {
    style: { strokeWidth: 3 },
    type: 'smoothstep',
};

export default function DiagramPane({ 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange,
    onConnect,
}: DiagramPaneProps) {
  // We only need to register our single custom node type
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div className="w-full h-full bg-gray">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        proOptions={{ hideAttribution: true }}
        // Give some padding so nodes don't touch the edge
        fitViewOptions={{ padding: 0.1 }}
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
