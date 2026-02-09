"use client";

import { useState } from "react";
import { Send, User, Sparkles, Code2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'Hello! I am Akaza. Connect a repository and ask me anything about your codebase.' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userInput = input;
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error connecting to the server. Please ensure the backend is running." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
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
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-[#2b2934] text-white border border-white/5' 
                : 'bg-transparent text-gray-300'
            }`}>
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {msg.content.split('```').map((part, index) => {
                      if (index % 2 === 1) {
                          // Very simple code block handling
                          return (
                              <div key={index} className="my-2 p-3 bg-black/50 rounded-lg border border-white/10 font-mono text-xs overflow-x-auto text-violet-200">
                                  {part}
                              </div>
                          );
                      }
                      return <span key={index}>{part}</span>;
                  })}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="pt-4 mt-auto">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your connected repos..." 
            className="w-full h-14 bg-[#16141c] border border-white/10 rounded-xl pl-5 pr-14 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-sans"
          />
          <button 
            type="submit"
            disabled={loading}
            className={`absolute right-2 top-2 h-10 w-10 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-violet-500/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-xs text-center text-gray-600 mt-2">
           AI can make mistakes. Please verify important code information.
        </p>
      </div>
    </div>
  );
}
