"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Headphones, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  RefreshCcw,
  Sparkles,
  ChevronDown,
  LockKeyhole,
  Rocket
} from "lucide-react";
import { useRepository } from "@/lib/RepositoryContext";

export default function RepoBriefPage() {
  const { repositories } = useRepository();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col justify-center space-y-4 relative overflow-hidden">
      {/* Compact Header */}
      <div className="text-center space-y-2 relative z-10 scale-90">
        <div className="inline-flex items-center justify-center p-2.5 bg-emerald-500/10 rounded-2xl mb-1 border border-emerald-500/20">
          <Headphones className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          60-Second Repo Brief
        </h1>
        <p className="text-sm mx-auto max-w-xl opacity-80" style={{ color: "var(--text-secondary)" }}>
          Explain your codebase like a Senior Developer in under 60 seconds.
        </p>
      </div>

      {/* Control Panel (Locked) - Centered and Compact */}
      <motion.div 
        className="rounded-3xl border relative overflow-hidden bg-black/40 flex-1 max-h-[600px]"
        style={{ borderColor: "var(--border-primary)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* SAAS PREMIUM LOCK OVERLAY */}
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-[#0a0a0d]/60 rounded-3xl">
           <motion.div 
              className="bg-black/80 px-8 py-8 rounded-3xl border border-emerald-500/30 flex flex-col items-center gap-5 text-center max-w-md shadow-2xl shadow-emerald-500/10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
           >
              <div className="relative">
                 <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full"></div>
                 <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/30 relative">
                     <Headphones className="w-8 h-8 text-emerald-400" />
                 </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> Upcoming Feature
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Audio Repository Briefs</h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-sm px-4">
                      We're actively fine-tuning our localized Text-to-Speech models. Soon, you'll be able to listen to a Senior Engineer dissect any repository architecture in under 60 seconds.
                  </p>
              </div>
              <button 
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:opacity-90 transition shadow-lg shadow-emerald-500/20 w-full mt-2 flex items-center justify-center gap-2"
              >
                  <LockKeyhole className="w-4 h-4"/> Get Early Access
              </button>
           </motion.div>
        </div>

        {/* MOCK UI BEHIND THE OVERLAY (Visual tease) */}
        <div className="p-8 opacity-40 select-none blur-[4px] pointer-events-none">
            {/* Fake Data Layout - SaaS Preview */}
            <div className="flex flex-col items-center mb-10 pb-8 border-b border-white/10 text-center">
                <span className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-2">Currently Scanning</span>
                <h2 className="text-3xl font-black text-white mb-4">facebook/react-core</h2>
                <div className="flex gap-2">
                    {["React", "Node.js", "C++", "WebGL"].map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Target Audience:</span>
                    <select disabled className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-medium text-white appearance-none min-w-[200px]">
                        <option>Senior Engineer</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Tone:</span>
                    <select disabled className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-medium text-white appearance-none min-w-[200px]">
                        <option>Energetic</option>
                    </select>
                </div>
            </div>

            {/* Audio Player Core */}
            <div className="flex flex-col items-center max-w-2xl mx-auto space-y-10">
                {/* Visualizer (Fake Waves) */}
                <div className="w-full flex items-end justify-center gap-1.5 h-16">
                   {[...Array(40)].map((_, i) => (
                      <div key={i} 
                           className="w-1.5 bg-emerald-400 rounded-full" 
                           style={{ height: `${Math.max(15, Math.sin(i) * 50 + 20)}px`, opacity: i < 15 ? 1 : 0.3 }} 
                      />
                   ))}
                </div>

                {/* Progress Bar */}
                <div className="w-full space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-400 font-mono">
                        <span className="text-emerald-400">0:14</span>
                        <span>0:60</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[30%] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-10">
                   <button className="text-gray-500 transition">
                       <SkipBack className="w-7 h-7" />
                   </button>
                   <button className="p-6 rounded-full bg-white text-black shadow-xl shadow-white/10">
                       <Pause className="w-8 h-8" />
                   </button>
                   <button className="text-gray-500 transition">
                       <SkipForward className="w-7 h-7" />
                   </button>
                </div>

                {/* Secondary actions */}
                <div className="flex gap-8 w-full justify-center pt-8 border-t border-white/5">
                   <button className="flex items-center gap-2 text-sm font-bold text-gray-500">
                       <RefreshCcw className="w-4 h-4" /> Regenerate
                   </button>
                   <button className="flex items-center gap-2 text-sm font-bold text-gray-500">
                       <Volume2 className="w-4 h-4" /> Volume Level
                   </button>
                </div>
            </div>

            {/* Transcript Area */}
            <div className="mt-12 rounded-2xl border border-white/5 bg-[#0a0a0d] overflow-hidden">
                <button className="w-full p-5 flex items-center justify-between text-left text-sm font-bold text-gray-300">
                    <span>Live Transcript</span>
                    <ChevronDown className="w-4 h-4" />
                </button>
                <div className="p-5 pt-0 text-sm leading-8 font-medium">
                    <span className="text-emerald-400">"This project is a React and Next.js driven frontend paired with a FastAPI backend... It follows a layered monolith structure...</span>
                    <span className="text-gray-500"> Requests go from the UI to the Gateway to the Pinecone Vector DB... Core logic lives in the indexing modules... Potential bottleneck is the auth tightly coupled to the DB. Overall, it's suited for immediate deployment."</span>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
