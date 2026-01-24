"use client";

import { motion } from "framer-motion";
import { FolderGit2, Search, Plus, MoreVertical, GitCommit, Calendar, Clock, Github, AlertCircle, CheckCircle2 } from "lucide-react";

const repositories = [
  { 
    id: 1, 
    name: "kruth-s/AI-Code-Navigator", 
    status: "Indexed", 
    lastSynced: "Just now", 
    size: "24 MB", 
    language: "TypeScript",
    branch: "main" 
  },
  { 
    id: 2, 
    name: "kruth-s/legacy-backend", 
    status: "Indexing", 
    progress: 45,
    lastSynced: "2 mins ago", 
    size: "156 MB", 
    language: "Python",
    branch: "develop" 
  },
  { 
    id: 3, 
    name: "company/design-system", 
    status: "Error", 
    lastSynced: "1 day ago", 
    size: "45 MB", 
    language: "CSS",
    branch: "v2-beta" 
  },
];

export default function RepositoriesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="text-gray-400">Manage your connected codebases and indexing status.</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-violet-500/20">
          <Plus className="w-4 h-4" />
          Add Repository
        </button>
      </div>

      {/* Filter/Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search repositories..." 
            className="w-full bg-[#16141c] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 transition-all text-white placeholder:text-gray-600"
          />
        </div>
        <select className="bg-[#16141c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500/50">
          <option>All Statuses</option>
          <option>Indexed</option>
          <option>Indexing</option>
          <option>Errors</option>
        </select>
      </div>

      {/* Repository List */}
      <div className="grid gap-4">
        {repositories.map((repo, i) => (
          <motion.div 
            key={repo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#16141c] border border-white/5 rounded-xl p-6 hover:border-violet-500/30 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                   {repo.status === 'Indexing' ? (
                     <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <FolderGit2 className="w-6 h-6 text-gray-400 group-hover:text-violet-400 transition-colors" />
                   )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg text-white group-hover:text-violet-300 transition-colors">{repo.name}</h3>
                    <Badge status={repo.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><GitCommit className="w-3.5 h-3.5" /> {repo.branch}</span>
                    <span className="flex items-center gap-1"><Github className="w-3.5 h-3.5" /> {repo.language}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {repo.lastSynced}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {repo.status === 'Indexing' && (
               <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${repo.progress}%` }}></div>
               </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const styles = {
    Indexed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Indexing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Error: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  
  const icons = {
    Indexed: <CheckCircle2 className="w-3 h-3" />,
    Indexing: <Clock className="w-3 h-3 animate-pulse" />,
    Error: <AlertCircle className="w-3 h-3" />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${(styles as any)[status]}`}>
      {(icons as any)[status]}
      {status}
    </span>
  );
}
