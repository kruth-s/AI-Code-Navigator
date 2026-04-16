"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2,
  Search,
  Plus,
  Github,
  CheckCircle2,
  RefreshCw,
  Star,
  Globe,
  Lock,
  Trash2,
  Loader2,
  Clock,
  AlertCircle,
  GitCommit
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRepository } from "@/lib/RepositoryContext";
import { useRouter } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface GithubRepo {
  id: string;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  is_connected: boolean;
}

interface ConnectedRepo {
  id: string;
  name: string;
  github_id: string | null;
  description: string | null;
  html_url: string | null;
  private: boolean;
  is_indexed: boolean;
  indexed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function RepositoriesPage() {
  const router = useRouter();
  const { repositories, fetchRepositories, setSelectedRepo } = useRepository();
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<ConnectedRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"available" | "connected" | "indexed">("available");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const fetchGithubRepos = useCallback(
    async (showRefreshing = false) => {
      if (!userId) return;
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const url = `${BACKEND_URL}/api/github/repos/list?user_id=${userId}`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setGithubRepos(data.repositories || []);
        } else if (res.status === 401) {
          // Token might be expired or missing
          console.error("Authentication expired or GitHub not connected");
          setGithubRepos([]);
        } else {
          console.error("Failed to fetch GitHub repos:", await res.text());
        }
      } catch (e: any) {
        console.error("Network error fetching repos:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId],
  );

  const fetchConnectedRepos = useCallback(async () => {
    if (!userId) return;
    try {
      const url = `${BACKEND_URL}/api/users/${userId}/repositories`;
      const res = await fetch(url);
      let data = [];
      if (res.ok) {
        data = await res.json();
      }

      // Merge globally ingested repos (like Fider)
      try {
        const jsonRes = await fetch(`${BACKEND_URL}/api/repos`);
        if (jsonRes.ok) {
          const jsonRepos = await jsonRes.json();
          jsonRepos.forEach((jr: any) => {
            if (!data.find((r: any) => r.name === jr.name)) {
              data.push({
                id: jr.id,
                name: jr.name,
                github_id: null,
                description: "Manually imported",
                html_url: jr.url,
                private: false,
                is_indexed: jr.status === "Indexed" || jr.status === "Indexing",
                indexed_at: jr.lastSynced,
                created_at: jr.lastSynced,
                updated_at: jr.lastSynced,
              });
            }
          });
        }
      } catch(e) {}

      setConnectedRepos(data);
    } catch (e) {
      console.error("Error fetching connected repos:", e);
      setConnectedRepos([]);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchGithubRepos();
      fetchConnectedRepos();
      fetchRepositories();
    }
  }, [userId, fetchGithubRepos, fetchConnectedRepos, fetchRepositories]);

  const handleConnect = async (repo: GithubRepo) => {
    if (!userId) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/github/repos/connect/${repo.id}?user_id=${userId}`,
        { method: "POST" },
      );
      if (res.ok) {
        // Fire off the ingestion task to start indexing into Pinecone immediately!
        try {
          await fetch(`${BACKEND_URL}/api/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo_url: repo.html_url })
          });
        } catch(e) {
          console.error("Failed to trigger indexing", e);
        }
        
        await fetchGithubRepos();
        await fetchConnectedRepos();
        await fetchRepositories();
        
        // Switch to the Indexed tab so user can see it processing
        setActiveTab("indexed");
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to connect repository");
      }
    } catch (e) {
      alert("Error connecting to backend");
    }
  };

  const handleDisconnect = async (repoDbId: string) => {
    if (!userId) return;
    if (!confirm("Disconnect this repository?")) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/github/repos/disconnect/${repoDbId}?user_id=${userId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        await fetchGithubRepos();
        await fetchConnectedRepos();
        await fetchRepositories();
      }
    } catch (e) {
      alert("Error disconnecting repository");
    }
  };

  const handleChat = (repo: ConnectedRepo) => {
    if (!repo.is_indexed) return;
    setSelectedRepo({
      id: repo.id,
      name: repo.name,
      url: repo.html_url || "",
      status: repo.is_indexed ? "Indexed" : "Pending",
      lastSynced: repo.updated_at || "",
      branch: "main",
      language: "Unknown",
    });
    router.push("/dashboard/chat");
  };

  const filteredGithub = githubRepos.filter((r) =>
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredConnected = connectedRepos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredIndexed = connectedRepos.filter(
    (r) =>
      r.is_indexed && r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="text-gray-400">
            Manage your connected codebases ({repositories.filter(r => r.status === 'Indexed').length}/5 indexed)
          </p>
        </div>
        <div className="flex gap-2">
          {repositories.filter(r => r.status === 'Indexed').length >= 5 && (
            <button 
              onClick={async () => {
                if (confirm('Clear all repositories? This will delete all indexed data.')) {
                  try {
                    await fetch(`${BACKEND_URL}/api/repos/clear-all`, { method: 'POST' });
                    fetchRepositories();
                  } catch (error) {
                    alert('Failed to clear repositories');
                  }
                }
              }}
              className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={repositories.filter(r => r.status === 'Indexed').length >= 5}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-lg ${
              repositories.filter(r => r.status === 'Indexed').length >= 5
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20'
            }`}
          >
             Connect Manually
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-[#16141c] rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => setActiveTab('available')} 
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'available' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Available
            </button>
            <button 
              onClick={() => setActiveTab('connected')} 
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'connected' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Connected
            </button>
            <button 
              onClick={() => setActiveTab('indexed')} 
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'indexed' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Indexed
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..." 
              className="w-full bg-[#16141c] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500/50 transition-all text-white placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Repository List */}
      <div className="min-h-[400px]">
        {activeTab === "available" && (
          loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : filteredGithub.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Github className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No available repositories found</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredGithub.map((repo, i) => (
                <GithubRepoCard
                  key={repo.id}
                  repo={repo}
                  onConnect={handleConnect}
                  delay={i * 0.03}
                />
              ))}
            </div>
          )
        )}
        
        {activeTab === "indexed" && (
          filteredIndexed.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No indexed repositories</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredIndexed.map((repo, i) => (
                <ConnectedRepoCard
                  key={repo.id}
                  repo={repo}
                  onChat={handleChat}
                  onDisconnect={handleDisconnect}
                  delay={i * 0.03}
                />
              ))}
            </div>
          )
        )}

        {activeTab === "connected" && (
          filteredConnected.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FolderGit2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No connected repositories</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredConnected.map((repo, i) => (
                <ConnectedRepoCard
                  key={repo.id}
                  repo={repo}
                  onChat={handleChat}
                  onDisconnect={handleDisconnect}
                  delay={i * 0.03}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal is rendered outside the lists */}
      <AddRepoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function GithubRepoCard({
  repo,
  onConnect,
  delay,
}: {
  repo: GithubRepo;
  onConnect: (repo: GithubRepo) => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-[#16141c] border border-white/5 rounded-xl p-6 transition-all group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
            <Github className="w-6 h-6 text-gray-400 group-hover:text-violet-400 transition-colors" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-lg text-white group-hover:text-violet-300 transition-colors">{repo.name}</h3>
            </div>
            {repo.description && (
              <p className="text-sm text-gray-500 mb-2 truncate max-w-sm">{repo.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              {repo.language && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {repo.stargazers_count}
              </span>
              <span className="flex items-center gap-1">
                {repo.private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {repo.private ? "Private" : "Public"}
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                {new Date(repo.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!repo.is_connected && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onConnect(repo);
              }}
              className="px-3 py-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Connect
            </button>
          )}
          {repo.is_connected && (
            <span className="px-3 py-1.5 text-emerald-400 text-sm flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Connected
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ConnectedRepoCard({
  repo,
  onChat,
  onDisconnect,
  delay,
}: {
  repo: ConnectedRepo;
  onChat: (repo: ConnectedRepo) => void;
  onDisconnect: (id: string) => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => repo.is_indexed && onChat(repo)}
      className={`bg-[#16141c] border border-white/5 rounded-xl p-6 transition-all group ${
        repo.is_indexed 
          ? 'hover:border-violet-500/30 cursor-pointer hover:shadow-lg hover:shadow-violet-500/10' 
          : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
              {!repo.is_indexed ? (
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FolderGit2 className="w-6 h-6 text-gray-400 group-hover:text-violet-400 transition-colors" />
              )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-lg text-white group-hover:text-violet-300 transition-colors">{repo.name}</h3>
              <Badge status={repo.is_indexed ? "Indexed" : "Indexing"} />
            </div>
            {repo.description && (
              <p className="text-sm text-gray-500 mb-2 truncate max-w-sm">{repo.description}</p>
            )}
            {repo.is_indexed && (
              <p className="text-xs text-violet-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to chat about this repository →
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDisconnect(repo.id);
              }}
              className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
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
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [repoId, setRepoId] = useState<string | null>(null);
  const { fetchRepositories } = useRepository();

  useEffect(() => {
    if (!repoId || !loading) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/repos`);
        if (res.ok) {
          const repos = await res.json();
          const repo = repos.find((r: any) => r.id === repoId);
          
          if (repo) {
            if (repo.status_message && (!statusMessages.length || statusMessages[statusMessages.length - 1] !== repo.status_message)) {
              setStatusMessages(prev => [...prev, repo.status_message]);
            }
            
            if (repo.status === 'Indexed' || repo.status === 'Error') {
              setLoading(false);
              clearInterval(interval);
              
              setTimeout(() => {
                onClose();
                setUrl("");
                setStatusMessages([]);
                setRepoId(null);
                fetchRepositories();
              }, 2000);
            }
          }
        }
      } catch (e) {
        console.error('Error polling status:', e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [repoId, loading, statusMessages, onClose, fetchRepositories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setStatusMessages([]);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url })
      });
      
      if (res.ok) {
        const data = await res.json();
        setRepoId(data.repo_id);
        setStatusMessages([data.message]);
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to start ingestion.");
        setLoading(false);
      }
    } catch (e) {
      alert("Error connecting to backend.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setUrl("");
      setStatusMessages([]);
      setRepoId(null);
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
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="relative w-full max-w-lg bg-[#16141c] border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4">Connect Repository</h2>
            
            {!loading ? (
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
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    Connect
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#0f0f11] border border-white/10 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-1 font-mono text-sm">
                    {statusMessages.map((msg, i) => (
                      <div key={i} className="text-gray-300 whitespace-pre-wrap">
                        {msg}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-violet-400 mt-2">
                      <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-400">
                  Please wait while we index your repository
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
