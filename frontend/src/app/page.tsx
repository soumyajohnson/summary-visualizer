'use client';

import { useState, useCallback } from 'react';
import { 
    QueryClient, 
    QueryClientProvider, 
    useMutation,
} from '@tanstack/react-query';
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'reactflow';

import TextPane from '@/components/TextPane';
import DiagramPane from '@/components/DiagramPane';
import { generateAndLayoutDiagram, tidyLayout } from '@/lib/api';
import { toReactFlow, fromReactFlow } from '@/lib/specAdapters';
import type { LayoutSpec, DiagramSpec, LayoutConstraints } from 'shared';

const queryClient = new QueryClient();

// Helper type for the tidy mutation
type TidyPayload = {
  diagramSpec: DiagramSpec;
  constraints: LayoutConstraints;
};

function Editor() {
  // State for the text input
  const [text, setText] = useState(
    'A customer places an order. The system validates the payment. If payment is successful, it sends the order to the warehouse for fulfillment and sends a confirmation email to the customer. If payment fails, it sends a failure notification.'
  );

  // State for React Flow nodes and edges
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // --- State Change Handlers for React Flow ---
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [],
  );

  // --- Node Interaction Logic ---
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, locked: !n.data.locked } };
        }
        return n;
      })
    );
  }, []);
  
  // --- API Mutations ---
  const handleMutationSuccess = (data: LayoutSpec) => {
    const { nodes: rfNodes, edges: rfEdges } = toReactFlow(data);
    // When a new layout is applied, we need to preserve the locked status
    // of nodes from the old state if they still exist.
    setNodes(currentNodes => {
        const lockedStatusMap = new Map(currentNodes.map(n => [n.id, n.data.locked]));
        return rfNodes.map(newNode => ({
            ...newNode,
            data: {
                ...newNode.data,
                locked: lockedStatusMap.get(newNode.id) || false,
            }
        }));
    });
    setEdges(rfEdges);
  };

  const handleMutationError = (error: Error) => {
    console.error('Operation failed:', error);
    alert(`Error: ${error.message}`);
  };

  const generateMutation = useMutation<LayoutSpec, Error, string>({
    mutationFn: generateAndLayoutDiagram,
    onSuccess: (data) => {
        // For a full generation, reset everything
        const { nodes: rfNodes, edges: rfEdges } = toReactFlow(data);
        setNodes(rfNodes);
        setEdges(rfEdges);
    },
    onError: handleMutationError,
  });
  
  const tidyMutation = useMutation<LayoutSpec, Error, TidyPayload>({
    mutationFn: (payload) => tidyLayout(payload.diagramSpec, payload.constraints),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });

  // --- Button Click Handlers ---
  const handleGenerate = () => {
    if (!text.trim()) {
      alert('Please enter a description for the diagram.');
      return;
    }
    generateMutation.mutate(text);
  };

  const handleTidy = () => {
    if (nodes.length === 0) return;
    const { diagramSpec, constraints } = fromReactFlow(nodes, edges);
    tidyMutation.mutate({ diagramSpec, constraints });
  };

  return (
    <main className="flex h-full w-full font-sans">
      <div className="w-1/4 h-full max-w-sm">
        <TextPane
          text={text}
          setText={setText}
          onGenerate={handleGenerate}
          onTidy={handleTidy}
          isGenerating={generateMutation.isPending}
          isTidying={tidyMutation.isPending}
        />
      </div>
      <div className="w-3/4 h-full" onDoubleClick={(e) => {
          const target = e.target as HTMLElement;
          const nodeElement = target.closest('.react-flow__node');
          if(nodeElement) {
              const nodeId = nodeElement.getAttribute('data-id');
              const node = nodes.find(n => n.id === nodeId);
              if (node) onNodeDoubleClick(e as React.MouseEvent, node);
          }
      }}>
        <DiagramPane
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <Editor />
    </QueryClientProvider>
  );
}
