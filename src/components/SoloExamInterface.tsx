"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MathRenderer } from "@/components/math-renderer";
import { Flag, ChevronRight, Menu, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question { id: string; question: string; options: string[]; correctAnswer: string; }
interface SoloExamProps {
  questions: Question[];
  timeLimit: number;
  onSubmit: (responses: Map<string, string | null>) => void;
  onExit: () => void;
}

export default function SoloExamInterface({ questions, timeLimit, onSubmit, onExit }: SoloExamProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [responses, setResponses] = useState<Map<string, string | null>>(new Map());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  
  // ✅ Custom Modal State
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Internal lock to prevent double submit

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  const currentQ = questions[currentIndex];

  // ✅ Auto Submit Logic (Timer)
  const autoFinishExam = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
        onSubmit(responses);
    }, 50);
  }, [responses, onSubmit]);

  useEffect(() => {
    if (isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => { 
        if (prev <= 1) { 
          clearInterval(timer); 
          autoFinishExam(); 
          return 0; 
        } 
        return prev - 1; 
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitting, autoFinishExam]);

  const handleSelect = (option: string) => {
    const newResponses = new Map(responses);
    newResponses.set(questions[currentIndex].id, option);
    setResponses(newResponses);
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(questions[currentIndex].id)) newFlagged.delete(questions[currentIndex].id); 
    else newFlagged.add(questions[currentIndex].id);
    setFlagged(newFlagged);
  };

  // ✅ Manual Finish Logic (Triggers Modal)
  const triggerFinish = () => {
    setShowExitModal(true);
  };

  // ✅ Confirmed Finish (From Modal)
  const confirmFinish = () => {
    setShowExitModal(false);
    setIsSubmitting(true);
    setTimeout(() => {
       onSubmit(responses);
    }, 50);
  };

  return (
    <div className="flex flex-col gap-6 pb-20 pt-6 bg-slate-50 min-h-screen max-w-5xl mx-auto px-4 relative">
      
      {/* ✅ TOP HEADER (Rectangular) */}
      <div className="w-full bg-white text-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-20">
         
         <div className="flex items-center gap-4">
            <h3 className="font-black flex items-center gap-2 text-slate-500 uppercase text-xs tracking-widest">
               <Menu size={16} /> Exam Panel
            </h3>
            <div className={`text-sm font-mono font-bold px-3 py-1 rounded-lg border flex items-center gap-2 transition-colors ${timeLeft < 60 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-700 border-slate-100"}`}>
               <Clock size={14} /> {formatTime(timeLeft)}
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="text-xs font-bold text-slate-400 hidden sm:block">
               Solved: <span className="text-slate-900">{responses.size}/{questions.length}</span>
            </div>
            <button 
              type="button" 
              onClick={triggerFinish} 
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95"
            >
               Submit Exam
            </button>
         </div>
      </div>

      {/* ✅ HORIZONTAL PALETTE (Scrollable Strip) */}
      <div className="w-full bg-white p-3 rounded-2xl border border-slate-200 overflow-x-auto flex gap-2 scrollbar-hide shadow-sm">
         {questions.map((q, idx) => {
            const isAnswered = responses.has(q.id);
            const isFlagged = flagged.has(q.id);
            const isCurrent = idx === currentIndex;
            
            let btnClass = "bg-slate-50 text-slate-400 hover:bg-slate-100 border-slate-100";
            if (isAnswered) btnClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
            if (isFlagged) btnClass = "bg-amber-100 text-amber-700 border-amber-200";
            if (isCurrent) btnClass = "ring-2 ring-violet-600 border-violet-600 bg-white text-violet-700 font-black shadow-md scale-105";

            return (
               <button 
                  key={q.id} 
                  type="button"
                  onClick={() => { setCurrentIndex(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className={`flex-shrink-0 w-10 h-10 rounded-xl text-xs font-bold border transition-all ${btnClass}`}
               >
                  {idx + 1}
                  {isFlagged && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full border border-white" />}
               </button>
            )
         })}
      </div>

      {/* ✅ MAIN QUESTION CARD */}
      <div className="w-full">
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-xl relative min-h-[500px]">
           
           <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Question {currentIndex + 1}
              </span>
              
              {/* ✅ Responsive Flag Button */}
              <button 
                type="button" 
                onClick={toggleFlag} 
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${flagged.has(currentQ.id) ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                <Flag size={18} fill={flagged.has(currentQ.id) ? "currentColor" : "none"} />
                {/* Desktop Text */}
                <span className="hidden md:inline">{flagged.has(currentQ.id) ? "Flagged for Review" : "Flag Question"}</span>
              </button>
           </div>
           
           <div className="mb-10">
             <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
               <MathRenderer text={currentQ.question} />
             </h2>
           </div>
           
           <div className="space-y-4 mb-12">
             {currentQ.options.map((opt, idx) => {
               const isSelected = responses.get(currentQ.id) === opt;
               return (
                 <button 
                    key={idx} 
                    type="button"
                    onClick={() => handleSelect(opt)} 
                    className={`w-full p-5 rounded-2xl border-2 text-left font-medium flex items-center gap-5 transition-all group ${isSelected ? "border-violet-600 bg-violet-50 text-violet-900 ring-1 ring-violet-600 shadow-md" : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"}`}
                 >
                   <span className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white"}`}>{String.fromCharCode(65+idx)}</span>
                   <span className="text-lg leading-relaxed"><MathRenderer text={opt} /></span>
                   {isSelected && <CheckCircle className="ml-auto text-violet-600 w-5 h-5" />}
                 </button>
               )
             })}
           </div>
           
           <div className="flex justify-between items-center pt-8 border-t border-slate-100">
             <button 
               type="button" 
               onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} 
               disabled={currentIndex === 0} 
               className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all active:scale-95"
             >
               Previous
             </button>
             
             <button 
                type="button"
                onClick={() => { 
                    if (currentIndex === questions.length - 1) {
                        triggerFinish(); 
                    } else {
                        setCurrentIndex(prev => prev + 1); 
                    }
                }} 
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl transition-all active:scale-95 ${currentIndex === questions.length - 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
             >
               {currentIndex === questions.length - 1 ? "Finish Exam" : "Next"} <ChevronRight size={18} />
             </button>
           </div>
        </div>
      </div>

      {/* ✅ CUSTOM CONFIRMATION CARD POPUP */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-6 border border-slate-100"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-50">
                <CheckCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Submit Exam?</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  You have attempted <span className="font-bold text-slate-800">{responses.size}</span> out of <span className="font-bold text-slate-800">{questions.length}</span> questions. 
                  <br/>Once submitted, you cannot change your answers.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Return
                </button>
                <button 
                  onClick={confirmFinish}
                  className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl"
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