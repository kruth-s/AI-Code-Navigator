"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Layers, AlertCircle, Sparkles, FolderGit2, Loader2, Download } from "lucide-react";
import { useRepository } from "@/lib/RepositoryContext";
import ReactFlow, { Background, useNodesState, useEdgesState, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

interface ArchData {
  nodes: { id: string; label: string }[];
  edges: { id: string; source: string; target: string; label?: string }[];
  tech_stack: string[];
  architecture_summary: string;
  issues: string[];
}

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export default function ArchitecturePage() {
  const { repositories } = useRepository();
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [archData, setArchData] = useState<ArchData | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const generateDiagram = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setArchData(null);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${BACKEND_URL}/api/architecture/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_name: selectedRepo }),
      });

      if (res.ok) {
        const data = await res.json();
        setArchData(data);
        
        // Map data to ReactFlow
        const rfNodes = data.nodes.map((n: any) => ({
          id: n.id,
          position: { x: 0, y: 0 },
          data: { label: n.label },
          type: 'default',
          style: {
            background: 'rgba(17, 17, 22, 0.95)',
            color: '#e5e7eb',
            border: '2px solid rgba(139, 92, 246, 0.6)',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '12px',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)'
          }
        }));

        const rfEdges = data.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: true,
          style: { stroke: 'rgba(139, 92, 246, 0.8)', strokeWidth: 2 }
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

      } else {
        alert("Failed to evaluate completely.");
      }
    } catch (error) {
      console.error(error);
      alert("Error reaching AI Architect Engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2 border border-indigo-500/20">
          <PenTool className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          AI Architecture Canvas
        </h1>
        <p className="text-lg mx-auto max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Automatically map your entire codebase into a clean, interactive System Design diagram using ReactFlow.
        </p>
      </div>

      {/* Control Panel */}
      <motion.div 
        className="max-w-md mx-auto p-4 rounded-3xl border"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-primary)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full bg-transparent outline-none font-medium appearance-none"
              style={{ color: "var(--text-primary)" }}
            >
              <option value="" disabled style={{ color: "black" }}>Select your repository...</option>
              {repositories.map(r => (
                <option key={r.id} value={r.name} style={{ color: "black" }}>{r.name}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={generateDiagram}
            disabled={loading || !selectedRepo}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all text-white disabled:opacity-50 hover:opacity-90 shadow-xl shadow-indigo-500/20"
            style={{ background: "linear-gradient(135deg, #4f46e5, #4338ca)" }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Reverse Engineering Layers..." : "Generate Interactive Flow"}
          </button>
        </div>
      </motion.div>

      {/* Canvas Area */}
      <AnimatePresence>
        {archData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
          >
            {/* ReactFlow Interactive Graph Layer */}
            <div 
                className="lg:col-span-2 rounded-3xl border relative overflow-hidden flex flex-col h-[600px]"
                style={{ 
                    backgroundColor: "#0d0d12",
                    borderColor: "rgba(255,255,255,0.05)",
                    boxShadow: "inset 0 0 100px rgba(79, 70, 229, 0.05)"
                }}
            >
                <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h2 className="font-bold tracking-widest uppercase text-xs text-gray-300">Architecture Flow</h2>
                </div>
                
                <div className="flex-1 w-full h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        className="touch-none"
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background color="rgba(255,255,255,0.1)" variant={BackgroundVariant.Dots} />
                    </ReactFlow>
                </div>
            </div>

            {/* Smart Insights Panel */}
            <div className="flex flex-col gap-4">
                
                {/* Tech Stack */}
                <div className="p-6 rounded-3xl bg-black/20 border border-white/5 shadow-xl shadow-black/50">
                     <h3 className="text-sm font-black text-gray-300 tracking-widest uppercase mb-4 opacity-80 border-b border-white/5 pb-2">Identified Tech Stack</h3>
                     <div className="flex flex-wrap gap-2">
                         {archData.tech_stack.map((ts, idx) => (
                             <span key={idx} className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
                                 {ts}
                             </span>
                         ))}
                     </div>
                </div>

                {/* Architecture Summary */}
                <div className="p-6 rounded-3xl bg-black/20 border border-white/5 shadow-xl shadow-black/50">
                     <h3 className="text-sm font-black text-gray-300 tracking-widest uppercase mb-4 opacity-80 border-b border-white/5 pb-2">Analysis</h3>
                     <p className="text-sm text-gray-400 leading-relaxed font-medium">
                         {archData.architecture_summary}
                     </p>
                </div>

                {/* Risks / Issues */}
                <div className="p-6 rounded-3xl border shadow-xl shadow-black/50 bg-red-500/5 border-red-500/10 flex-1">
                     <h3 className="flex items-center gap-2 text-sm font-black text-red-400 tracking-widest uppercase mb-4 opacity-90 border-b border-red-500/10 pb-2">
                         <AlertCircle className="w-4 h-4" /> Risk Overlay
                     </h3>
                     <ul className="space-y-3">
                         {archData.issues.map((issue, idx) => (
                             <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                                 <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-1.5 shrink-0" />
                                 <span className="leading-snug">{issue}</span>
                             </li>
                         ))}
                         {archData.issues.length === 0 && (
                            <li className="text-sm text-gray-500">No major architectural flaws detected.</li>
                         )}
                     </ul>
                </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
