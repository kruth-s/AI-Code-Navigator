"use client";

import { 
  Globe, Palette, Bot, Terminal, Check
} from "lucide-react";
import { useTheme, ThemeName } from "@/lib/ThemeContext";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your application preferences and workspace defaults.</p>
      </div>

      <div className="grid gap-8">
        {/* General Settings */}
        <Section title="General" icon={<Globe className="w-5 h-5 text-blue-400" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <SelectDropdown label="Default Interface Language" options={["English (US)", "Spanish", "French", "German"]} />
            <Input label="Default Branch Detection" defaultValue="main" placeholder="e.g. main, master" />
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={<Palette className="w-5 h-5 text-pink-400" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThemeCard
              themeId="classic"
              title="Classic"
              description="Deep dark OLED theme"
              active={theme === 'classic'}
              onClick={() => setTheme('classic')}
              previewColors={{ bg: '#0f0f11', sidebar: '#16141c', content: '#1c1a23' }}
            />
            <ThemeCard
              themeId="light"
              title="Light"
              description="Clean bright interface"
              active={theme === 'light'}
              onClick={() => setTheme('light')}
              previewColors={{ bg: '#f5f5f7', sidebar: '#ffffff', content: '#f0f0f2' }}
            />
            <ThemeCard
              themeId="nord"
              title="Nord"
              description="Professional arctic palette"
              active={theme === 'nord'}
              onClick={() => setTheme('nord')}
              previewColors={{ bg: '#2e3440', sidebar: '#3b4252', content: '#434c5e' }}
            />
          </div>
        </Section>

        {/* Chat Preferences */}
        <Section title="Chat Preferences" icon={<Bot className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />}>
          <div className="space-y-4">
            <Toggle label="Stream AI responses in real-time" defaultChecked />
            <Toggle label="Show line numbers in code snippets" defaultChecked />
            <Toggle label="Auto-detect programming language" defaultChecked />
            <Toggle label="Explain complex code blocks by default" />
          </div>
        </Section>

        {/* Advanced Workspace */}
        <Section title="Advanced" icon={<Terminal className="w-5 h-5 text-emerald-400" />}>
          <div className="space-y-4">
             <div
               className="p-4 rounded-xl flex items-center justify-between"
               style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)' }}
             >
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Debug Mode</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Show verbose logs in the browser console.</div>
                </div>
                <button
                  className="px-3 py-1.5 rounded-md text-xs transition-colors"
                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  Enable
                </button>
             </div>
          </div>
        </Section>
      </div>

      <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <button
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          Discard Changes
        </button>
        <button
          className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold shadow-lg transition-all"
          style={{ backgroundColor: 'var(--accent)', boxShadow: `0 10px 25px -5px var(--accent-glow)` }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

// Sub-components
function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-4 group">
      <div className="flex items-center gap-2 text-md font-semibold" style={{ color: 'var(--text-primary)', opacity: 0.9 }}>
        <span className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
        {title}
      </div>
      <div
        className="p-6 rounded-2xl shadow-xl"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-primary)' }}
      >
        {children}
      </div>
    </div>
  );
}

function ThemeCard({
  themeId, title, description, active = false, onClick, previewColors
}: {
  themeId: string, title: string, description: string, active?: boolean, onClick: () => void,
  previewColors: { bg: string, sidebar: string, content: string }
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl transition-all cursor-pointer text-left relative"
      style={{
        backgroundColor: active ? 'var(--bg-active)' : 'var(--bg-hover)',
        border: active ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
        boxShadow: active ? `0 0 20px var(--accent-glow)` : 'none',
      }}
    >
      {/* Active indicator */}
      {active && (
        <div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Theme preview */}
      <div
        className="w-full h-16 rounded-lg mb-3 flex gap-0.5 overflow-hidden"
        style={{ border: '1px solid var(--border-primary)' }}
      >
        <div className="w-1/4 h-full" style={{ backgroundColor: previewColors.sidebar }}></div>
        <div className="flex-1 h-full flex flex-col">
          <div className="h-3" style={{ backgroundColor: previewColors.sidebar, opacity: 0.7 }}></div>
          <div className="flex-1" style={{ backgroundColor: previewColors.bg }}></div>
        </div>
      </div>

      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</div>
      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</div>
    </button>
  );
}

function SelectDropdown({ label, options }: { label: string, options: string[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <select
        className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none appearance-none cursor-pointer transition-colors"
        style={{
          backgroundColor: 'var(--input-bg)',
          border: '1px solid var(--border-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Input({ label, defaultValue, placeholder }: { label: string, defaultValue?: string, placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input 
        type="text" 
        defaultValue={defaultValue} 
        placeholder={placeholder}
        className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
        style={{
          backgroundColor: 'var(--input-bg)',
          border: '1px solid var(--border-secondary)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string, defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <div className="relative">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <div
          className="w-10 h-5 rounded-full peer peer-checked:after:translate-x-[20px] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        ></div>
        {/* Checked state uses accent color via a CSS approach */}
        <style jsx>{`
          .peer:checked ~ div {
            background-color: var(--accent) !important;
          }
        `}</style>
      </div>
    </label>
  );
}
