"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { MathRenderer } from "@/components/math-renderer";
import { Flag, ChevronRight, ShieldAlert, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question { id: string; question: string; options: string[]; correctAnswer: string; }
interface BattleExamProps {
  questions: Question[];
  timeLimit: number;
  onSubmit: (responses: Map<string, string | null>) => void;
  onExit: () => void;
}

// ✅ 1. Extract & Memoize Question Card to prevent Layout Thrashing
const ExamQuestionCard = memo(({ 
  currentQ, 
  responses, 
  flagged, 
  handleSelect,
  toggleFlag,
  currentIndex 
}: any) => {
  return (
    <div className="w-full">
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-xl min-h-[500px]">
           <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentIndex + 1}</span>
              <button onClick={toggleFlag} className={`p-2 rounded-lg transition-colors ${flagged.has(currentQ.id) ? "bg-yellow-100 text-yellow-600" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}><Flag size={20} fill={flagged.has(currentQ.id) ? "currentColor" : "none"} /></button>
           </div>
           
           <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2 leading-relaxed mb-8">
             <MathRenderer text={currentQ.question} />
           </h2>
           
           <div className="space-y-4 mb-12">
             {currentQ.options.map((opt: string, idx: number) => {
               const isSelected = responses.get(currentQ.id) === opt;
               return (
                 <button 
                    key={idx} 
                    onClick={() => handleSelect(opt)} 
                    className={`w-full p-5 rounded-2xl border-2 text-left font-medium flex items-center gap-4 transition-all group ${isSelected ? "border-violet-600 bg-violet-50 text-violet-900 ring-1 ring-violet-600" : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"}`}
                 >
                   <span className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white"}`}>{String.fromCharCode(65+idx)}</span>
                   <span className="text-lg"><MathRenderer text={opt} /></span>
                 </button>
               )
             })}
           </div>
        </div>
    </div>
  );
});

export default function BattleExamInterface({ questions, timeLimit, onSubmit, onExit }: BattleExamProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [responses, setResponses] = useState<Map<string, string | null>>(new Map());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => { 
        if (prev <= 1) { 
          clearInterval(timer); 
          confirmFinish(); 
          return 0; 
        } 
        return prev - 1; 
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = useCallback((option: string) => {
    setResponses(prev => {
        const newMap = new Map(prev);
        newMap.set(questions[currentIndex].id, option);
        return newMap;
    });
  }, [currentIndex, questions]);

  const toggleFlag = useCallback(() => {
    setFlagged(prev => {
        const newSet = new Set(prev);
        const id = questions[currentIndex].id;
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        return newSet;
    });
  }, [currentIndex, questions]);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  const currentQ = questions[currentIndex];

  const triggerSubmit = () => setShowExitModal(true);

  const confirmFinish = useCallback(() => {
    setShowExitModal(false);
    // requestAnimationFrame ensures this runs smoothly before next repaint
    requestAnimationFrame(() => {
        onSubmit(responses);
    });
  }, [responses, onSubmit]);

  return (
    <div className="flex flex-col gap-6 pb-20 pt-6 bg-slate-50 min-h-screen max-w-5xl mx-auto px-4 relative">
      
      {/* HEADER */}
      <div className="w-full bg-white text-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between sticky top-4 z-20">
         <div className="flex items-center gap-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-500 uppercase text-xs tracking-widest">
               <ShieldAlert size={16} /> Proctored Exam
            </h3>
            <div className={`text-sm font-mono font-bold px-3 py-1 rounded-lg border transition-colors ${timeLeft < 60 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
               {formatTime(timeLeft)}
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="text-xs font-bold text-slate-400 hidden sm:block">
               Attempted: <span className="text-slate-900">{responses.size}/{questions.length}</span>
            </div>
            <button 
                onClick={triggerSubmit} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-lg transition-all active:scale-95"
            >
               Submit Now
            </button>
         </div>
      </div>

      {/* PALETTE */}
      <div className="w-full bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto flex gap-2 scrollbar-hide shadow-sm">
         {questions.map((q, idx) => {
            const isAnswered = responses.has(q.id);
            const isFlagged = flagged.has(q.id);
            const isCurrent = idx === currentIndex;
            
            let btnClass = "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200";
            if (isAnswered) btnClass = "bg-green-100 text-green-700 border-green-200";
            if (isFlagged) btnClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
            if (isCurrent) btnClass = "ring-2 ring-violet-500 border-violet-500 bg-white text-violet-700 shadow-md scale-105";

            return (
               <button 
                  key={q.id} 
                  onClick={() => setCurrentIndex(idx)} 
                  className={`flex-shrink-0 w-10 h-10 rounded-lg text-xs font-bold border transition-all ${btnClass}`}
               >
                  {idx + 1}
               </button>
            )
         })}
      </div>

      {/* ✅ Memoized Question Card */}
      <ExamQuestionCard 
        currentQ={currentQ}
        responses={responses}
        flagged={flagged}
        handleSelect={handleSelect}
        toggleFlag={toggleFlag}
        currentIndex={currentIndex}
      />

      <div className="flex justify-between items-center pt-6">
        <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all">Previous</button>
        <button 
            onClick={() => { 
                if (currentIndex === questions.length - 1) triggerSubmit(); 
                else setCurrentIndex(prev => prev + 1); 
            }} 
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${currentIndex === questions.length - 1 ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
        >
            {currentIndex === questions.length - 1 ? "Finish" : "Next"} <ChevronRight size={18} />
        </button>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-50">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Submit Exam?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to finish? You won't be able to change your answers later.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmFinish}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}