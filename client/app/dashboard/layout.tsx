"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FolderGit2,
  CircleDot,
  Settings,
  LogOut,
  Search,
  Bell,
  Github,
  Loader2,
  ScanSearch,
  Bot,
  Presentation,
  PenTool
} from "lucide-react";
import Link from "next/link";
import { RepositoryProvider } from "@/lib/RepositoryContext";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  created_at: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      fetchUser(storedUserId);
    } else {
      setLoading(false);
      router.push("/login");
    }
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/github/user/${userId}`,
      );
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user_cache", JSON.stringify(userData));
      } else {
        localStorage.clear();
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const avatarUrl =
    user?.image ||
    "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "U");

  return (
    <RepositoryProvider>
      <div
        className="flex h-screen w-full font-sans overflow-hidden"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        {/* Sidebar */}
        <aside
          className="w-64 flex flex-col"
          style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}
        >
          <div className="p-6 flex items-center gap-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>AKAZA</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" active={pathname === "/dashboard"} />
            <NavItem href="/dashboard/chat" icon={<MessageSquare className="w-5 h-5" />} label="Chat" active={pathname === "/dashboard/chat"} />
            <NavItem href="/dashboard/repositories" icon={<FolderGit2 className="w-5 h-5" />} label="Repositories" active={pathname === "/dashboard/repositories"} />
            <NavItem href="/dashboard/review" icon={<ScanSearch className="w-5 h-5" />} label="Code Review" active={pathname === "/dashboard/review"} />
            <NavItem href="/dashboard/issues" icon={<CircleDot className="w-5 h-5" />} label="Issues" active={pathname === "/dashboard/issues"} />
            <NavItem href="/dashboard/settings" icon={<Settings className="w-5 h-5" />} label="Settings" active={pathname === "/dashboard/settings"} />
            
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Fun</p>
            </div>
            <NavItem href="/dashboard/personality" icon={<Bot className="w-5 h-5 text-indigo-400" />} label="AI Personality" active={pathname === "/dashboard/personality"} />
            <NavItem href="/dashboard/pitch" icon={<Presentation className="w-5 h-5 text-fuchsia-400" />} label="Pitch Generator" active={pathname === "/dashboard/pitch"} />
            <NavItem href="/dashboard/architecture" icon={<PenTool className="w-5 h-5 text-cyan-400" />} label="Architecture Canvas" active={pathname === "/dashboard/architecture"} />
          </nav>
          
          {/* Bottom: Sign Out */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
             <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)', backgroundColor: 'transparent' }}
             >
                {user?.image ? (
                  <img src={user.image} alt="Avatar" className="h-7 w-7 rounded-full border border-white/10" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                    <span className="text-xs font-bold">{user?.name?.charAt(0) || "U"}</span>
                  </div>
                )}
                Sign Out
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header
            className="h-16 backdrop-blur-md flex items-center justify-between px-6 z-10"
            style={{ backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border-primary)' }}
          >
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
               <Link href="/dashboard" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
               <span style={{ color: 'var(--border-secondary)' }}>/</span>
               <span style={{ color: 'var(--text-primary)' }}>
                 {pathname === "/dashboard" && "Overview"}
                 {pathname === "/dashboard/chat" && "Chat"}
                 {pathname === "/dashboard/repositories" && "Repositories"}
                 {pathname === "/dashboard/review" && "Code Review"}
                 {pathname === "/dashboard/issues" && "Issues"}
                 {pathname === "/dashboard/settings" && "Settings"}
                 {pathname === "/dashboard/personality" && "AI Personality"}
               </span>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="text-sm pl-9 pr-4 py-2 rounded-full focus:outline-none w-64 transition-all"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
               </div>
               <button
                 className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/5"
                 style={{ color: 'var(--text-secondary)' }}
               >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
               </button>
               
               {/* User Avatar & Dropdown */}
               <div className="relative" ref={profileRef}>
                 <button
                   onClick={() => setProfileOpen(!profileOpen)}
                   className="w-9 h-9 rounded-full cursor-pointer hover:ring-2 transition-all p-0 overflow-hidden outline-none"
                   style={{ borderColor: 'var(--border-secondary)' }}
                 >
                    {user?.image ? (
                       <img src={user.image} alt="User Profile" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs">
                         {user?.name?.charAt(0) || "U"}
                       </div>
                    )}
                 </button>
                 {profileOpen && (
                   <div
                     className="absolute right-0 mt-2 w-48 rounded-xl py-1.5 z-50 overflow-hidden"
                     style={{
                       backgroundColor: 'var(--dropdown-bg)',
                       border: '1px solid var(--border-secondary)',
                       boxShadow: `0 25px 50px -12px var(--shadow-color)`,
                     }}
                   >
                     <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                       <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name || "User"}</p>
                       <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || "user@example.com"}</p>
                     </div>
                     <Link
                       href="/dashboard/settings"
                       onClick={() => setProfileOpen(false)}
                       className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                       style={{ color: 'var(--text-secondary)' }}
                     >
                       <Settings className="w-4 h-4" />
                       Settings
                     </Link>
                     <button
                       onClick={() => { setProfileOpen(false); handleLogout(); }}
                       className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                     >
                       <LogOut className="w-4 h-4" />
                       Sign Out
                     </button>
                   </div>
                 )}
               </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </RepositoryProvider>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--bg-active)' : 'transparent',
        color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
        border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
