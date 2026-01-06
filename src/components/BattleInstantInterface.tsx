"use client";

import { useState, useEffect, useRef } from "react";
import { MathRenderer } from "@/components/math-renderer";
import { Clock, CheckCircle, XCircle, ArrowRight, Swords, Flame, Zap, Trophy, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string; question: string; options: string[]; correctAnswer: string; explanation?: string;
}

interface BattleInstantProps {
  questions: Question[];
  timeLimit: number;
  onComplete: (score: number, correct: number, streak: number, responses: Map<string, string | null>) => void;
  onExit: () => void;
}

export default function BattleInstantInterface({ questions, timeLimit, onComplete, onExit }: BattleInstantProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [responses, setResponses] = useState<Map<string, string | null>>(new Map());
  const bottomRef = useRef<HTMLButtonElement>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    if (isAnswered) return;
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, currentIndex]);

  const handleAnswer = (option: string | null) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);
    const newResponses = new Map(responses);
    newResponses.set(currentQuestion.id, option);
    setResponses(newResponses);

    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 10 + streak * 2);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
       let finalCorrect = 0;
       if (selectedOption === currentQuestion.correctAnswer) finalCorrect++;
       responses.forEach((val, key) => { if(key !== currentQuestion.id) { const q = questions.find(q=>q.id===key); if(q && val === q.correctAnswer) finalCorrect++; }});
       onComplete(score, finalCorrect, streak, responses);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(timeLimit);
      setIsAnswered(false);
      setSelectedOption(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    // ✅ Changed bg-slate-900 to bg-slate-50 and text-white to text-slate-900
    <div className="flex flex-col gap-6 pb-20 max-w-5xl mx-auto px-4 bg-slate-50 min-h-screen pt-6 text-slate-900">
      
      {/* TOP HEADER: Stats Bar (Light Mode) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
         
         {/* Left: Title & Timer */}
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest">
               <Swords size={16} /> Battle Arena
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm font-mono font-bold border ${timeLeft < 10 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-700 border-slate-100"}`}>
               {timeLeft}s
            </div>
         </div>

         {/* Center: Score */}
         <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            <span className="text-2xl font-black text-violet-600">
               {score} <span className="text-xs text-slate-400 ml-1">XP</span>
            </span>
         </div>

         {/* Right: Streak & Count */}
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
               <Flame className={`w-4 h-4 ${streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-300"}`} />
               <span className="font-bold text-orange-600">{streak}x</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">
               <span className="text-xs text-blue-500 font-bold uppercase">Ques</span>
               <span className="font-bold text-blue-600">{currentIndex + 1}<span className="text-slate-400">/{questions.length}</span></span>
            </div>
         </div>
      </div>

      {/* FULL WIDTH QUESTION CARD (Light Mode) */}
      <div className="w-full">
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-xl relative min-h-[400px]">
          
          <div className="mb-8">
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 leading-normal"><MathRenderer text={currentQuestion.question} /></h2>
          </div>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              
              // ✅ Updated Colors for Light Theme
              let btnClass = "border-slate-200 hover:border-violet-400 hover:bg-slate-50 text-slate-700";
              
              if (isAnswered) {
                btnClass = "cursor-default opacity-60";
                if (isCorrect) btnClass = "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500 !opacity-100";
                else if (isSelected && !isCorrect) btnClass = "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500 !opacity-100";
              }

              return (
                <button key={idx} onClick={() => handleAnswer(option)} disabled={isAnswered} className={`w-full p-5 rounded-2xl border-2 text-left font-medium transition-all flex items-center gap-5 ${btnClass}`}>
                   <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-slate-100 text-slate-500">{String.fromCharCode(65 + idx)}</span>
                   <div className="flex-1 text-lg leading-relaxed"><MathRenderer text={option} /></div>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {isAnswered && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 pt-8 border-t border-slate-100 space-y-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-slate-700">
                  <h3 className="text-xs font-black text-blue-500 uppercase mb-3 flex items-center gap-2">
                    <BookOpen size={16} /> Explanation
                  </h3>
                  <div className="text-base leading-relaxed">{currentQuestion.explanation || "No explanation."}</div>
                </div>
                <div className="flex justify-end">
                  <button ref={bottomRef} onClick={handleNext} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all">
                    {isLastQuestion ? "Finish Battle" : "Next Question"} <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}