"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Terminal, LayoutDashboard, Settings, 
  LogOut, Plus, Search, Bell, Github,
  FolderGit2, MessageSquare, CircleDot
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RepositoryProvider } from "@/lib/RepositoryContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
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
    router.push("/login");
  };

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

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8 lg:p-12 relative">
           {children}
        </main>
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
