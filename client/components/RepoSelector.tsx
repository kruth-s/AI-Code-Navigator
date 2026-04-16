"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, FolderGit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RepoSelectorProps {
  repositories: { id: string | number; name: string }[];
  selectedRepo: string;
  setSelectedRepo: (repo: string) => void;
  accentClass?: string;
}

export default function RepoSelector({ repositories, selectedRepo, setSelectedRepo, accentClass = "text-indigo-400" }: RepoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 rounded-xl bg-black/20 border border-white/5 hover:bg-black/40 transition-colors"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <FolderGit2 className={`w-5 h-5 shrink-0 ${accentClass}`} />
          <span className={`font-medium truncate ${selectedRepo ? "text-gray-200" : "text-gray-500"}`}>
            {selectedRepo || "Select your repository..."}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 py-2 bg-[#1a1b23] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
          >
            {repositories.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No repositories found.</div>
            ) : (
              repositories.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRepo(r.name);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${
                    selectedRepo === r.name ? `text-white font-bold bg-white/5` : "text-gray-400 font-medium"
                  }`}
                >
                  <span className="truncate">{r.name}</span>
                  {selectedRepo === r.name && <Check className={`w-4 h-4 ${accentClass}`} />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
