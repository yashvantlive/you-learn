"use client";

import Link from "next/link";
import { Trophy, RotateCcw, FileText, LayoutDashboard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface SoloResultProps {
  score: number;
  correct: number;
  totalQuestions: number;
  timeSpent: number;
  historyId: string | null; // ✅ ID received from parent
  onRetry: () => void;
}

export default function SoloResult({ 
  score, correct, totalQuestions, timeSpent, historyId, onRetry 
}: SoloResultProps) {
  
  const percentage = Math.round((correct / totalQuestions) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md w-full p-8 text-center space-y-8 shadow-2xl rounded-3xl border border-white/50"
      >
        
        {/* Trophy Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
            <Trophy className="w-12 h-12 text-yellow-600 drop-shadow-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Session Complete!</h1>
          <p className="text-slate-500 font-medium">Here is how you performed</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-violet-50 rounded-2xl border border-violet-100 flex flex-col items-center gap-1">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-wider">Score</p>
            <p className="text-3xl font-black text-violet-700">{score}</p>
          </div>
          <div className="p-5 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center gap-1">
            <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Accuracy</p>
            <p className="text-3xl font-black text-green-700">{percentage}%</p>
          </div>
          
          {/* Detailed Stats Row */}
          <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center px-8">
             <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Correct</p>
                <p className="text-lg font-black text-slate-800">{correct}/{totalQuestions}</p>
             </div>
             <div className="w-px h-8 bg-slate-200" />
             <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Time</p>
                <p className="text-lg font-black text-slate-800">{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</p>
             </div>
          </div>
        </div>

        {/* Actions Area */}
        <div className="space-y-3 pt-2">
          
          {/* ✅ Primary Button: View Analysis */}
          {historyId ? (
            <Link 
              href={`/history/${historyId}`}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 group"
            >
              <FileText size={20} className="text-slate-300 group-hover:text-white transition-colors" /> 
              View Analysis
              <ArrowRight size={18} className="opacity-50 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
               <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
               Saving Result...
            </button>
          )}

          <div className="flex gap-3">
            <button 
              onClick={onRetry} 
              className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Retry
            </button>
            
            <Link 
              href="/dashboard" 
              className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} /> Home
            </Link>
          </div>
        </div>

      </motion.div>
    </div>
  );
}