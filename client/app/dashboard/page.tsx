"use client";

import { motion } from "framer-motion";
import { 
  Plus, Github, ArrowRight, Loader2, Database, FileText, 
  Bot, Presentation, PenTool, Headphones, Zap, ShieldCheck, 
  Code2, MessageSquare, ScanSearch, LayoutDashboard, CheckCircle2, FolderGit2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRepository } from "@/lib/RepositoryContext";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  created_at: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { repositories, selectedRepo, setSelectedRepo } = useRepository();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const cachedUser = localStorage.getItem("user_cache");
    if (cachedUser) {
      try { setUser(JSON.parse(cachedUser)); } catch (e) {}
    }
    const sessionToken = searchParams.get("session_token");
    const userId = searchParams.get("user_id");
    if (sessionToken && userId) {
      localStorage.setItem("session_token", sessionToken);
      localStorage.setItem("user_id", userId);
      window.history.replaceState({}, "", "/dashboard");
    }
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId && !cachedUser) { fetchUser(storedUserId); }
  }, [searchParams, router]);

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/github/user/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user_cache", JSON.stringify(userData));
      }
    } catch (error) { console.error("Failed to fetch user:", error); }
  };

  const currentRepo = selectedRepo;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 overflow-hidden scrollbar-hide">
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tight flex items-center gap-3"
          >
            Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">{user?.name || "Developer"}</span>
          </motion.h1>
          <p className="text-gray-400 mt-1">Your AI-powered engineering hub is ready.</p>
        </div>

        <div className="flex gap-4">
          <StatBox icon={<Database className="w-4 h-4 text-emerald-400" />} label="Indexed" value={repositories.filter(r => r.status === "Indexed").length} />
          <StatBox icon={<Zap className="w-4 h-4 text-amber-400" />} label="Active" value={selectedRepo ? 1 : 0} />
          <StatBox icon={<ShieldCheck className="w-4 h-4 text-blue-400" />} label="Health" value="100%" />
        </div>
      </div>

      {/* 2. Main Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Repo Hero OR Connect Repo */}
        <div className="lg:col-span-2">
          {currentRepo ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-full overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent p-8 group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Github className="w-64 h-64 -mr-16 -mt-16" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <CheckCircle2 className="w-3 h-3" /> Fully Indexed
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{currentRepo.name}</h2>
                  <p className="text-gray-400 max-w-md">Currently analyzed and ready for deep architectural insights and automated reviews.</p>
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                  <QuickActionBtn href="/dashboard/chat" icon={<MessageSquare className="w-4 h-4" />} label="Chat" />
                  <QuickActionBtn href="/dashboard/architecture" icon={<PenTool className="w-4 h-4" />} label="Canvas" />
                  <QuickActionBtn href="/dashboard/review" icon={<ScanSearch className="w-4 h-4" />} label="Scan" />
                  <button 
                    onClick={() => router.push("/dashboard/repositories")}
                    className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    Switch Project
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full rounded-3xl border border-white/5 bg-black/20 p-12 flex flex-col items-center text-center justify-center space-y-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                 <Github className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">No Active Repository</h2>
                <p className="text-gray-400 max-w-sm">Connect your first project to unlock the Intelligence Suite.</p>
              </div>
              <button 
                onClick={() => router.push("/dashboard/repositories")}
                className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-xl shadow-violet-500/20 transition-all active:scale-95"
              >
                Get Started
              </button>
            </motion.div>
          )}
        </div>

        {/* Right: Recent Files / activity list */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 px-1">Recent Projects</h3>
          <div className="space-y-3">
            {repositories.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-gray-500 text-sm text-center">Empty workspace</div>
            ) : (
              repositories.slice(0, 4).map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedRepo?.name === repo.name ? "bg-violet-500/10 border-violet-500/30" : "bg-black/20 border-white/5 hover:bg-black/40"}`}
                >
                  <div className="flex items-center gap-3">
                    <FolderGit2 className={`w-5 h-5 ${selectedRepo?.name === repo.name ? "text-violet-400" : "text-gray-500"}`} />
                    <span className="font-medium text-sm truncate max-w-[120px] text-left">{repo.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>
              ))
            )}
          </div>
          <Link href="/dashboard/repositories" className="block text-center py-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest">
            View All Workspaces →
          </Link>
        </div>
      </div>

      {/* 3. Intelligence Suite Grid */}
      <div className="space-y-6 pt-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Zap className="w-5 h-5 text-amber-500" />
          Intelligence Suite
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <FeatureCard 
              href="/dashboard/personality"
              icon={<Bot className="w-6 h-6 text-indigo-400" />}
              title="Identity"
              desc="Reveal repo persona"
              color="indigo"
           />
           <FeatureCard 
              href="/dashboard/pitch"
              icon={<Presentation className="w-6 h-6 text-fuchsia-400" />}
              title="Pitch"
              desc="Investor summary"
              color="fuchsia"
           />
           <FeatureCard 
              href="/dashboard/architecture"
              icon={<PenTool className="w-6 h-6 text-cyan-400" />}
              title="Architecture"
              desc="Interactive flows"
              color="cyan"
           />
           <FeatureCard 
              href="/dashboard/brief"
              icon={<Headphones className="w-6 h-6 text-emerald-400" />}
              title="60s Brief"
              desc="Audio briefing"
              color="emerald"
           />
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3">
      {icon}
      <div>
        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">{label}</div>
        <div className="text-sm font-bold text-gray-200">{value}</div>
      </div>
    </div>
  );
}

function QuickActionBtn({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg"
    >
      {icon}
      {label}
    </Link>
  );
}

function FeatureCard({ href, icon, title, desc, color }: { href: string, icon: any, title: string, desc: string, color: string }) {
  const colors: any = {
    indigo: "hover:border-indigo-500/40 hover:bg-indigo-500/5",
    fuchsia: "hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5",
    cyan: "hover:border-cyan-500/40 hover:bg-cyan-500/5",
    emerald: "hover:border-emerald-500/40 hover:bg-emerald-500/5",
  };
  return (
    <Link href={href} className={`p-6 rounded-3xl border border-white/5 bg-black/20 transition-all group ${colors[color]}`}>
       <div className="mb-4">{icon}</div>
       <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h4>
       <p className="text-xs text-gray-400">{desc}</p>
       <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4 text-gray-400" />
       </div>
    </Link>
  );
}
