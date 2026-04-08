"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Github,
  ArrowRight,
  Loader2,
  Database,
  FileText,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sessionToken = searchParams.get("session_token");
    const userId = searchParams.get("user_id");

    if (sessionToken && userId) {
      localStorage.setItem("session_token", sessionToken);
      localStorage.setItem("user_id", userId);
      window.history.replaceState({}, "", "/dashboard");
    }

    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      fetchUser(storedUserId);
    }
  }, [searchParams, router]);

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/github/user/${userId}`,
      );
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.clear();
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      router.push("/login");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleGoToRepos = () => {
    window.location.href = "/dashboard/repositories";
  };

  return (
<<<<<<< Updated upstream
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
=======
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              src={user.image}
              alt="GitHub Avatar"
              className="h-14 w-14 rounded-full border-2 border-violet-500/30 shadow-lg shadow-violet-500/20"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600/20 border-2 border-violet-500/30"
            >
              <span className="text-xl font-bold text-violet-400">
                {user?.name?.charAt(0) || "U"}
              </span>
            </motion.div>
          )}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold"
            >
              Welcome, {user?.name || "Developer"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-sm text-gray-400"
            >
              {user?.email}
            </motion.p>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
>>>>>>> Stashed changes
            Add New Project
          </motion.button>
        </div>
      </div>

      {/* Connect Repository Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
<<<<<<< Updated upstream
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
=======
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/5 bg-[#16141c] p-12 text-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Github className="h-8 w-8" />
          </div>
          <h2 className="mb-3 text-xl font-semibold">Connect a Repository</h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-400">
            Import a public or private repository to begin indexing. We support
            GitHub, GitLab, and Bitbucket.
          </p>
          <div className="mx-auto flex max-w-sm gap-4">
            <button
              onClick={handleGoToRepos}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              <Github className="h-4 w-4" />
              Connect GitHub
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border border-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/5">
              Import Manually
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-300">Recent Activity</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ActivityCard
            title="auth-service"
            subtitle="Updated 2h ago"
            status="Indexed"
            icon={<Database className="h-5 w-5 text-emerald-400" />}
            delay={0.25}
          />
          <ActivityCard
            title="frontend-v2"
            subtitle="Indexing... 85%"
            status="Processing"
            icon={<Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
            delay={0.3}
          />
          <ActivityCard
            title="legacy-api"
            subtitle="Updated yesterday"
            status="Indexed"
            icon={<FileText className="h-5 w-5 text-violet-400" />}
            delay={0.35}
          />
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}

function ActivityCard({
  title,
  subtitle,
  status,
  icon,
  delay,
}: {
  title: string;
  subtitle: string;
  status: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
<<<<<<< Updated upstream
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
=======
      className="cursor-pointer rounded-xl border border-white/5 bg-[#16141c] p-5 transition-all hover:border-violet-500/20 group"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-lg bg-white/5 p-2 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${
            status === "Indexed"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-blue-500/20 bg-blue-500/10 text-blue-400"
          }`}
        >
          {status}
        </span>
      </div>
      <h4 className="mb-1 font-semibold">{title}</h4>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{subtitle}</span>
        <ArrowRight className="h-4 w-4 translate-x-[-8px] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
>>>>>>> Stashed changes
    </motion.div>
  );
}
