"use client";

<<<<<<< Updated upstream
import { useState, useRef, useEffect } from "react";
import { 
  Terminal, LayoutDashboard, Settings, 
  LogOut, Plus, Search, Bell, Github,
  FolderGit2, MessageSquare, CircleDot
=======
import { RepositoryProvider } from "@/lib/RepositoryContext";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutGrid,
  MessageSquare,
  FolderGit2,
  CircleDot,
  Settings,
  LogOut,
  Search,
  Bell,
  Loader2,
>>>>>>> Stashed changes
} from "lucide-react";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  created_at: string | null;
}

const sidebarLinks = [
  { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
  { icon: MessageSquare, label: "Chat", href: "/dashboard/chat" },
  { icon: FolderGit2, label: "Repositories", href: "/dashboard/repositories" },
  { icon: CircleDot, label: "Issues", href: "/dashboard/issues" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
<<<<<<< Updated upstream
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  const handleSignOut = () => {
=======
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
>>>>>>> Stashed changes
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0e0d13]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const avatarUrl =
    user?.image ||
    "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "U");

  const pageTitle =
    sidebarLinks.find((l) => pathname === l.href)?.label || "Overview";

  return (
    <RepositoryProvider>
<<<<<<< Updated upstream
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
          <NavItem href="/dashboard/issues" icon={<CircleDot className="w-5 h-5" />} label="Issues" active={pathname === "/dashboard/issues"} />
          <NavItem href="/dashboard/settings" icon={<Settings className="w-5 h-5" />} label="Settings" active={pathname === "/dashboard/settings"} />
        </nav>

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
               {pathname === "/dashboard/issues" && "Issues"}
               {pathname === "/dashboard/settings" && "Settings"}
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
               className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
               style={{ color: 'var(--text-secondary)' }}
             >
                <Bell className="w-5 h-5" />
             </button>
             <div className="relative" ref={profileRef}>
               <button
                 onClick={() => setProfileOpen(!profileOpen)}
                 className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 cursor-pointer hover:ring-2 transition-all"
                 style={{ borderColor: 'var(--border-secondary)' }}
               />
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
                     <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>User</p>
                     <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>user@example.com</p>
                   </div>
                   <Link
                     href="/dashboard/settings"
                     onClick={() => setProfileOpen(false)}
                     className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                     style={{ color: 'var(--text-secondary)' }}
                   >
                     <Settings className="w-4 h-4" />
                     Settings
                   </Link>
                   <button
                     onClick={() => { setProfileOpen(false); handleSignOut(); }}
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
=======
      <div className="flex h-screen bg-[#0e0d13] text-white">
        {/* ─── Sidebar ── */}
        <aside className="flex w-64 flex-col border-r border-white/5 bg-[#13111a]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
              <div className="h-4 w-4 rounded-sm bg-[#0e0d13]" />
            </div>
            <span className="text-lg font-bold tracking-wider">AKAZA</span>
          </div>

          {/* Nav Links */}
          <nav className="mt-4 flex-1 space-y-1 px-3">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-violet-600/15 text-violet-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: Sign Out */}
          <div className="border-t border-white/5 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                <span className="text-xs font-bold">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="flex h-16 items-center justify-between border-b border-white/5 px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Dashboard</span>
              <span className="text-gray-600">/</span>
              <span className="text-white">{pageTitle}</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-9 w-64 rounded-lg border border-white/5 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-violet-500/50"
                />
              </div>
>>>>>>> Stashed changes

              {/* Notification Bell */}
              <button className="relative rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
              </button>

              {/* GitHub Avatar */}
              {user?.image ? (
                <img
                  src={user.image}
                  alt="GitHub Avatar"
                  className="h-9 w-9 rounded-full border-2 border-violet-500/30"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600">
                  <span className="text-sm font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </RepositoryProvider>
  );
}
<<<<<<< Updated upstream

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
=======
>>>>>>> Stashed changes
