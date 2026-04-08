"use client";

import { useState, useEffect } from "react";
import "streamdown/styles.css";
import { Streamdown } from "streamdown";
import { Send, User, Sparkles, Code2, Copy, Check, FolderGit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRepository } from "@/lib/RepositoryContext";
import Link from "next/link";

export default function ChatPage() {
  const { selectedRepo, repositories } = useRepository();
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Update welcome message based on selected repo
  useEffect(() => {
    if (selectedRepo) {
      setMessages([
        { 
          role: 'assistant', 
          content: `Hello! I'm Akaza. I'm ready to answer questions about **${selectedRepo.name}**. What would you like to know?` 
        }
      ]);
    } else if (repositories.length > 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: 'Hello! I am Akaza. You have repositories connected. Please select one from the Repositories page to start chatting.' 
        }
      ]);
    } else {
      setMessages([
        { 
          role: 'assistant', 
          content: 'Hello! I am Akaza. Connect a repository and ask me anything about your codebase.' 
        }
      ]);
    }
  }, [selectedRepo, repositories]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userInput = input;
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInput("");
    setLoading(true);

    if (!selectedRepo) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Please select a repository from the Repositories page first." 
      }]);
      setLoading(false);
      return;
    }

    try {
      console.log('Selected Repository:', selectedRepo);
      console.log('Sending repo_id:', selectedRepo?.id);
      
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userInput,
          repo_id: selectedRepo.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer 
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message || "Sorry, I encountered an error connecting to the server. Please ensure the backend is running." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Selected Repository Banner */}
      {selectedRepo && (
        <div
          className="mb-4 p-4 rounded-lg flex items-center justify-between"
          style={{ backgroundColor: 'var(--bg-active)', border: '1px solid var(--border-accent)' }}
        >
          <div className="flex items-center gap-3">
            <FolderGit2 className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Currently chatting about:</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRepo.name}</p>
            </div>
          </div>
          <Link 
            href="/dashboard/repositories"
            className="text-sm transition-colors"
            style={{ color: 'var(--text-accent)' }}
          >
            Change repository →
          </Link>
        </div>
      )}
      
      {!selectedRepo && repositories.length > 0 && (
        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-200">
            No repository selected. <Link href="/dashboard/repositories" className="text-amber-400 hover:text-amber-300 underline">Select a repository</Link> to start chatting.
          </p>
        </div>
      )}
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-4">
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className="max-w-[80%] rounded-2xl p-4"
              style={msg.role === 'user'
                ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }
                : { backgroundColor: 'transparent', color: 'var(--text-secondary)' }
              }
            >
              <div className="font-sans text-sm leading-relaxed prose prose-invert max-w-none">
                {msg.role === 'assistant' ? (
                  <Streamdown 
                    isAnimating={loading && i === messages.length - 1} 
                    animated
                    components={{
                      p: ({ children }: any) => <div className="mb-4 last:mb-0">{children}</div>,
                      a: ({ children, node, ...props }: any) => <a {...props} style={{ color: 'var(--text-accent)' }} className="hover:underline">{children}</a>,
                      ul: ({ children }: any) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
                      ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
                      li: ({ children }: any) => <li className="mb-1">{children}</li>,
                    }}
                  >
                    {msg.content}
                  </Streamdown>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1"
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                <User className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="pt-4 mt-auto">
        <form onSubmit={handleSend} className="relative">
          <textarea 
            ref={(el) => {
              if (el) {
                el.style.height = '56px';
                const scrollHeight = el.scrollHeight;
                el.style.height = scrollHeight > 150 ? '150px' : Math.max(56, scrollHeight) + 'px';
              }
            }}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask a question about your connected repos..." 
            className="w-full min-h-14 max-h-37.5 rounded-xl pl-5 pr-14 py-4 focus:outline-none font-sans resize-none scrollbar-hide leading-normal"
            style={{
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--border-secondary)',
              color: 'var(--text-primary)',
            }}
            rows={1}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 bottom-2 h-10 w-10 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)', boxShadow: `0 4px 14px var(--accent-glow)` }}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
           AI can make mistakes. Please verify important code information.
        </p>
      </div>
    </div>
  );
}
