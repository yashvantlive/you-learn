"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { MathRenderer } from "@/components/math-renderer";
import { Clock, CheckCircle, XCircle, ArrowRight, BookOpen, Target, Flame, Trophy, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface SoloInstantProps {
  questions: Question[];
  timeLimit: number;
  onComplete: (score: number, correct: number, streak: number, responses: Map<string, string | null>) => void;
  onExit: () => void;
}

// ✅ Memoized Question Card (No Changes, just keeps things fast)
const QuestionCard = memo(({ 
  currentQuestion, 
  selectedOption, 
  isAnswered, 
  handleAnswer 
}: { 
  currentQuestion: Question, 
  selectedOption: string | null, 
  isAnswered: boolean, 
  handleAnswer: (opt: string) => void 
}) => {
  return (
    <div className="w-full">
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-xl relative min-h-[400px]">
          <div className="mb-8">
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 leading-normal">
              <MathRenderer text={currentQuestion.question} />
            </h2>
          </div>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              
              let btnClass = "border-slate-200 hover:border-violet-400 hover:bg-slate-50 text-slate-700";
              
              if (isAnswered) {
                btnClass = "cursor-default opacity-60";
                if (isCorrect) {
                    btnClass = "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500 !opacity-100 shadow-md scale-[1.01]";
                } else if (isSelected && !isCorrect) {
                    btnClass = "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500 !opacity-100";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={`w-full p-5 rounded-2xl border-2 text-left font-medium transition-all flex items-center gap-5 group ${btnClass}`}
                >
                   <span className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${isAnswered && isCorrect ? 'bg-green-200 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                      {String.fromCharCode(65 + idx)}
                   </span>
                   <div className="flex-1 text-lg leading-relaxed break-words">
                      <MathRenderer text={option} />
                   </div>
                   {isAnswered && isCorrect && <CheckCircle className="text-green-600 flex-shrink-0" />}
                   {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mt-10 pt-8 border-t border-slate-100 space-y-6"
              >
                <div className="bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <BookOpen size={120} className="text-blue-600" />
                  </div>

                  <h3 className="text-xs font-black text-blue-600 uppercase mb-4 flex items-center gap-2 relative z-10">
                    <BookOpen size={16} /> Explanation
                  </h3>
                  
                  <div className="text-base md:text-lg leading-relaxed text-slate-800 font-medium relative z-10 [&_.katex]:inline [&_.katex-display]:inline">
                    {currentQuestion.explanation ? (
                      <MathRenderer text={currentQuestion.explanation} />
                    ) : (
                      <span className="italic opacity-50">No explanation provided.</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
});

export default function SoloInstantInterface({ questions, timeLimit, onComplete, onExit }: SoloInstantProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [responses, setResponses] = useState<Map<string, string | null>>(new Map());
  
  // ✅ Custom Modal State (No Browser Alert)
  const [showExitModal, setShowExitModal] = useState(false);
  const bottomRef = useRef<HTMLButtonElement>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswer = useCallback((option: string | null) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedOption(option);

    setResponses(prev => {
        const newMap = new Map(prev);
        newMap.set(currentQuestion.id, option);
        return newMap;
    });

    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 10 + streak * 2);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  }, [isAnswered, currentQuestion.id, currentQuestion.correctAnswer, streak]);

  useEffect(() => {
    if (isAnswered || showExitModal) return;
    if (timeLeft <= 0) { 
      handleAnswer(null); 
      return; 
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, showExitModal, handleAnswer]);

  useEffect(() => {
    if (isAnswered) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 300);
    }
  }, [isAnswered]);

  // ✅ Trigger Custom Modal instead of window.confirm
  const handleNextClick = () => {
    if (isLastQuestion) {
        setShowExitModal(true);
    } else {
        handleNextQuestion();
    }
  };

  const handleNextQuestion = () => {
    setCurrentIndex((prev) => prev + 1);
    setTimeLeft(timeLimit);
    setIsAnswered(false);
    setSelectedOption(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ FIX: Use setTimeout to defer heavy update, solving the Click Violation
  const confirmFinish = () => {
    setShowExitModal(false); // Close modal first (Visual feedback)

    setTimeout(() => {
        let finalCorrect = 0;
        responses.forEach((val, key) => {
          const q = questions.find(q => q.id === key);
          if (q && val === q.correctAnswer) finalCorrect++;
        });

        if (!responses.has(currentQuestion.id) && selectedOption === currentQuestion.correctAnswer) {
             finalCorrect++;
        }

        onComplete(score, finalCorrect, streak, responses);
    }, 50); // Small delay lets UI update before heavy navigation
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-5xl mx-auto px-4 bg-slate-50 min-h-screen pt-6 text-slate-900 relative">
      
      {/* HEADER */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm sticky top-4 z-20">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest">
               <Target size={16} /> Solo Session
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm font-mono font-bold border transition-colors ${timeLeft < 10 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-700 border-slate-100"}`}>
               <Clock size={14} className="inline mr-1 mb-0.5" /> {timeLeft}s
            </div>
         </div>
         <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            <span className="text-2xl font-black text-violet-600">{score} <span className="text-xs text-slate-400 ml-1">XP</span></span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
               <Flame className={`w-4 h-4 ${streak > 0 ? "text-orange-500 fill-orange-500 animate-bounce" : "text-slate-300"}`} />
               <span className="font-bold text-orange-600">{streak}x</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">
               <span className="text-xs text-blue-500 font-bold uppercase">Ques</span>
               <span className="font-bold text-blue-600">{currentIndex + 1}<span className="text-slate-400">/{questions.length}</span></span>
            </div>
         </div>
      </div>

      <QuestionCard 
        currentQuestion={currentQuestion}
        selectedOption={selectedOption}
        isAnswered={isAnswered}
        handleAnswer={handleAnswer}
      />

      <div className="flex justify-end w-full">
        {isAnswered && (
            <button 
            ref={bottomRef} 
            type="button"
            onClick={handleNextClick} 
            className={`px-10 py-4 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all ${isLastQuestion ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"}`}
            >
            {isLastQuestion ? "Finish Session" : "Next Question"} <ArrowRight size={20} />
            </button>
        )}
      </div>

      {/* ✅ CUSTOM CONFIRMATION CARD POPUP */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Finish Session?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to submit your answers? This will end your current session.
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
                  className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}