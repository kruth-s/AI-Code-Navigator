"use client";

import { 
  Terminal, LayoutDashboard, Settings, 
  LogOut, Plus, Search, Bell, Github,
  FolderGit2, MessageSquare
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

  const handleSignOut = () => {
    // In a real app with NextAuth, you would call signOut() here
    // await signOut({ callbackUrl: '/login' });
    router.push("/login");
  };

  return (
    <RepositoryProvider>
    <div className="flex h-screen w-full bg-[#0f0f11] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#16141c] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white text-black p-1.5 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-black"></div>
          </div>
          <span className="font-bold text-lg tracking-tight">AKAZA</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" active={pathname === "/dashboard"} />
          <NavItem href="/dashboard/chat" icon={<MessageSquare className="w-5 h-5" />} label="Chat" active={pathname === "/dashboard/chat"} />
          <NavItem href="/dashboard/repositories" icon={<FolderGit2 className="w-5 h-5" />} label="Repositories" active={pathname === "/dashboard/repositories"} />
          <NavItem href="/dashboard/settings" icon={<Settings className="w-5 h-5" />} label="Settings" active={pathname === "/dashboard/settings"} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#16141c]/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4 text-sm text-gray-400">
             <span>Dashboard</span>
             <span className="text-white/20">/</span>
             <span className="text-white">
               {pathname === "/dashboard" && "Overview"}
               {pathname === "/dashboard/chat" && "Chat"}
               {pathname === "/dashboard/repositories" && "Repositories"}
               {pathname === "/dashboard/settings" && "Settings"}
             </span>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-[#1c1a23] border border-white/5 text-sm text-white pl-9 pr-4 py-2 rounded-full focus:outline-none focus:border-violet-500/50 w-64 transition-all placeholder:text-gray-600"
                />
             </div>
             <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
             </button>
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 border border-white/10"></div>
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active 
          ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" 
          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
