"use client";

import { motion } from "framer-motion";
import { Plus, Github, ArrowRight, Loader2, GitBranch, Database, FileText } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function DashboardPage() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGithub = async () => {
    setIsConnecting(true);
    try {
      await signIn("github");
    } catch (error) {
      console.error("GitHub connection failed", error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight"
          >
            Welcome, Developer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            Select a repository to start analyzing your codebase.
          </motion.p>
        </div>
        
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
        >
          <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-lg shadow-white/5">
            <Plus className="w-4 h-4" />
            Add New Project
          </button>
        </motion.div>
      </div>

      {/* Empty State / Connect Repo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/5 bg-[#16141c] overflow-hidden relative group"
      >
         <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
         
         <div className="p-12 flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
               <Github className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-3">Connect a Repository</h2>
            <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
              Import a public or private repository to begin indexing. We support GitHub, GitLab, and Bitbucket.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
               <button 
                 onClick={handleConnectGithub}
                 className="flex-1 flex items-center justify-center gap-2 h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-all active:scale-95"
               >
                 {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                 Connect GitHub
               </button>
               <button className="flex-1 flex items-center justify-center gap-2 h-11 border border-white/10 hover:bg-white/5 text-white rounded-lg font-medium transition-colors">
                 Import Manually
               </button>
            </div>
         </div>
      </motion.div>

      {/* Recent Activity Grid */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-300">Recent Activity</h3>
        <div className="grid md:grid-cols-3 gap-6">
           {/* Mock Card 1 */}
           <ActivityCard 
             title="auth-service"
             subtitle="Updated 2h ago"
             status="Indexed"
             icon={<Database className="w-5 h-5 text-emerald-400" />}
             delay={0.4}
           />
           {/* Mock Card 2 */}
           <ActivityCard 
             title="frontend-v2"
             subtitle="Indexing... 85%"
             status="Processing"
             icon={<Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
             delay={0.5}
           />
           {/* Mock Card 3 */}
           <ActivityCard 
             title="legacy-api"
             subtitle="Updated yesterday"
             status="Indexed"
             icon={<FileText className="w-5 h-5 text-violet-400" />}
             delay={0.6}
           />
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ title, subtitle, status, icon, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-xl bg-[#16141c] border border-white/5 hover:border-violet-500/20 transition-all cursor-pointer group"
    >
       <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
             {icon}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border ${
            status === 'Indexed' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
             {status}
          </span>
       </div>
       <h4 className="font-semibold text-white mb-1">{title}</h4>
       <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{subtitle}</span>
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
       </div>
    </motion.div>
  );
}
