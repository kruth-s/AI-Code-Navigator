"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, User, Play, ArrowUpRight, 
  Github, Database, Terminal, Code2, Cpu, Globe, 
  MessageSquare, Search, Layers, Zap, BookOpen,
  GitBranch, FileText, Lock
} from "lucide-react";

export default function LandingPage() {
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLanding(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black font-sans text-white selection:bg-violet-500/30">
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
      className="fixed inset-0 flex items-center justify-center bg-black z-50 overflow-hidden"
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="relative w-[150vw] h-[150vh] origin-center rotate-[-15deg] flex flex-col justify-center">
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
        className="flex gap-4 text-[23vh] font-black uppercase leading-none text-[#ffceb8]"
        initial={{ x: direction > 0 ? "-20%" : "0%" }}
        animate={{ x: direction > 0 ? "0%" : "-20%" }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="mx-2">
            NAVIGATE CODE
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function LandingContent() {
  return (
    <motion.div
      className="relative w-full flex flex-col bg-black min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Navbar />
      
      {/* Scrollable Content */}
      <div className="flex-1 w-full mx-auto max-w-[1400px] px-4 md:px-6 py-6 space-y-24 pb-20">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <WhySection />
        <ArchitectureSection />
        <StackSection />
      </div>

      <Footer />
    </motion.div>
  );
}

function Navbar() {
  return (
    <nav className="flex-none flex items-center justify-between px-6 py-6 w-full max-w-[1400px] mx-auto z-50 relative">
      <div className="flex items-center gap-2">
         <div className="bg-white text-black p-1 rounded-full"><div className="w-4 h-4 rounded-full bg-black"></div></div>
         <span className="font-bold text-xl tracking-tight text-white">AKAZA</span>
      </div>
      
      <div className="hidden md:flex items-center bg-zinc-900/50 backdrop-blur-md rounded-full px-1 py-1 border border-white/5 shadow-lg">
         <div className="flex items-center gap-1 px-4 text-[14px] font-medium text-gray-400">
           <Link href="#" className="hover:text-white px-3 py-2 transition-colors">Home</Link>
           <Link href="#how-it-works" className="hover:text-white px-3 py-2 transition-colors">How It Works</Link>
           <Link href="#demo" className="hover:text-white px-3 py-2 transition-colors">Demo</Link>
           <Link href="#" className="hover:text-white px-3 py-2 transition-colors">Docs</Link>
           <Link href="#" className="hover:text-white px-3 py-2 transition-colors flex items-center gap-1">
             <Github className="w-4 h-4" /> GitHub
           </Link>
         </div>
      </div>

      <div className="flex items-center gap-6">
         <Link href="/login" className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-all">
           Login
         </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <div 
      className="rounded-[40px] overflow-hidden relative min-h-[80vh] flex items-center"
      style={{
        background: "radial-gradient(ellipse at top right, #3b1d60 0%, #1c1a23 60%, #000000 100%)",
      }}
    >
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-20 pb-20 lg:py-0">
        <div className="space-y-8">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-300 text-xs font-medium"
          >
             <Zap className="w-3 h-3" />
             <span>AI-Powered Code Intelligence</span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tight text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Understand Any <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Codebase</span> in <br/>
            Seconds.
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-400 max-w-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
             AI-Code-Navigator lets developers query large codebases using natural language, powered by LLMs, vector search, and GitHub integration.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/signup" className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-200 transition-all hover:scale-105">
              <Github className="w-5 h-5" />
              Connect GitHub Repo
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white border border-white/10 hover:bg-white/5 transition-colors">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Right Content - Abstract Code Visual */}
        <div className="relative hidden lg:block h-full min-h-[500px]">
          <motion.div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 rounded-full blur-3xl"
             animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
             transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="relative z-10 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-w-md mx-auto"
          >
             <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                   <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-xs text-gray-500 ml-2 font-mono">auth_controller.py — AI Analysis</div>
             </div>
             <div className="p-6 font-mono text-sm space-y-4">
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-indigo-400" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-gray-300">Where is the JWT token generation handled?</p>
                   </div>
                </div>
                
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-emerald-400" />
                   </div>
                   <div className="space-y-3 w-full">
                      <p className="text-gray-300">I found the relevant logic in <span className="text-emerald-400">auth.service.ts</span>:</p>
                      <div className="bg-black/50 p-3 rounded border border-white/5 text-gray-400 overflow-x-auto">
                        <code className="block text-xs">
                           <span className="text-purple-400">def</span> <span className="text-blue-400">generate_token</span>(user):<br/>
                           &nbsp;&nbsp;payload = &#123;<br/>
                           &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">"sub"</span>: user.id,<br/>
                           &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">"exp"</span>: datetime.utcnow() + ...<br/>
                           &nbsp;&nbsp;&#125;<br/>
                           &nbsp;&nbsp;<span className="text-purple-400">return</span> jwt.encode(payload, SECRET)
                        </code>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    { icon: <Github className="w-6 h-6" />, title: "Connect Repository", desc: "One-click OAuth integration to select any repo or branch." },
    { icon: <Database className="w-6 h-6" />, title: "Index Codebase", desc: "Files are parsed into embeddings and stored in our vector DB." },
    { icon: <MessageSquare className="w-6 h-6" />, title: "Ask Questions", desc: "Query your code in plain English using our chat interface." },
    { icon: <ArrowUpRight className="w-6 h-6" />, title: "Get Answers", desc: "Receive context-aware explanations with linked code snippets." },
  ];

  return (
    <div id="how-it-works" className="py-12">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          How It Works
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          From connection to insight in four simple steps.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="relative group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="absolute -top-6 left-6 text-6xl font-black text-white/5 select-none">{i + 1}</div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    { title: "Natural Language Search", desc: "Ask questions instead of grepping thousands of files.", icon: <Search/> },
    { title: "Semantic Understanding", desc: "Finds relevant logic even if keywords don't match exactly.", icon: <Cpu/> },
    { title: "GitHub Integration", desc: "Auto-responds to questions inside Issues & Pull Requests.", icon: <GitBranch/> },
    { title: "Large Repo Support", desc: "Scales to monorepos and enterprise codebases effortlessly.", icon: <Layers/> },
    { title: "Secure & Private", desc: "Your code is indexed locally or in private cloud instances.", icon: <Lock/> },
    { title: "Context-Aware", desc: "Understands imports, call graphs, and definitions.", icon: <FileText/> },
  ];

  return (
    <div className="py-12">
      <div className="mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Features built for<br/>modern engineering.</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="p-8 rounded-3xl bg-[#0f0f11] border border-white/5 hover:border-violet-500/30 transition-all group">
            <div className="mb-6 opacity-60 group-hover:opacity-100 group-hover:text-violet-400 transition-all">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhySection() {
  const personas = [
    { title: "Developers", desc: "Onboard to new codebases in days, not weeks. Understand legacy logic instantly." },
    { title: "Engineering Leads", desc: "Reduce knowledge silos. Ensure team members can navigate any part of the stack." },
    { title: "Maintainers", desc: "Auto-answer specialized contributor questions without repetitive context switching." },
  ];

  return (
    <div className="py-12 flex flex-col md:flex-row gap-12 border-t border-white/5 pt-24">
       <div className="md:w-1/3">
          <h2 className="text-3xl font-bold mb-4">Who is this for?</h2>
          <p className="text-gray-400">
             Whether you're debugging solo or managing a massive org, Akaza simplifies complexity.
          </p>
       </div>
       <div className="md:w-2/3 grid gap-4">
          {personas.map((p, i) => (
             <div key={i} className="p-6 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
                <h3 className="text-lg font-semibold min-w-[150px] text-violet-200">{p.title}</h3>
                <p className="text-gray-400 text-sm">{p.desc}</p>
             </div>
          ))}
       </div>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div className="py-12 text-center">
       <div className="inline-block px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
         UNDER THE HOOD
       </div>
       <h2 className="text-3xl md:text-4xl font-bold mb-12">Built on robust architecture</h2>
       
       <div className="relative p-8 md:p-12 rounded-[40px] bg-zinc-900 border border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          
          <div className="relative z-10 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm md:text-base font-semibold text-gray-300">
             <div className="px-6 py-4 rounded-xl bg-black border border-white/10 shadow-lg">Git Repository</div>
             <ArrowRight className="w-4 h-4 text-gray-500" />
             <div className="px-6 py-4 rounded-xl bg-black border border-white/10 shadow-lg">Parser</div>
             <ArrowRight className="w-4 h-4 text-gray-500" />
             <div className="px-6 py-4 rounded-xl bg-violet-900/20 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.1)] text-violet-200">
                Vector DB (Pinecone)
             </div>
             <ArrowRight className="w-4 h-4 text-gray-500" />
             <div className="px-6 py-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)] text-indigo-200">
                LLM Reasoning
             </div>
             <ArrowRight className="w-4 h-4 text-gray-500" />
             <div className="px-6 py-4 rounded-xl bg-white text-black border border-white/10 shadow-lg">Insight</div>
          </div>
          
          <p className="mt-12 text-gray-500 max-w-xl mx-auto text-sm">
             We process your code into semantic embeddings, allowing our LLM to retrieve exactly the right context to answer your queries accurately.
          </p>
       </div>
    </div>
  );
}

function StackSection() {
  const stack = ["Python", "FastAPI", "Pinecone", "OpenAI", "React", "TypeScript", "Tailwind"];
  return (
     <div className="py-12 border-t border-white/5">
        <p className="text-center text-sm text-gray-500 mb-8 font-medium tracking-wide">POWERED BY MODERN STACK</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {stack.map((tech) => (
              <span key={tech} className="text-xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{tech}</span>
           ))}
        </div>
     </div>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-zinc-950 border-t border-white/5 py-12 px-6">
       <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
             <span className="font-bold text-xl text-white">AKAZA</span>
             <p className="text-gray-500 text-sm">Built for developers, by developers.</p>
          </div>
          
          <div>
             <h4 className="font-semibold text-white mb-4">Product</h4>
             <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="font-semibold text-white mb-4">Resources</h4>
             <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Docs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="font-semibold text-white mb-4">Company</h4>
             <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
             </ul>
          </div>
       </div>
       <div className="max-w-[1400px] mx-auto mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-xs text-gray-600">
          <p>© 2026 Akaza Inc. All rights reserved.</p>
          <div className="flex gap-4">
             <Link href="#" className="hover:text-gray-400">Privacy</Link>
             <Link href="#" className="hover:text-gray-400">Terms</Link>
          </div>
       </div>
    </footer>
  );
}
