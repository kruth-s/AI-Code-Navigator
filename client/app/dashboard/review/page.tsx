"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ScanSearch, CheckCircle2, AlertTriangle, XCircle, Code2, Sparkles, Loader2, FolderGit2, FileCode2 } from "lucide-react";
import { useRepository } from "@/lib/RepositoryContext";

export default function CodeReviewPage() {
  const { repositories } = useRepository();
  const [activeTab, setActiveTab] = useState<"codebase" | "snippet">("codebase");
  
  // States for Codebase Review
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [repoResult, setRepoResult] = useState<{
    summary: string;
    file_reviews: Array<{
      file_path: string;
      improvements: Array<{
        code_section: string;
        rule_violated: string;
        what_to_do: string;
        severity: string;
      }>;
    }>;
  } | null>(null);

  // States for Snippet Review
  const [snippetCode, setSnippetCode] = useState("");
  const [loadingSnippet, setLoadingSnippet] = useState(false);
  const [snippetResult, setSnippetResult] = useState<{
    violations: string;
    suggestions: string;
    severity: string;
  } | null>(null);

  const handleRepoReview = async () => {
    if (!selectedRepo) return;
    setLoadingRepo(true);
    setRepoResult(null);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${BACKEND_URL}/api/review/repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_name: selectedRepo }),
      });

      if (res.ok) {
        const data = await res.json();
        setRepoResult(data);
      } else {
        alert("Failed to review codebase.");
      }
    } catch (e) {
      console.error(e);
      alert("Error reaching the AI Reviewer service.");
    } finally {
      setLoadingRepo(false);
    }
  };

  const handleSnippetReview = async () => {
    if (!snippetCode.trim()) return;
    setLoadingSnippet(true);
    setSnippetResult(null);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${BACKEND_URL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: snippetCode }),
      });

      if (res.ok) {
        const data = await res.json();
        setSnippetResult(data);
      } else {
        alert("Failed to review snippet.");
      }
    } catch (e) {
      console.error(e);
      alert("Error reaching the AI Reviewer service.");
    } finally {
      setLoadingSnippet(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Sparkles className="w-8 h-8 text-violet-500" />
          AI Code Reviewer
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Strict rule-guided code evaluation based on SKILL.md. Run a batch review or check quick snippets.
        </p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/10">
        <button
          onClick={() => setActiveTab("codebase")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "codebase" ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200"}`}
        >
          <FolderGit2 className="w-4 h-4" />
          Full Codebase
        </button>
        <button
          onClick={() => setActiveTab("snippet")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "snippet" ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200"}`}
        >
          <FileCode2 className="w-4 h-4" />
          Custom Snippet
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="w-full flex justify-between items-end">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              {activeTab === "codebase" ? "Select Repository" : "Input Snippet"}
            </h2>
            {activeTab === "snippet" && (
              <button 
                onClick={() => { navigator.clipboard.readText().then(text => setSnippetCode(text)); }}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Copy className="w-3 h-3" /> Paste clipboard
              </button>
            )}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full rounded-xl overflow-hidden border ${activeTab === "codebase" ? "p-4 flex items-center gap-4" : ""}`}
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--card-bg)" }}
          >
            {activeTab === "codebase" ? (
              <>
                <FolderGit2 className="w-6 h-6 text-violet-400" />
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full bg-transparent outline-none font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  <option value="" disabled style={{ color: "black" }}>Select an indexed repository...</option>
                  {repositories.filter(r => r.status === "Indexed").map(r => (
                    <option key={r.id} value={r.name} style={{ color: "black" }}>{r.name}</option>
                  ))}
                </select>
              </>
            ) : (
              <textarea
                className="w-full h-80 p-4 font-mono text-sm bg-transparent outline-none resize-none"
                style={{ color: "var(--text-primary)" }}
                placeholder="// Paste your code snippet here to check it against SKILL.md..."
                value={snippetCode}
                onChange={(e) => setSnippetCode(e.target.value)}
                spellCheck={false}
              />
            )}
          </motion.div>
          
          <button
            onClick={activeTab === "codebase" ? handleRepoReview : handleSnippetReview}
            disabled={activeTab === "codebase" ? (loadingRepo || !selectedRepo) : (loadingSnippet || !snippetCode.trim())}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg font-medium transition-all text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {(activeTab === "codebase" ? loadingRepo : loadingSnippet) ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanSearch className="w-5 h-5" />}
            {(activeTab === "codebase" ? loadingRepo : loadingSnippet) ? "Analyzing..." : `Run AI Review`}
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Analysis Report</h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeTab}
            className="w-full min-h-[360px] max-h-[700px] overflow-y-auto scrollbar-hide rounded-xl border p-6 flex flex-col relative"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--card-bg)" }}
          >
            {/* NO DATA STATE */}
            {((activeTab === "codebase" && !repoResult && !loadingRepo) || 
              (activeTab === "snippet" && !snippetResult && !loadingSnippet)) && (
              <div className="m-auto text-center flex flex-col items-center gap-3 opacity-50">
                <Code2 className="w-12 h-12 text-gray-500" />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {activeTab === "codebase" ? "Select a repository to see the strict rules evaluation report." : "Submit code snippet to see the evaluation report."}
                </p>
              </div>
            )}

            {/* LOADING STATE */}
            {(loadingRepo || loadingSnippet) && (
              <div className="m-auto text-center flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-violet-400 animate-pulse">Running semantic routing & rules evaluation...</p>
              </div>
            )}

            {/* CODEBASE RESULT */}
            {activeTab === "codebase" && repoResult && !loadingRepo && (
              <div className="space-y-6 flex flex-col">
                <div className="pb-4 border-b border-white/5 space-y-2">
                   <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Summary</h3>
                   <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{repoResult.summary}</p>
                </div>

                {repoResult.file_reviews.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>No rule violations found in the codebase! Great job!</span>
                  </div>
                ) : (
                  repoResult.file_reviews.map((review, idx) => (
                    <div key={idx} className="space-y-4">
                      {review.improvements.map((imp, iIdx) => (
                        <div key={iIdx} className="p-4 rounded-xl space-y-5 bg-white/5 border border-white/10 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: imp.severity.toLowerCase() === 'high' ? 'var(--error)' : 'var(--accent)' }} />
                          
                          <div className="flex justify-between items-start border-b border-white/10 pb-3 pl-2">
                             <div className="font-mono text-xs text-violet-300 font-bold flex items-center gap-2">
                                <Code2 className="w-3.5 h-3.5" />
                                {review.file_path}
                             </div>
                             <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-white">
                                {imp.severity}
                             </span>
                          </div>
                          
                          <div className="space-y-1 pl-2">
                            <h4 className="text-[11px] font-semibold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3" /> Rule Violated
                            </h4>
                            <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{imp.rule_violated}</div>
                          </div>

                          <div className="space-y-1.5 pl-2 relative">
                            <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Code Section</h4>
                            <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre">
                              {imp.code_section}
                            </div>
                          </div>

                          <div className="space-y-1 pl-2">
                            <h4 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" /> What You Should Do
                            </h4>
                            <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{imp.what_to_do}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SNIPPET RESULT */}
            {activeTab === "snippet" && snippetResult && !loadingSnippet && (
              <div className="space-y-6 h-full flex flex-col overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    {snippetResult.severity.toLowerCase().includes("high") || snippetResult.severity.toLowerCase().includes("critical") ? (
                      <XCircle className="w-6 h-6 text-red-400" />
                    ) : snippetResult.severity.toLowerCase().includes("medium") ? (
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    )}
                    <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Status</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 uppercase tracking-wide">
                    {snippetResult.severity}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                    Violations
                  </h4>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {snippetResult.violations}
                  </div>
                </div>

                <div className="space-y-2 mt-auto pt-4 border-t border-white/5">
                  <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                    Suggestions & Fixes
                  </h4>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {snippetResult.suggestions}
                  </div>
                </div>
              </div>
            )}
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
