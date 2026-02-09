"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, Search, Plus, MoreVertical, GitCommit, Calendar, Clock, Github, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

// const repositories = [
//   { 
//     id: 1, 
//     name: "kruth-s/AI-Code-Navigator", 
//     status: "Indexed", 
//     lastSynced: "Just now", 
//     size: "24 MB", 
//     language: "TypeScript",
//     branch: "main" 
//   },
//   ...
// ];


export default function RepositoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);

  const fetchRepos = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/repos');
        if (res.ok) {
            const data = await res.json();
            setRepositories(data);
        }
    } catch (e) {
        console.error("Failed to fetch repos", e);
    }
  };

  useEffect(() => {
    fetchRepos();
    // Poll every 5 seconds for status updates
    const interval = setInterval(fetchRepos, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="text-gray-400">Manage your connected codebases and indexing status.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
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
          <RepositoryCard key={repo.id} repo={repo} index={i} />
        ))}
      </div>
      <AddRepoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function RepositoryCard({ repo, index }: { repo: any, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
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

function AddRepoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url })
      });
      if (res.ok) {
        alert("Ingestion started! Check background logs.");
        onClose();
        setUrl("");
        // Trigger generic refresh if moved to context, but poll will catch it
      } else {
        alert("Failed to start ingestion.");
      }
    } catch (e) {
      alert("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (

  <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="relative w-full max-w-lg bg-[#16141c] border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4">Connect Repository</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Repository URL</label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    autoFocus
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-[#0f0f11] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {loading ? 'Ingesting...' : 'Connect'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

