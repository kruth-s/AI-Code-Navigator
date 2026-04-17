"use client";

import { useState, useEffect, useRef } from "react";
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
  Rocket,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRepository } from "@/lib/RepositoryContext";

interface BriefData {
  repo_name: string;
  tech_stack: string[];
  transcript: string;
  duration_seconds: number;
  estimated_word_count: number;
}

export default function RepoBriefPage() {
  const { selectedRepo } = useRepository();
  const [loading, setLoading] = useState(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audience, setAudience] = useState("Senior Engineer");
  const [tone, setTone] = useState("Energetic");
  const [showTranscript, setShowTranscript] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio synthesis refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBrief = async () => {
    if (!selectedRepo) return;
    
    setLoading(true);
    setError(null);
    setBriefData(null);
    setIsPlaying(false);
    setProgress(0);
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/brief/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_name: selectedRepo.name,
          audience,
          tone
        })
      });
      
      if (!res.ok) throw new Error("Failed to generate brief");
      
      const data = await res.json();
      setBriefData(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong</strong>");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRepo && !briefData && !loading) {
      fetchBrief();
    }
    
    return () => {
      window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedRepo]);

  const handlePlayPause = () => {
    if (!briefData) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(briefData.transcript);
        
        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
          if (timerRef.current) clearInterval(timerRef.current);
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
      
      setIsPlaying(true);
      
      // Track progress roughly
      if (timerRef.current) clearInterval(timerRef.current);
      const totalWords = briefData.transcript.split(" ").length;
      let wordsSpoken = 0;
      
      timerRef.current = setInterval(() => {
        if (!window.speechSynthesis.speaking || window.speechSynthesis.paused) return;
        
        // This is a very rough estimation since utterance.onboundary doesn't always work reliably in all browsers
        setProgress(prev => Math.min(prev + (100 / (briefData.duration_seconds * 10)), 99.9));
      }, 100);
    }
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
  };

  if (!selectedRepo) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="p-6 bg-amber-500/10 rounded-full mb-6 border border-amber-500/20">
            <AlertCircle className="w-12 h-12 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Repository Selected</h2>
        <p className="text-gray-400 max-w-md">Please select a repository from the sidebar to generate a 60-second brief.</p>
      </div>
    );
  }

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
          AI-generated audio summary of <span className="text-emerald-400 font-bold">{selectedRepo.name}</span>.
        </p>
      </div>

      <motion.div 
        className="rounded-3xl border relative overflow-hidden bg-black/40 flex-1 max-h-[650px] flex flex-col"
        style={{ borderColor: "var(--border-primary)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-black/60 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-white">Generating Brief...</h3>
              <p className="text-gray-400 text-sm mt-2">Analyzing architecture and core modules</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div 
              className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-black/60 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="p-4 bg-red-500/20 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Oops! Creation Failed</h3>
              <p className="text-gray-400 text-sm mt-2 mb-6">{error}</p>
              <button 
                onClick={fetchBrief}
                className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Repo Info Header */}
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-white/5 text-center">
                <span className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-2">Live Analysis</span>
                <h2 className="text-3xl font-black text-white mb-4">{briefData?.repo_name || selectedRepo.name}</h2>
                <div className="flex flex-wrap justify-center gap-2">
                    {(briefData?.tech_stack || [selectedRepo.language, "Source Code", "Repository"]).map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Config Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Audience:</span>
                    <select 
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-xs font-medium text-white appearance-none outline-none focus:border-emerald-500/50 transition w-full md:w-40"
                    >
                        <option value="Senior Engineer">Senior Engineer</option>
                        <option value="Non-Tech Manager">Non-Tech Manager</option>
                        <option value="Venture Capitalist">VC / Investor</option>
                        <option value="Beginner Developer">Beginner Dev</option>
                    </select>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Tone:</span>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-xs font-medium text-white appearance-none outline-none focus:border-emerald-500/50 transition w-full md:w-40"
                    >
                        <option value="Energetic">Energetic</option>
                        <option value="Professional">Professional</option>
                        <option value="Sarcastic">Sarcastic</option>
                        <option value="Mysterious">Mysterious</option>
                    </select>
                </div>
                <button 
                  onClick={fetchBrief}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-black rounded-lg transition border border-emerald-500/20"
                >
                  <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Update
                </button>
            </div>

            {/* Audio Player Core */}
            <div className="flex flex-col items-center max-w-2xl mx-auto w-full space-y-8 py-4">
                {/* Visualizer (Fake Waves) */}
                <div className="w-full flex items-end justify-center gap-1.5 h-12">
                   {[...Array(30)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        className={`w-1.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-gray-600'}`}
                        animate={isPlaying ? { 
                          height: [10, Math.random() * 40 + 10, 10],
                          opacity: [0.5, 1, 0.5]
                        } : { height: 10, opacity: 0.3 }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 0.5 + Math.random(),
                          ease: "easeInOut"
                        }}
                      />
                   ))}
                </div>

                {/* Progress Bar */}
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 font-mono">
                        <span className="text-emerald-400">{Math.floor((progress/100) * 60)}s</span>
                        <span>{briefData?.duration_seconds || 60}s</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5 group cursor-pointer relative"
                         onClick={(e) => {
                           const rect = e.currentTarget.getBoundingClientRect();
                           const x = e.clientX - rect.left;
                           const clickedProgress = (x / rect.width) * 100;
                           setProgress(clickedProgress);
                           // Seek logic would go here if using HTML5 Audio
                         }}
                    >
                        <motion.div 
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]" 
                          style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8">
                   <button 
                    onClick={handleReset}
                    className="text-gray-500 hover:text-white transition"
                   >
                       <SkipBack className="w-6 h-6" />
                   </button>
                   <button 
                    onClick={handlePlayPause}
                    className="p-5 rounded-full bg-white text-black shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition"
                   >
                       {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current translate-x-0.5" />}
                   </button>
                   <button className="text-gray-500 hover:text-white transition opacity-50 cursor-not-allowed">
                       <SkipForward className="w-6 h-6" />
                   </button>
                </div>
            </div>

            {/* Transcript Area */}
            {briefData && (
              <div className="mt-8 rounded-2xl border border-white/5 bg-[#0a0a0d] overflow-hidden">
                  <button 
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-gray-400 hover:bg-white/5 transition"
                  >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        AI GENERATED TRANSCRIPT
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showTranscript ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showTranscript && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-6 text-sm leading-7 font-medium text-gray-300"
                      >
                          <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 italic">
                             "{briefData.transcript}"
                          </div>
                          <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                             <span>Estimated Reading Time: 58 seconds</span>
                             <span>Word Count: {briefData.estimated_word_count}</span>
                          </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            )}
        </div>
      </motion.div>
      
      {/* Visual background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
