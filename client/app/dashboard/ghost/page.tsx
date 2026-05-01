"use client";

import { useState } from "react";
import { useRepository } from "@/lib/RepositoryContext";
import { 
  Ghost, 
  AlertTriangle, 
  Lightbulb, 
  Wrench, 
  Check, 
  ChevronRight,
  Code2,
  FileCode2,
  Zap,
  Activity,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Data ---
const MOCK_FILES = [
  { name: "auth.js", path: "src/middleware/auth.js" },
  { name: "userController.js", path: "src/controllers/userController.js" },
  { name: "database.config.ts", path: "src/config/database.config.ts" }
];

const MOCK_CODE_AUTH_JS = `import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { db } from '../config/db';

export const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (token) {
    if (token.startsWith('Bearer ')) {
      const actualToken = token.slice(7, token.length);
      try {
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
        req.user = decoded;
        
        // Fetch user from DB to ensure they still exist
        const user = await User.findById(decoded.id);
        if (user) {
          if (user.isActive) {
             next();
          } else {
             res.status(401).json({ error: 'User is deactivated' });
          }
        } else {
          res.status(401).json({ error: 'User no longer exists' });
        }
      } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      res.status(401).json({ error: 'Invalid token format' });
    }
  } else {
    res.status(401).json({ error: 'No token provided' });
  }
};
`;

const MOCK_ISSUES = [
  {
    id: "issue-1",
    line: 8,
    title: "Deep Nesting / Complexity",
    description: "The authentication logic has deep nesting which makes it hard to read and maintain.",
    severity: "High",
    confidence: 87,
    suggestion: "Extract validation logic into separate function or reduce nesting by using early returns.",
    fixPatch: `export const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token or invalid format' });
  }

  const actualToken = token.slice(7, token.length);
  
  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User invalid or deactivated' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};`
  },
  {
    id: "issue-2",
    line: 14,
    title: "Database call in middleware",
    description: "Calling the database on every authenticated request can cause performance bottlenecks.",
    severity: "Medium",
    confidence: 92,
    suggestion: "Consider caching user sessions using Redis or rely on the JWT payload if immediate revocation isn't critical.",
    fixPatch: null
  }
];

export default function GhostModePage() {
  const { selectedRepo } = useRepository();
  const [activeFile, setActiveFile] = useState(MOCK_FILES[0]);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [ghostModeEnabled, setGhostModeEnabled] = useState(true);

  if (!selectedRepo) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
            <Ghost className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Select a Repository</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You need to select a repository to activate Ghost Mode.</p>
        </div>
      </div>
    );
  }

  const handleIssueClick = (id: string) => {
    setSelectedIssue(id);
  };

  const activeIssueData = MOCK_ISSUES.find(i => i.id === selectedIssue);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Ghost className="w-8 h-8 text-rose-500" />
            Ghost Mode
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Real-time, contextual intelligence. Your repo whispers improvements without interrupting you.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-opacity-20 px-4 py-2 rounded-full border border-rose-500/30" style={{ backgroundColor: ghostModeEnabled ? 'rgba(244, 63, 94, 0.1)' : 'var(--bg-secondary)' }}>
          <span className="text-sm font-medium" style={{ color: ghostModeEnabled ? '#f43f5e' : 'var(--text-muted)' }}>
            {ghostModeEnabled ? 'Ghost Mode Active' : 'Ghost Mode Paused'}
          </span>
          <button 
            onClick={() => setGhostModeEnabled(!ghostModeEnabled)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ backgroundColor: ghostModeEnabled ? '#f43f5e' : 'var(--border-primary)' }}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ghostModeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-[600px]">
        {/* Left: Code Viewer */}
        <div className="flex-[2] flex flex-col rounded-xl overflow-hidden border shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          {/* File Tabs */}
          <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}>
            {MOCK_FILES.map(file => (
              <button
                key={file.name}
                onClick={() => setActiveFile(file)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeFile.name === file.name 
                    ? 'border-rose-500 text-rose-500' 
                    : 'border-transparent hover:bg-white/5'
                }`}
                style={{ color: activeFile.name === file.name ? '#f43f5e' : 'var(--text-secondary)' }}
              >
                <FileCode2 className="w-4 h-4" />
                {file.name}
              </button>
            ))}
          </div>
          
          {/* Code Area */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm relative">
            {MOCK_CODE_AUTH_JS.split('\n').map((line, idx) => {
              const lineNum = idx + 1;
              const issueOnLine = MOCK_ISSUES.find(i => i.line === lineNum);
              const isSelectedLine = selectedIssue === issueOnLine?.id;
              
              return (
                <div 
                  key={idx} 
                  className={`flex group relative px-2 py-0.5 rounded transition-colors ${isSelectedLine ? 'bg-rose-500/10' : 'hover:bg-white/5'}`}
                >
                  <div className="w-8 shrink-0 text-right pr-4 select-none" style={{ color: 'var(--text-muted)' }}>
                    {lineNum}
                  </div>
                  <div className="flex-1 whitespace-pre" style={{ color: 'var(--text-primary)' }}>
                    {line}
                  </div>
                  
                  {/* Ghost Mode Passive Hint */}
                  {ghostModeEnabled && issueOnLine && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                      <button 
                        onClick={() => handleIssueClick(issueOnLine.id)}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border transition-all ${
                          isSelectedLine 
                            ? 'bg-rose-500 border-rose-500 text-white' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {issueOnLine.title}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Issue Fixer */}
        <div className="flex-1 flex flex-col rounded-xl overflow-hidden border shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}>
            <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Wrench className="w-4 h-4 text-rose-500" />
              Issue Fixer
            </h2>
            <div className="px-2 py-1 rounded text-xs font-medium bg-rose-500/10 text-rose-500">
              Active Mode
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {activeIssueData ? (
                <motion.div
                  key={activeIssueData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Issue Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        activeIssueData.severity === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {activeIssueData.severity} Risk
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Zap className="w-3 h-3 text-yellow-500" />
                        AI Confidence: {activeIssueData.confidence}%
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                      {activeIssueData.title}
                    </h3>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <AlertTriangle className="w-4 h-4" />
                      Explanation
                    </h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {activeIssueData.description}
                    </p>
                  </div>

                  {/* Suggestion */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Suggestion
                    </h4>
                    <div className="p-3 rounded-lg border bg-yellow-500/5 border-yellow-500/20 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {activeIssueData.suggestion}
                    </div>
                  </div>

                  {/* Code Patch */}
                  {activeIssueData.fixPatch && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <Code2 className="w-4 h-4 text-emerald-500" />
                        Suggested Fix
                      </h4>
                      <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-primary)' }}>
                        <div className="px-3 py-1.5 text-xs font-mono bg-emerald-500/10 text-emerald-500 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                          auth.js
                        </div>
                        <pre className="p-4 text-xs font-mono overflow-x-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                          <code>{activeIssueData.fixPatch}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-rose-500/25">
                      <Check className="w-4 h-4" />
                      Apply Fix
                    </button>
                    <button className="px-4 py-2.5 rounded-lg text-sm font-medium border hover:bg-white/5 transition-all" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                      Ignore
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-dashed" style={{ borderColor: 'var(--border-primary)' }}>
                    <ShieldAlert className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No Issue Selected</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Click on a highlighted issue in the code viewer to see the AI analysis and suggested fix.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
