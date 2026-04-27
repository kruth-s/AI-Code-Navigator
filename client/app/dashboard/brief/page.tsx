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
  AlertCircle,
  FileText
} from "lucide-react";
import { useRepository } from "@/lib/RepositoryContext";
import CustomDropdown from "@/components/CustomDropdown";

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

  const words = briefData?.transcript.split(" ") || [];
  const currentWordIndex = Math.floor((progress / 100) * words.length);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Immersive Background Elements */}
      <motion.div 
        animate={isPlaying ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        } : {}}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" 
      />
      <motion.div 
        animate={isPlaying ? {
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        } : {}}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none -z-10" 
      />

      <div className="flex-1 flex flex-col min-h-0 space-y-6">
        {/* Header Section */}
        <div className="flex items-end justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              <div className="w-8 h-[1px] bg-emerald-500/40" />
              Intelligence Suite / 60s Brief
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white leading-none">
              {briefData?.repo_name || selectedRepo.name}
            </h1>
          </div>
          <div className="flex gap-2">
            {(briefData?.tech_stack || [selectedRepo.language]).map((t, i) => (
              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content Hub */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
          
          {/* Left Panel: Audio Control & Visuals */}
          <motion.div 
            className="lg:col-span-4 flex flex-col p-10 rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-sm relative overflow-hidden group shadow-2xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Visualizer Circle */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
               <div className="relative w-56 h-56 flex items-center justify-center">
                  {/* Outer Rings */}
                  <motion.div 
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-emerald-500/20 rounded-full"
                  />
                  <motion.div 
                    animate={isPlaying ? { rotate: -360 } : {}}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-25px] border border-white/5 rounded-full"
                  />
                  
                  {/* Play Button Core */}
                  <button 
                    onClick={handlePlayPause}
                    className="relative z-10 w-28 h-28 rounded-full bg-white text-black flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all group/play"
                  >
                    <AnimatePresence mode="wait">
                      {isPlaying ? (
                        <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Pause className="w-10 h-10 fill-current" />
                        </motion.div>
                      ) : (
                        <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Play className="w-10 h-10 fill-current translate-x-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
               </div>
               
               <div className="mt-14 text-center space-y-2">
                  <div className="text-3xl font-black text-white">{progress.toFixed(0)}%</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transcript Progress</div>
               </div>
            </div>

            {/* Bottom Controls */}
            <div className="mt-auto space-y-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <button onClick={handleReset} className="p-4 rounded-2xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white border border-transparent hover:border-white/5">
                    <RefreshCcw className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-6">
                    <SkipBack className="w-8 h-8 text-gray-600 cursor-not-allowed" />
                    <SkipForward className="w-8 h-8 text-gray-600 cursor-not-allowed" />
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Headphones className="w-6 h-6" />
                  </div>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
            </div>
          </motion.div>

          {/* Right Panel: Settings & Transcript */}
          <div className="lg:col-span-8 flex flex-col space-y-8 min-h-0">
            
            {/* Settings Bar */}
            <motion.div 
              className="p-8 rounded-[2rem] border border-white/5 bg-black/20 flex flex-wrap items-center gap-10 shrink-0 shadow-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Rocket className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Audience</div>
                  <div className="w-56 pt-1">
                    <CustomDropdown 
                      options={["Senior Engineer", "Non-Tech Manager", "Venture Capitalist", "Beginner Dev"]} 
                      selected={audience} 
                      setSelected={setAudience} 
                      accentClass="text-indigo-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Script Tone</div>
                  <div className="w-56 pt-1">
                    <CustomDropdown 
                      options={["Energetic", "Professional", "Sarcastic", "Mysterious"]} 
                      selected={tone} 
                      setSelected={setTone} 
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={fetchBrief}
                disabled={loading}
                className="ml-auto px-8 py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-gray-200 transition-all flex items-center gap-3 shadow-2xl shadow-white/10 active:scale-95"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Update Script
              </button>
            </motion.div>

            {/* Transcript Card */}
            <motion.div 
              className="flex-1 rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col min-h-0 relative group shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-10 pb-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                      <FileText className="w-5 h-5 text-emerald-400" />
                   </div>
                   <h3 className="text-xl font-bold text-white tracking-tight">AI Generated Transcript</h3>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
                   {briefData?.estimated_word_count || 0} Words / ~60 Seconds
                </div>
              </div>

              <div className="flex-1 p-10 pt-0 overflow-y-auto custom-scrollbar relative">
                <AnimatePresence mode="wait">
                  {briefData ? (
                    <motion.div
                      key={briefData.transcript}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl md:text-3xl lg:text-4xl leading-[1.6] font-bold"
                    >
                       <div className="flex flex-wrap gap-x-3 gap-y-2">
                        {words.map((word, idx) => {
                          const isHighlighted = idx <= currentWordIndex;
                          const isCurrent = idx === currentWordIndex;
                          
                          return (
                            <motion.span
                              key={idx}
                              animate={{
                                color: isHighlighted ? "#ffffff" : "#4b5563",
                                scale: isCurrent ? 1.05 : 1,
                                opacity: isHighlighted ? 1 : 0.3
                              }}
                              transition={{ duration: 0.2 }}
                              className="inline-block transition-all origin-left"
                            >
                              {word}
                            </motion.span>
                          );
                        })}
                       </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-6">
                       <Loader2 className="w-12 h-12 animate-spin text-emerald-500/40" />
                       <p className="text-lg font-medium tracking-tight">Synthesizing codebase patterns...</p>
                    </div>
                  )}
                </AnimatePresence>
                
                {/* Bottom Gradient Fade */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
