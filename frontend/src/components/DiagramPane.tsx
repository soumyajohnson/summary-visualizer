'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  Connection,
  OnConnect,
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

export default function DiagramPane({ 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange,
    onConnect,
}: DiagramPaneProps) {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div className="w-full h-full bg-gray-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}