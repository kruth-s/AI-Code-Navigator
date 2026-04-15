"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Swords, Shield, Share2, Sparkles, FolderGit2, Loader2, Quote } from "lucide-react";
import { useRepository } from "@/lib/RepositoryContext";

export default function PersonalityPage() {
  const { repositories } = useRepository();
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState<{
    personality_title: string;
    catchphrase: string;
    strengths: string[];
    weaknesses: string[];
    avatar_seed: string;
  } | null>(null);

  const generatePersonality = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setPersonality(null);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${BACKEND_URL}/api/personality/repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_name: selectedRepo }),
      });

      if (res.ok) {
        const data = await res.json();
        setPersonality(data);
      } else {
        alert("Failed to analyze repository personality.");
      }
    } catch (error) {
      console.error(error);
      alert("Error reaching personality engine.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!personality) return;
    const text = `My GitHub Repo is a "${personality.personality_title}"!\n\n"${personality.catchphrase}"\n\n💪 Strengths: ${personality.strengths.join(", ")}\n😅 Weaknesses: ${personality.weaknesses.join(", ")}\n\nFind out your repo's AI personality on Akaza! 🚀`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard! Share it on Twitter/X!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-violet-500/10 rounded-2xl mb-2">
          <Bot className="w-10 h-10 text-violet-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          AI Personality of Your Repo
        </h1>
        <p className="text-lg mx-auto max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Your codebase is alive. We analyze its commits, structure, and chaos to define its true character. 
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
            onClick={generatePersonality}
            disabled={loading || !selectedRepo}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all text-white disabled:opacity-50 hover:opacity-90 shadow-xl shadow-violet-500/20"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Psychoanalyzing code..." : "Summon Personality"}
          </button>
        </div>
      </motion.div>

      {/* Results Panel */}
      <AnimatePresence>
        {personality && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 p-8 rounded-3xl border relative overflow-hidden"
            style={{ 
              backgroundColor: "var(--bg-secondary)", 
              borderColor: "var(--border-primary)",
              boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.1)"
            }}
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 p-32 bg-violet-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
            
            {/* Left: Avatar & Title */}
            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <img 
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${personality.avatar_seed}&scale=120`}
                  alt="Repo Avatar"
                  className="w-48 h-48 rounded-3xl"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-secondary)"
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-2">
                  <Sparkles className="w-3 h-3" /> System Diagnostics Complete
                </div>
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                  {personality.personality_title}
                </h2>
                <div className="relative pt-4">
                  <Quote className="absolute top-0 left-0 w-6 h-6 text-indigo-500/20 -mt-2 -ml-2" />
                  <p className="text-lg italic text-gray-300 font-medium">
                    "{personality.catchphrase}"
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex flex-col justify-center space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                  <Swords className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-gray-200 uppercase tracking-widest text-sm">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {personality.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                  <Shield className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-gray-200 uppercase tracking-widest text-sm">Weaknesses (Quirks)</h3>
                </div>
                <ul className="space-y-2">
                  {personality.weaknesses.map((weak, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-400 italic">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                      {weak}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share action */}
              <div className="pt-6 mt-6 border-t border-white/5">
                <button 
                  onClick={copyToClipboard}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2 font-medium text-sm text-gray-300"
                >
                  <Share2 className="w-4 h-4" /> Share My Repo Identity
                </button>
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
