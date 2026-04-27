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
    style: { strokeWidth: 2, stroke: '#C4A0C4' },
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
    <div className="w-full h-full bg-transparent">
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
        fitViewOptions={{ padding: 0.1 }}
      >
        <Controls />
        <MiniMap 
            nodeStrokeWidth={3} 
            zoomable 
            pannable 
            maskColor="rgba(253, 246, 240, 0.6)"
            style={{
                backgroundColor: '#FFF0F8',
                border: '1px solid #E0C0D8',
                borderRadius: '1rem'
            }}
        />
        <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1} 
            color="#E0C8E8" 
        />
      </ReactFlow>
    </div>
  );
}
