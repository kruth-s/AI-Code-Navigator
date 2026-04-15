"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, ScanSearch, CheckCircle2, AlertTriangle, XCircle, Code2, Sparkles, Loader2 } from "lucide-react";

export default function CodeReviewPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    violations: string;
    suggestions: string;
    severity: string;
  } | null>(null);

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${BACKEND_URL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        alert("Failed to review code.");
      }
    } catch (e) {
      console.error(e);
      alert("Error reaching the AI Reviewer service.");
    } finally {
      setLoading(false);
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
          Strict rule-guided code evaluation based on Markdown standards. Identifies violations and suggests fixes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="w-full flex justify-between items-end">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Input Code</h2>
            <button 
              onClick={() => { navigator.clipboard.readText().then(text => setCode(text)); }}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Copy className="w-3 h-3" /> Paste from clipboard
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-xl overflow-hidden border"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--input-bg)" }}
          >
            <textarea
              className="w-full h-80 p-4 font-mono text-sm bg-transparent outline-none resize-none"
              style={{ color: "var(--text-primary)" }}
              placeholder="// Paste your Next.js file or generic code snippet here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
          </motion.div>
          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg font-medium transition-all text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanSearch className="w-5 h-5" />}
            {loading ? "Analyzing Code against Rules..." : "Run AI Review"}
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Analysis Report</h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full min-h-[360px] rounded-xl border p-6 flex flex-col relative"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--card-bg)" }}
          >
            {!result && !loading && (
              <div className="m-auto text-center flex flex-col items-center gap-3 opacity-50">
                <Code2 className="w-12 h-12 text-gray-500" />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Submit code to see the strict rules evaluation report here.
                </p>
              </div>
            )}
            {loading && (
              <div className="m-auto text-center flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-violet-400 animate-pulse">Running semantic routing & rules evaluation...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6 h-full flex flex-col overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    {result.severity.toLowerCase().includes("high") || result.severity.toLowerCase().includes("critical") ? (
                      <XCircle className="w-6 h-6 text-red-400" />
                    ) : result.severity.toLowerCase().includes("medium") ? (
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    )}
                    <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Status</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 uppercase tracking-wide">
                    {result.severity}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                    Violations
                  </h4>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {result.violations}
                  </div>
                </div>

                <div className="space-y-2 mt-auto pt-4">
                  <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                    Suggestions & Fixes
                  </h4>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {result.suggestions}
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
