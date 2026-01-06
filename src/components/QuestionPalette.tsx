"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Grid3x3, CheckCircle } from "lucide-react";
import { QuestionState, QUESTION_COLORS, getExamSummary } from "@/lib/examTypes";

interface QuestionPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  questions: any[];
  questionStates: Map<string, QuestionState>;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  variant?: "modal" | "sidebar";
  submitAction?: () => void; // ✅ New Prop for Submit Button
}

export default function QuestionPalette({
  isOpen,
  onClose,
  questions,
  questionStates,
  currentQuestionIndex,
  onQuestionSelect,
  variant = "modal",
  submitAction,
}: QuestionPaletteProps) {
  const summary = getExamSummary(questionStates);

  // --- Content Component ---
  const PaletteContent = () => (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-50">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Grid3x3 className="w-4 h-4 text-blue-600" />
          Question Palette
        </div>
        {variant === "modal" && (
          <button onClick={onClose} className="p-1 hover:bg-blue-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="p-3 grid grid-cols-2 gap-2 text-[10px] border-b border-slate-100 bg-white">
        {Object.entries(QUESTION_COLORS).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="w-5 h-5 flex-shrink-0 flex items-center justify-center font-bold border rounded-sm"
              style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }}
            >
              {key === "answered" ? "✓" : key === "not-answered" ? "✗" : ""}
            </div>
            <span className="text-slate-600 truncate">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Questions</h4>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, i) => {
            const state = questionStates.get(q.id);
            const status = state?.status || "not-visited"; 
            const config = QUESTION_COLORS[status];
            const isCurrent = i === currentQuestionIndex;

            return (
              <button
                key={q.id}
                onClick={() => { 
                  onQuestionSelect(i); 
                  if(variant === 'modal') onClose(); 
                }}
                className={`
                  relative h-9 w-full rounded text-sm font-bold border transition-all flex items-center justify-center
                  ${isCurrent ? "ring-2 ring-blue-500 ring-offset-1 z-10 scale-105" : "hover:brightness-95"}
                `}
                style={{ 
                  backgroundColor: config.bg, 
                  color: config.text, 
                  borderColor: config.border 
                }}
              >
                {i + 1}
                {status === "answered-marked" && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-900 text-xs">Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex justify-between px-2 py-1 bg-green-100 rounded text-green-800">
            <span>Answered</span> <span className="font-bold">{summary.answered}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-red-100 rounded text-red-800">
            <span>Not Ans</span> <span className="font-bold">{summary.notAnswered}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-purple-100 rounded text-purple-800">
            <span>Review</span> <span className="font-bold">{summary.markedForReview}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-gray-200 rounded text-gray-800">
            <span>Not Visit</span> <span className="font-bold">{summary.notVisited}</span>
          </div>
        </div>

        {/* ✅ Submit Button inside Sidebar (Mobile Friendly) */}
        {submitAction && (
          <button 
            onClick={submitAction}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            Submit Exam <CheckCircle size={16} />
          </button>
        )}
      </div>
    </div>
  );

  // --- Render Logic ---
  if (variant === "sidebar") {
    if (!isOpen) return null;
    return <div className="h-full w-80 flex-shrink-0 hidden md:block"><PaletteContent /></div>;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl z-50 md:hidden">
            <PaletteContent />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}