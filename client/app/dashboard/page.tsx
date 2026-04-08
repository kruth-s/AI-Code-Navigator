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
            style={{ color: 'var(--text-primary)' }}
          >
            Welcome, Developer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'var(--text-secondary)' }}
          >
            Select a repository to start analyzing your codebase.
          </motion.p>
        </div>
        
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
        >
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
            }}
          >
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
        className="rounded-2xl overflow-hidden relative group"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-primary)' }}
      >
         <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
         
         <div className="p-12 flex flex-col items-center text-center relative z-10">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-secondary)' }}
            >
               <Github className="w-10 h-10" style={{ color: 'var(--text-primary)' }} />
            </div>
            
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Connect a Repository</h2>
            <p className="max-w-md mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Import a public or private repository to begin indexing. We support GitHub, GitLab, and Bitbucket.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
               <button 
                 onClick={handleConnectGithub}
                 className="flex-1 flex items-center justify-center gap-2 h-11 text-white rounded-lg font-medium transition-all active:scale-95"
                 style={{ backgroundColor: 'var(--accent)' }}
               >
                 {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                 Connect GitHub
               </button>
               <button
                 className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg font-medium transition-colors"
                 style={{ border: '1px solid var(--border-secondary)', color: 'var(--text-primary)' }}
               >
                 Import Manually
               </button>
            </div>
         </div>
      </motion.div>

      {/* Recent Activity Grid */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Recent Activity</h3>
        <div className="grid md:grid-cols-3 gap-6">
           <ActivityCard 
             title="auth-service"
             subtitle="Updated 2h ago"
             status="Indexed"
             icon={<Database className="w-5 h-5 text-emerald-400" />}
             delay={0.4}
           />
           <ActivityCard 
             title="frontend-v2"
             subtitle="Indexing... 85%"
             status="Processing"
             icon={<Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
             delay={0.5}
           />
           <ActivityCard 
             title="legacy-api"
             subtitle="Updated yesterday"
             status="Indexed"
             icon={<FileText className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />}
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
      className="p-5 rounded-xl transition-all cursor-pointer group"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-primary)',
      }}
    >
       <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-hover)' }}>
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
       <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h4>
       <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>{subtitle}</span>
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
       </div>
    </motion.div>
  );
}
