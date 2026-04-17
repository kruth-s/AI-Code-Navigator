"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomDropdownProps {
  options: string[];
  selected: string;
  setSelected: (option: string) => void;
  label?: string;
  accentClass?: string;
}

export default function CustomDropdown({ 
  options, 
  selected, 
  setSelected, 
  label = "Select an option", 
  accentClass = "text-emerald-400" 
}: CustomDropdownProps) {
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
        className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors h-[38px]"
      >
        <span className={`text-xs font-medium truncate ${selected ? "text-gray-200" : "text-gray-500"}`}>
          {selected || label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] w-full mt-2 py-2 bg-[#1a1b23] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                  selected === option ? `text-white font-bold bg-white/5` : "text-gray-400 font-medium"
                }`}
              >
                <span className="truncate">{option}</span>
                {selected === option && <Check className={`w-3.5 h-3.5 ${accentClass}`} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
