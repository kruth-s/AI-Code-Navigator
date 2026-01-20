"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, User, Menu, Play } from "lucide-react";

export default function LandingPage() {
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLanding(true);
    }, 1500); // 1 second as requested

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden font-sans text-white">
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
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
           <div className="bg-black text-white p-1 rounded-sm"><div className="w-4 h-4 bg-white"></div></div>
           <span className="font-bold text-xl tracking-tight text-slate-900">Marketeam</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link href="#" className="hover:text-black transition-colors">Your Team</Link>
          <Link href="#" className="hover:text-black transition-colors">Solutions</Link>
          <Link href="#" className="hover:text-black transition-colors">Blog</Link>
          <Link href="#" className="hover:text-black transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-6">
           <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-black transition-colors">Log In</Link>
           <Link href="/signup" className="px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-black transition-all text-sm font-medium shadow-lg shadow-purple-900/20">
             Join Now
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
          
          <motion.div 
            className="flex items-center gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
             <button className="group flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 border border-white/10 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all">
               <span className="text-white font-medium">Start Project</span>
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
             
             {/* Floating UI Element hinting 'David' */}
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#7c3aed] rounded-full text-xs font-medium shadow-lg rotate-[15deg] translate-y-8">
               <span>David</span>
               <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-[#7c3aed] absolute -top-2 left-2 rotate-180"></div>
             </div>
          </motion.div>
        </div>

        {/* Right Column - Orbital Visualization */}
        <div className="relative h-[500px] w-full flex items-center justify-center">
           <OrbitalSystem />
        </div>
      </div>

      {/* Footer Branding Strip */}
      <div className="absolute bottom-0 w-full border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2"><span className="text-xl font-bold">Dreamure</span></div>
           <div className="flex items-center gap-2"><span className="text-xl font-bold">SWITCH.WIN</span></div>
           <div className="flex items-center gap-2"><span className="text-xl font-bold">glowsphere</span></div>
           <div className="flex items-center gap-2"><span className="text-xl font-bold">PinSpace</span></div>
           <div className="flex items-center gap-2"><span className="text-xl font-bold">Visionix</span></div>
        </div>
      </div>
    </motion.div>
  );
}

function OrbitalSystem() {
  return (
    <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
       {/* Center Text */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
         <h3 className="text-4xl font-bold tracking-tighter">20k+</h3>
         <p className="text-sm text-zinc-400">Specialists</p>
       </div>

       {/* Rings */}
       <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_60s_linear_infinite]" />
       <div className="absolute inset-[50px] rounded-full border border-white/5 animate-[spin_40s_linear_infinite_reverse]" />
       <div className="absolute inset-[100px] rounded-full border border-white/5 animate-[spin_30s_linear_infinite]" />

       {/* Orbiting Avatars (simulated with Framer Motion) */}
       {/* Explicitly placing them for visual effect rather than complex math for now */}
       
       {/* Outer Ring Avatars */}
       <FloatingAvatar className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" img="/placeholder" color="bg-blue-500" />
       <FloatingAvatar className="absolute bottom-[20%] right-0 translate-x-1/2" img="/placeholder" color="bg-pink-500" delay={2} />
       <FloatingAvatar className="absolute top-[30%] left-0 -translate-x-1/2" img="/placeholder" color="bg-orange-500" delay={4} />

       {/* Inner Ring Avatars */}
       <FloatingAvatar className="absolute top-[20%] right-[20%]" img="/placeholder" color="bg-violet-500" size="sm" delay={1} />
       <FloatingAvatar className="absolute bottom-[20%] left-[20%]" img="/placeholder" color="bg-emerald-500" size="sm" delay={3} />
       
       <div className="absolute top-[10%] right-[10%] p-3 rounded-2xl bg-black border border-white/10 shadow-2xl shadow-blue-500/20">
         <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
         </div>
       </div>
    </div>
  );
}

function FloatingAvatar({ className, color, size = "md", delay = 0 }: { className?: string; color: string; size?: "sm" | "md"; img: string; delay?: number }) {
  const sizeClasses = size === "md" ? "w-12 h-12" : "w-10 h-10";
  
  return (
    <motion.div 
      className={`${className} ${sizeClasses} rounded-full ${color} p-0.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center overflow-hidden border border-white/20`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <User className="text-white w-2/3 h-2/3" />
    </motion.div>
  );
}
