"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveGameHistory } from "@/lib/game-history"; 
import { RoomData, Player } from "../[roomId]/_hooks/useMultiplayer";
import { FileText, LayoutDashboard, ArrowRight, Loader2, CheckCircle, Home } from "lucide-react"; 
import Link from "next/link";
import { motion } from "framer-motion";

import BattleInstantInterface from "@/components/BattleInstantInterface";
import BattleExamInterface from "@/components/BattleExamInterface";

interface GameArenaProps {
  roomId: string;
  room: RoomData;
  playerId: string;
  submitAnswer: (points: number) => Promise<void>;
  nextQuestion: () => Promise<void>;
  isHost: boolean;
  players: Player[];
}

export default function GameArena({ 
  room, roomId, playerId, submitAnswer, nextQuestion, isHost, players 
}: GameArenaProps) {
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSavedHistory, setHasSavedHistory] = useState(false);
  
  // ✅ 1. Local state for instant UI feedback (Fixes lag perception)
  const [isSubmittedLocally, setIsSubmittedLocally] = useState(false);

  const startTimeRef = useRef(Date.now());
  const [userResponses, setUserResponses] = useState<Map<string, string | null>>(new Map());
  const [historyId, setHistoryId] = useState<string | null>(null);

  // Identify Current Player
  const me = players.find(p => p.id === playerId);

  // --- 1. FETCH QUESTIONS ---
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!room.config.questionIds?.length) return;
      try {
        const qPromises = room.config.questionIds.map(id => getDoc(doc(db, "questions", id)));
        const docs = await Promise.all(qPromises);
        setQuestions(docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [room.config.questionIds]);

  // --- 2. HOST AUTO-FINISH LOGIC ---
  useEffect(() => {
    // If Host AND all players submitted, finish the game
    if (isHost && players.length > 0 && room.gameState.status !== "finished") {
      const allSubmitted = players.every(p => p.status === 'submitted');
      
      // In Exam mode, wait for everyone.
      if (allSubmitted && room.config.quizMode === 'exam') {
        nextQuestion(); // This triggers game finish in backend
      }
    }
  }, [players, isHost, room.gameState.status, room.config.quizMode, nextQuestion]);


  // --- 3. CORE SAVING LOGIC ---
  const saveMyResult = async (finalResponses: Map<string, string | null>, finalScore: number) => {
    if (hasSavedHistory || !me) return;
    setHasSavedHistory(true); // Lock to prevent double saves

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    // Prepare Analysis Data
    const analysisData = questions.map(q => {
      const userAns = finalResponses.get(q.id) || null;
      return {
        questionId: q.id,
        question: q.question,
        userAnswer: userAns,
        correctAnswer: q.correctAnswer,
        isCorrect: userAns === q.correctAnswer,
        explanation: q.explanation || "No explanation available.",
        options: q.options
      };
    });

    const correctAnswersCount = analysisData.filter(a => a.isCorrect).length;
    const wrongAnswersCount = analysisData.filter(a => !a.isCorrect && a.userAnswer).length;
    const skippedAnswersCount = analysisData.filter(a => !a.userAnswer).length;

    // Save to Firestore (Fire & Forget style for UI, but await internally)
    saveGameHistory({
      userId: playerId,
      userName: me.name,
      gameId: roomId,
      mode: "multiplayer",
      type: room.config.quizMode,
      score: finalScore,
      totalQuestions: room.config.totalQuestions,
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      skippedAnswers: skippedAnswersCount,
      timeSpent,
      subject: room.config.subject || "General",
      board: room.config.board,
      class: room.config.class,
      difficulty: room.config.difficulty,
      questionsData: analysisData
    }).then((id) => {
        if (id) setHistoryId(id);
    });
  };

  // --- HANDLERS (Optimized with requestAnimationFrame) ---

  const handleExamSubmit = async (responses: Map<string, string | null>) => {
    // ✅ Step 1: Update UI Instantly (Removes lag feeling)
    setIsSubmittedLocally(true);

    // ✅ Step 2: Defer heavy logic to next animation frame (Fixes "Forced reflow" & "Click handler took..." violation)
    requestAnimationFrame(async () => {
        setUserResponses(responses);
        
        let correct = 0;
        questions.forEach(q => { if (responses.get(q.id) === q.correctAnswer) correct++; });
        const score = correct * 4;

        await submitAnswer(score); 
        await saveMyResult(responses, score);
    });
  };

  const handleInstantComplete = async (score: number, correct: number, streak: number, responses: Map<string, string | null>) => {
    setIsSubmittedLocally(true);
    
    requestAnimationFrame(async () => {
        setUserResponses(responses); 
        await submitAnswer(score);
        await saveMyResult(responses, score);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
        <p className="font-bold text-slate-500 animate-pulse">Loading Battle Arena...</p>
      </div>
    );
  }

  // --- WAITING SCREEN (Shown immediately after submit) ---
  if ((me?.status === 'submitted' || isSubmittedLocally) && room.gameState.status !== 'finished') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 animate-in fade-in">
         <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-200 max-w-md w-full">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-in zoom-in">
               <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Answers Submitted!</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Your result has been saved securely. <br/>
              Waiting for other players to finish...
            </p>
            
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-3 text-sm font-bold text-violet-700 bg-violet-50 py-4 px-6 rounded-2xl border border-violet-100 mb-2">
                   <Loader2 className="animate-spin" size={20} /> 
                   {players.filter(p => p.status === 'submitted').length}/{players.length} Players Done
                </div>

                {/* Users can leave safely as history is saved */}
                <Link 
                  href="/dashboard"
                  className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <Home size={18} /> Return to Dashboard
                </Link>
            </div>
         </div>
      </div>
    );
  }

  // --- RESULT SCREEN (Final) ---
  if (room.gameState.status === "finished") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md fixed inset-0 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6 border border-white/20"
        >
          <div className="mx-auto w-24 h-24 relative">
             <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30 rounded-full animate-pulse" />
             <div className="relative bg-gradient-to-br from-yellow-100 to-amber-100 w-full h-full rounded-full flex items-center justify-center text-5xl shadow-inner border-4 border-white">🏆</div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Battle Finished!</h2>
            <p className="text-slate-500 font-medium">Rankings have been updated</p>
          </div>
          
          <div className="space-y-3 pt-2">
            {historyId ? (
              <Link 
                href={`/history/${historyId}`} 
                className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet-200 group"
              >
                <FileText size={20} className="text-violet-200 group-hover:text-white" /> 
                View Analysis 
                <ArrowRight size={18} className="opacity-60 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                <CheckCircle size={20} className="text-green-500" /> Result Saved
              </button>
            )}
            
            <Link 
              href="/dashboard" 
              className="w-full py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <LayoutDashboard size={18} /> Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- PLAYING ARENA ---
  if (room.config.quizMode === "instant") {
    return (
      <BattleInstantInterface 
        questions={questions}
        timeLimit={room.config.timePerQuestion || 30}
        onComplete={handleInstantComplete}
        onExit={() => router.push('/dashboard')}
      />
    );
  }

  return (
    <BattleExamInterface 
      questions={questions}
      timeLimit={room.config.totalTime || 30}
      onSubmit={handleExamSubmit} 
      onExit={() => router.push('/dashboard')}
    />
  );
}