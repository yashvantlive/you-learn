"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function LandingModal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2 text-slate-600 leading-relaxed space-y-4 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}