"use client";

import { motion } from "framer-motion";
import { CircleDot, ExternalLink, MessageSquare, Clock, User, AlertCircle, FolderGit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRepository } from "@/lib/RepositoryContext";
import Link from "next/link";

interface Issue {
  number: number;
  title: string;
  state: string;
  labels: { name: string; color: string }[];
  created_at: string;
  html_url: string;
  user: string;
  comments: number;
  body: string;
}

export default function IssuesPage() {
  const { selectedRepo } = useRepository();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoFullName, setRepoFullName] = useState("");

  useEffect(() => {
    if (!selectedRepo) return;

    const fetchIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/repos/${selectedRepo.id}/issues`);
        if (res.ok) {
          const data = await res.json();
          setIssues(data.issues);
          setRepoFullName(data.repo);
        } else {
          const errData = await res.json();
          setError(errData.detail || "Failed to fetch issues");
        }
      } catch (e) {
        setError("Error connecting to backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [selectedRepo]);

  function timeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  // No repo selected
  if (!selectedRepo) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <FolderGit2 className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Repository Selected</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Select an indexed repository from the Repositories page to view its open issues.
        </p>
        <Link
          href="/dashboard/repositories"
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go to Repositories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <CircleDot className="w-6 h-6 text-emerald-400" />
            Open Issues
          </h1>
          <p className="text-gray-400 mt-1">
            {repoFullName ? (
              <>
                Showing open issues for{" "}
                <span className="text-violet-400 font-medium">{repoFullName}</span>
              </>
            ) : (
              `Issues for ${selectedRepo.name}`
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{issues.length} issues</span>
          <a
            href={`${selectedRepo.url}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-violet-400">
            <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Fetching issues from GitHub...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Issues List */}
      {!loading && !error && (
        <div className="space-y-3">
          {issues.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <CircleDot className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No open issues</p>
              <p className="text-sm mt-1">This repository has no open issues right now.</p>
            </div>
          ) : (
            issues.map((issue, i) => (
              <motion.a
                key={issue.number}
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="block p-5 rounded-xl bg-[#16141c] border border-white/5 hover:border-violet-500/30 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <CircleDot className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors leading-snug">
                        {issue.title}
                        <span className="ml-2 text-gray-500 font-normal text-sm">#{issue.number}</span>
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors shrink-0 mt-1" />
                    </div>

                    {/* Labels */}
                    {issue.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {issue.labels.map((label) => (
                          <span
                            key={label.name}
                            className="px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: `#${label.color}20`,
                              borderColor: `#${label.color}40`,
                              color: `#${label.color}`,
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {issue.user}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(issue.created_at)}
                      </span>
                      {issue.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {issue.comments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
