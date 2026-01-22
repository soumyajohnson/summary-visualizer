"use client";

import { useState } from "react";
import ReactFlow, {
  Elements,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";
import axios from "axios";
import { DiagramSpec } from "shared";
import { ReactFlowProvider } from "reactflow";
import { toSvg } from 'reactflow';

const elk = new ELK();

const layoutNodes = async (nodes: Node[], edges: Edge[]): Promise<Node[]> => {
  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "80",
    },
    children: nodes.map((node) => ({
      ...node,
      width: 150,
      height: 50,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layout = await elk.layout(graph);
  return nodes.map((node) => {
    const layoutNode = layout.children?.find((n) => n.id === node.id);
    return {
      ...node,
      position: {
        x: layoutNode?.x ?? 0,
        y: layoutNode?.y ?? 0,
      },
    };
  });
};

function downloadSvg(svg) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flowchart.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Flow() {
  const { getNodes, getEdges } = useReactFlow();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);


  const generateFlowchart = async () => {
    setLoading(true);
    try {
      const response = await axios.post<DiagramSpec>(
        "http://localhost:8000/api/generate",
        { text }
      );
      const { nodes, edges } = response.data;
      const layoutedNodes = await layoutNodes(nodes, edges);
      setNodes(layoutedNodes);
      setEdges(edges);
    } catch (error) {
      console.error("Error generating flowchart:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportSvg = () => {
    toSvg(getNodes(), getEdges(), {
      width: 1024,
      height: 768,
    }).then(downloadSvg);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Text to Flowchart
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <div className="w-[800px] h-[600px] border border-gray-300 rounded-lg">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <textarea
            className="w-full bg-transparent border border-gray-300 rounded-lg p-2"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to generate a flowchart..."
          />
          <button
            className="mt-4 w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
            onClick={generateFlowchart}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Flowchart"}
          </button>
          <button
            className="mt-4 w-full rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            onClick={exportSvg}
          >
            Export as SVG
          </button>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
