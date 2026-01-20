"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, User, Menu, Play, Shield, ArrowUpRight } from "lucide-react";

export default function LandingPage() {
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLanding(true);
    }, 1500); // 1 second as requested

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans text-white scrollbar-hide">
      <AnimatePresence mode="wait">
        {!showLanding ? (
          <IntroAnimation key="intro" />
        ) : (
          <LandingContent key="landing" />
        )}
      </AnimatePresence>
    </div>
  );
}

function IntroAnimation() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black z-50 overflow-hidden"
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="relative w-[250vw] h-[250vh] origin-center rotate-[-15deg] flex flex-col justify-center">
        {/* Generates multiple rows of marquee text */}
        {Array.from({ length: 4 }).map((_, i) => (
          <MarqueeRow key={i} direction={i % 2 === 0 ? 1 : -1} speed={i % 2 === 0 ? 25 : 18} />
        ))}
      </div>
    </motion.div>
  );
}

function MarqueeRow({ direction, speed }: { direction: number; speed: number }) {
  return (
    <div className="flex w-full overflow-hidden whitespace-nowrap -my-4">
      <motion.div
        className="flex gap-4 text-[33vh] font-black uppercase leading-none text-[#ffceb8]"
        initial={{ x: direction > 0 ? "-20%" : "0%" }}
        animate={{ x: direction > 0 ? "0%" : "-20%" }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="mx-2">
          THE WEEKND 
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function LandingContent() {
  return (
    <motion.div
      className="relative min-h-screen w-full"
      style={{
        background: "radial-gradient(ellipse at top left, #ffdec7 0%, #3b1d60 40%, #000000 100%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Navbar */}
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full z-50 relative">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
            <div className="bg-white text-black p-1 rounded-full"><div className="w-4 h-4 rounded-full bg-black"></div></div>
           <span className="font-bold text-xl tracking-tight text-white">AKAZA</span>
        </div>
        
        {/* Center: Floating Pill Nav */}
        <div className="hidden md:flex items-center bg-white/10 backdrop-blur-md rounded-full px-1 py-1 border border-white/10 shadow-lg">
           <div className="flex items-center gap-1 px-4 text-[13px] font-medium text-gray-300">
             <Link href="#" className="hover:text-white px-3 py-2 transition-colors">Home</Link>
             <Link href="#" className="hover:text-white px-3 py-2 transition-colors">DeFi App</Link>
             <Link href="#" className="hover:text-white px-3 py-2 transition-colors">Assets</Link>
             <Link href="#" className="hover:text-white px-3 py-2 transition-colors">Features</Link>
             <Link href="#" className="hover:text-white px-3 py-2 transition-colors">Pricing</Link>
             <Link href="#" className="hover:text-white px-3 py-2 transition-colors">FAQ</Link>
           </div>
           
           <div className="flex items-center gap-2 pl-2 pr-1 border-l border-white/10 ml-2">
              <span className="text-[13px] font-medium text-gray-300 pl-2 cursor-pointer hover:text-white flex items-center gap-1">
                Protection <ArrowUpRight className="w-3 h-3" />
              </span>
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                 <Shield className="w-4 h-4 fill-current" />
              </div>
           </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
           <Link href="/signup" className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
             <User className="w-5 h-5" />
             Create Account
           </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="space-y-8">
          <motion.h1 
            className="text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tight text-slate-900"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Unlock Top <br/>
            Marketing Talent <br/>
            You Thought Was <br/>
            Out of Reach — <br/>
            Now Just One <br/>
            Click Away!
          </motion.h1>


        </div>

        {/* Right Content - Abstract Visuals */}
        <div className="relative hidden lg:block">
          <motion.div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-300/30 to-orange-300/30 rounded-full blur-3xl"
             animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative z-20 mb-8 flex flex-wrap gap-4 justify-center"
          >
            <Link href="/signup" className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-medium hover:bg-black transition-all hover:scale-105">
              Start Hiring <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 rounded-full font-medium text-slate-700 hover:text-black transition-colors">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </motion.div>

          <div className="relative z-10 p-8 rounded-2xl border border-white/20 shadow-xl bg-white/10 backdrop-blur-md">
             {/* Simple dashboard mock */}
             <div className="space-y-4">
                <div className="h-8 w-1/3 bg-slate-200/50 rounded animate-pulse" />
                <div className="h-32 w-full bg-slate-200/30 rounded animate-pulse" />
                <div className="flex gap-4">
                   <div className="h-10 w-full bg-slate-200/30 rounded animate-pulse" />
                   <div className="h-10 w-full bg-slate-200/30 rounded animate-pulse" />
                </div>
             </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
