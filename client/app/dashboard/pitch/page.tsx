"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Presentation, Download, Sparkles, FolderGit2, Loader2, ArrowRight } from "lucide-react";
import { useRepository } from "@/lib/RepositoryContext";
import RepoSelector from "@/components/RepoSelector";

interface PitchData {
  product_name: string;
  tagline: string;
  problem: string;
  solution: string;
  features: string[];
  target_users: string[];
  market_size: string;
  business_model: string;
  future_scope: string;
  repo_link: string;
}

export default function PitchDeckPage() {
  const { repositories } = useRepository();
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [pitchData, setPitchData] = useState<PitchData | null>(null);

  const generatePitch = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setPitchData(null);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${BACKEND_URL}/api/pitch/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_name: selectedRepo }),
      });

      if (res.ok) {
        const data = await res.json();
        setPitchData(data);
      } else {
        alert("Failed to analyze repository for pitch.");
      }
    } catch (error) {
      console.error(error);
      alert("Error reaching Pitch Engine.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPresentation = async () => {
    if (!pitchData) return;
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${BACKEND_URL}/api/pitch/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: pitchData }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pitchData.product_name.replace(/\s+/g, '_')}_Pitch_Deck.pptx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to generate PPTX file.");
      }
    } catch (error) {
      console.error(error);
      alert("Error initiating file download.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-fuchsia-500/10 rounded-2xl mb-2">
          <Presentation className="w-10 h-10 text-fuchsia-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Startup Pitch Generator
        </h1>
        <p className="text-lg mx-auto max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Turn your code repository into a fully structured, 5-slide investor pitch deck in seconds. Find product-market fit automatically.
        </p>
      </div>

      {/* Control Panel */}
      <motion.div 
        className="max-w-md mx-auto p-6 rounded-2xl border"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-primary)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-4">
          <RepoSelector 
            repositories={repositories} 
            selectedRepo={selectedRepo} 
            setSelectedRepo={setSelectedRepo} 
            accentClass="text-fuchsia-400" 
          />
          
          <button
            onClick={generatePitch}
            disabled={loading || !selectedRepo}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all text-white disabled:opacity-50 hover:opacity-90 shadow-xl shadow-fuchsia-500/20"
            style={{ background: "linear-gradient(135deg, #d946ef, #a21caf)" }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Simulating Product..." : "Generate Concept"}
          </button>
        </div>
      </motion.div>

      {/* Results Panel */}
      <AnimatePresence>
        {pitchData && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-8 rounded-3xl border relative"
            style={{ 
              backgroundColor: "var(--bg-secondary)", 
              borderColor: "var(--border-primary)",
              boxShadow: "0 25px 50px -12px rgba(217, 70, 239, 0.1)"
            }}
          >
            {/* Header: Title and Download */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-white/10">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">
                      {pitchData.product_name}
                    </h2>
                    <p className="text-lg italic text-gray-300 font-medium">"{pitchData.tagline}"</p>
                </div>
                
                <button 
                  onClick={downloadPresentation}
                  className="shrink-0 px-6 py-3 rounded-xl bg-white text-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-bold text-sm shadow-xl"
                >
                  <Download className="w-4 h-4" /> Export .PPTX
                </button>
            </div>

            {/* Grid of the remaining slides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Slide: Problem & Solution */}
                <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-fuchsia-400">Slide 2</span>
                        <h3 className="text-lg font-semibold text-white">Problem & Solution</h3>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-red-400 mb-1">Problem</h4>
                        <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{pitchData.problem}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-emerald-400 mb-1">Solution</h4>
                        <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{pitchData.solution}</p>
                    </div>
                </div>

                {/* Visual Slide: Features */}
                <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Slide 3</span>
                        <h3 className="text-lg font-semibold text-white">Core Features</h3>
                    </div>
                    <ul className="space-y-2">
                        {pitchData.features.map((ft, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                                <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <span>{ft}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Visual Slide: Market */}
                <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">Slide 4</span>
                        <h3 className="text-lg font-semibold text-white">Market & Target Users</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {pitchData.target_users.map((u, i) => (
                            <span key={i} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                                {u}
                            </span>
                        ))}
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Market Opportunity</h4>
                        <p className="text-sm text-gray-300 font-semibold">{pitchData.market_size}</p>
                    </div>
                </div>

                {/* Visual Slide: Business */}
                <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Slide 5</span>
                        <h3 className="text-lg font-semibold text-white">Business Model & Future</h3>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Monetization</h4>
                        <p className="text-sm text-amber-400 font-semibold">{pitchData.business_model}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1 pt-2 border-t border-white/5 mt-2">Future Scalability</h4>
                        <p className="text-sm text-gray-300 italic">{pitchData.future_scope}</p>
                    </div>
                </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
