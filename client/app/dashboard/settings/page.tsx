"use client";

import { motion } from "framer-motion";
import { User, Lock, Bell, Key, CreditCard, Shield } from "lucide-react";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    GEMINI_API_KEY: "",
    GROQ_API_KEY: "",
    GITHUB_ACCESS_TOKEN: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    try {
       await fetch('http://127.0.0.1:8000/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value })
       });
       alert("Setting updated!");
       setSettings(prev => ({ ...prev, [key]: value ? "********" : null }));
    } catch (e) {
       alert("Failed to update setting");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and integrations.</p>
        </div>

        <div className="grid gap-8">
           {/* Profile Section */}
           <Section title="Profile" icon={<User className="w-5 h-5" />}>
              <div className="grid md:grid-cols-2 gap-6">
                 <Input label="Full Name" defaultValue="User" />
                 <Input label="Email Address" defaultValue="user@example.com" />
              </div>
           </Section>

           <Section title="Integrations & API Keys" icon={<Key className="w-5 h-5" />}>
              <div className="space-y-4">
                 {/* Gemini */}
                 <ApiKeyInput 
                    label="Google Gemini API Key" 
                    connected={!!settings.GEMINI_API_KEY} 
                    onSave={(val) => handleUpdate("GEMINI_API_KEY", val)}
                 />
                 


                 {/* GitHub */}
                 <ApiKeyInput 
                    label="GitHub Access Token" 
                    connected={!!settings.GITHUB_ACCESS_TOKEN} 
                    onSave={(val) => handleUpdate("GITHUB_ACCESS_TOKEN", val)}
                 />
              </div>
           </Section>

           {/* Notifications */}
           <Section title="Notifications" icon={<Bell className="w-5 h-5" />}>
              <div className="space-y-3">
                 <Toggle label="Email notifications for completed indexing" defaultChecked />
                 <Toggle label="Weekly digest of repository insights" />
                 <Toggle label="New feature announcements" defaultChecked />
              </div>
           </Section>

           {/* Danger Zone */}
           <div className="border border-red-500/20 rounded-xl overflow-hidden">
              <div className="bg-red-500/5 px-6 py-4 border-b border-red-500/10 flex items-center gap-2 text-red-400">
                 <Shield className="w-5 h-5" />
                 <h3 className="font-semibold">Danger Zone</h3>
              </div>
              <div className="p-6">
                 <div className="flex items-center justify-between">
                    <div>
                       <div className="font-medium text-white">Delete Account</div>
                       <div className="text-sm text-gray-500">Permanently remove your account and all data.</div>
                    </div>
                    <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20">
                       Delete Account
                    </button>
                 </div>
              </div>
           </div>
        </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
       <div className="flex items-center gap-2 text-lg font-semibold text-white/90">
          <span className="text-gray-500">{icon}</span>
          {title}
       </div>
       <div className="p-6 bg-[#16141c] border border-white/5 rounded-xl">
          {children}
       </div>
    </div>
  );
}

function Input({ label, defaultValue }: { label: string, defaultValue: string }) {
   return (
      <div className="space-y-1.5">
         <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>
         <input 
            type="text" 
            defaultValue={defaultValue} 
            className="w-full bg-[#1c1a23] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 transition-colors" 
         />
      </div>
   );
}

function Toggle({ label, defaultChecked }: { label: string, defaultChecked?: boolean }) {
   return (
      <label className="flex items-center gap-3 cursor-pointer group">
         <div className="relative">
            <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
         </div>
         <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
      </label>
   );
}

function ApiKeyInput({ label, connected, onSave }: { label: string, connected: boolean, onSave: (val: string) => void }) {
   const [isEditing, setIsEditing] = useState(false);
   const [value, setValue] = useState("");

   return (
      <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
         <div className="flex justify-between items-start mb-2">
            <span className="font-medium">{label}</span>
            <span className={`text-xs px-2 py-0.5 rounded border ${
               connected 
               ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
               : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
            }`}>
               {connected ? "Connected" : "Not Connected"}
            </span>
         </div>
         {isEditing ? (
            <div className="flex gap-2">
               <input 
                  type="password" 
                  autoFocus
                  placeholder="Paste new key..."
                  className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-violet-500/50 outline-none"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
               />
               <button 
                  onClick={() => { onSave(value); setIsEditing(false); }}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 rounded text-sm transition-colors"
               >
                  Save
               </button>
               <button 
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
               >
                  Cancel
               </button>
            </div>
         ) : (
            <div className="flex gap-2">
               <input 
                  type="password" 
                  value={connected ? "........................" : ""} 
                  disabled 
                  className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-gray-500" 
                  placeholder="Not configured"
               />
               <button 
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
               >
                  Edit
               </button>
            </div>
         )}
      </div>
   );
}
