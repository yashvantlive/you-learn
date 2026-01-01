"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Question } from "@/types";

// --- TYPES & MOCK DATA (बाद में Firebase से आएगा) ---
type GameState = "SUBJECT_SELECT" | "CHAPTER_SELECT" | "PLAYING" | "RESULT";

const SUBJECTS = [
  { id: "math", name: "Mathematics", icon: Icons.game, color: "bg-blue-500", gradient: "from-blue-500 to-cyan-500" },
  { id: "science", name: "Science", icon: Icons.trophy, color: "bg-emerald-500", gradient: "from-emerald-500 to-teal-500" },
  { id: "social", name: "Social Science", icon: Icons.users, color: "bg-orange-500", gradient: "from-orange-500 to-amber-500" },
  { id: "english", name: "English", icon: Icons.user, color: "bg-violet-500", gradient: "from-violet-500 to-purple-500" },
];

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "The decimal expansion of the rational number 14587/1250 will terminate after:",
    options: ["One decimal place", "Two decimal places", "Three decimal places", "Four decimal places"],
    correct: 3,
    explanation: "1250 = 2 × 5⁴. The highest power of 5 is 4, so it terminates after 4 places.",
    difficulty: "medium",
    subject: "math",
    chapter: "Real Numbers"
  },
  {
    id: "q2",
    question: "Which of the following is NOT an irrational number?",
    options: ["√2", "√3", "√4", "√5"],
    correct: 2,
    explanation: "√4 = 2, which is a rational number.",
    difficulty: "easy",
    subject: "math",
    chapter: "Real Numbers"
  }
];

export default function SoloPage() {
  const [gameState, setGameState] = useState<GameState>("SUBJECT_SELECT");
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  
  // Game State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // --- ACTIONS ---

  const handleSubjectSelect = (subject: any) => {
    setSelectedSubject(subject);
    setGameState("CHAPTER_SELECT");
  };

  const startQuiz = () => {
    setGameState("PLAYING");
    setCurrentQIndex(0);
    setScore(0);
    resetQuestion();
  };

  const handleAnswer = (index: number) => {
    if (isAnswerRevealed) return;
    setSelectedOption(index);
    setIsAnswerRevealed(true);
    if (index === MOCK_QUESTIONS[currentQIndex].correct) {
      setScore(s => s + 100);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex + 1 < MOCK_QUESTIONS.length) {
      setCurrentQIndex(p => p + 1);
      resetQuestion();
    } else {
      setGameState("RESULT");
    }
  };

  const resetQuestion = () => {
    setSelectedOption(null);
    setIsAnswerRevealed(false);
  };

  // --- VIEWS ---

  if (gameState === "SUBJECT_SELECT") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Select Subject</h1>
          <p className="text-slate-500">Choose a subject to start your practice session</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUBJECTS.map((sub) => (
            <Card 
              key={sub.id} 
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group border-0 shadow-md relative overflow-hidden"
              onClick={() => handleSubjectSelect(sub)}
            >
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${sub.gradient}`} />
              <CardContent className="p-6 flex items-center gap-4 relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sub.gradient} flex items-center justify-center text-white shadow-md`}>
                  <sub.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{sub.name}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-violet-600 transition-colors">Tap to explore chapters</p>
                </div>
                <Icons.arrowRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === "CHAPTER_SELECT") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
        <Button variant="ghost" onClick={() => setGameState("SUBJECT_SELECT")} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
          <Icons.arrowRight className="rotate-180 w-4 h-4" /> Back to Subjects
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
           <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedSubject.gradient} flex items-center justify-center text-white`}>
              <selectedSubject.icon className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
             <p className="text-slate-500">Select a chapter</p>
           </div>
        </div>

        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map((num) => (
            <Card key={num} onClick={startQuiz} className="cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-colors group">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                    {num}
                  </div>
                  <span className="font-medium text-slate-700">Real Numbers & Polynomials</span>
                </div>
                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === "PLAYING") {
    const q = MOCK_QUESTIONS[currentQIndex];
    const progress = ((currentQIndex) / MOCK_QUESTIONS.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
        {/* Header & Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-slate-500">
            <span>Question {currentQIndex + 1}/{MOCK_QUESTIONS.length}</span>
            <span className="text-violet-600 font-bold">Score: {score}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-lg border-t-4 border-t-violet-600">
          <CardContent className="p-6 md:p-8 space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-800">
              {q.question}
            </h3>

            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                let statusClass = "border-slate-200 hover:border-violet-300 hover:bg-violet-50";
                if (isAnswerRevealed) {
                  if (idx === q.correct) statusClass = "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_#10b981]";
                  else if (idx === selectedOption) statusClass = "border-rose-500 bg-rose-50 text-rose-700 shadow-[0_0_0_1px_#f43f5e]";
                  else statusClass = "opacity-50 border-slate-100";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerRevealed}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 font-medium text-slate-700",
                      statusClass
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border",
                      isAnswerRevealed && idx === q.correct ? "bg-emerald-600 border-emerald-600 text-white" : 
                      isAnswerRevealed && idx === selectedOption ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-slate-300 text-slate-500"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Explanation Footer */}
            {isAnswerRevealed && (
              <div className="pt-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-slate-900 mb-1">Explanation:</p>
                  <p className="text-sm text-slate-600">{q.explanation}</p>
                </div>
                <Button size="lg" onClick={nextQuestion} className="w-full font-bold shadow-md">
                  Next Question <Icons.arrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === "RESULT") {
    const percentage = Math.round((score / (MOCK_QUESTIONS.length * 100)) * 100);
    
    return (
      <div className="max-w-md mx-auto text-center pt-10 animate-in zoom-in-95 duration-500">
        <Card className="shadow-xl overflow-hidden">
          <div className="bg-violet-600 p-8 text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Icons.trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-1">Good Job!</h2>
            <p className="text-violet-200">You completed the practice</p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Score</p>
                <p className="text-2xl font-bold text-slate-900">{score}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Accuracy</p>
                <p className="text-2xl font-bold text-slate-900">{percentage}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button size="lg" onClick={startQuiz} className="w-full font-bold">
                <Icons.game className="mr-2 w-4 h-4" /> Practice Again
              </Button>
              <Button variant="outline" size="lg" onClick={() => setGameState("SUBJECT_SELECT")} className="w-full">
                Choose Another Subject
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}