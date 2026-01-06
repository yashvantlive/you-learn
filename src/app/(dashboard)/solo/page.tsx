"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { saveGameHistory } from "@/lib/game-history"; 
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic"; // ✅ 1. Import dynamic

import SoloSetup from "./_components/SoloSetup";
import SoloResult from "./_components/SoloResult";

// ✅ 2. Use Dynamic Imports for heavy game interfaces
const SoloInstantInterface = dynamic(() => import("@/components/SoloInstantInterface"), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>,
  ssr: false // Game components usually rely on window/browser APIs
});

const SoloExamInterface = dynamic(() => import("@/components/SoloExamInterface"), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>,
  ssr: false
});

type AppState = "setup" | "loading-game" | "playing" | "result";
type QuizMode = "instant" | "exam";

interface Question {
  id: string;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  difficulty: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface GameResults {
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeSpent: number;
  responses?: Map<string, string | null>;
}

// Constants
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];
const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30, 50];
const TIME_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function SoloPracticePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(true);
  const [allFetchedQuestions, setAllFetchedQuestions] = useState<Question[]>([]);
  
  // Filters
  const [board, setBoard] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Mixed");

  // Config
  const [mode, setMode] = useState<QuizMode>("instant");
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);

  // Game State
  const [appState, setAppState] = useState<AppState>("setup");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [finalResults, setFinalResults] = useState<GameResults | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const q = query(collection(db, "questions"), limit(2000));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Question[];
        setAllFetchedQuestions(fetched);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchMetadata();
  }, []);

  const availableBoards = useMemo(() => [...new Set(allFetchedQuestions.map(q => q.board))].sort(), [allFetchedQuestions]);
  
  const availableClasses = useMemo(() => {
    if (!board) return [];
    return [...new Set(allFetchedQuestions.filter(q => q.board === board).map(q => q.class))].sort();
  }, [allFetchedQuestions, board]);

  const availableSubjects = useMemo(() => {
    if (!board || !selectedClass) return [];
    return [...new Set(allFetchedQuestions.filter(q => q.board === board && q.class === selectedClass).map(q => q.subject))].sort();
  }, [allFetchedQuestions, board, selectedClass]);

  const availableChapters = useMemo(() => {
    if (!board || !selectedClass || selectedSubjects.length !== 1) return [];
    return [...new Set(allFetchedQuestions.filter(q => q.board === board && q.class === selectedClass && q.subject === selectedSubjects[0]).map(q => q.chapter))].sort();
  }, [allFetchedQuestions, board, selectedClass, selectedSubjects]);

  useEffect(() => { setSelectedClass(""); setSelectedSubjects([]); setSelectedChapters([]); }, [board]);
  useEffect(() => { setSelectedSubjects([]); setSelectedChapters([]); }, [selectedClass]);
  useEffect(() => { setSelectedChapters([]); }, [selectedSubjects]);

  const toggleSubject = (subj: string) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.includes(subj);
      if (!isSelected && prev.length >= 1) setSelectedChapters([]); 
      return isSelected ? prev.filter(s => s !== subj) : [...prev, subj];
    });
  };

  const toggleChapter = (chap: string) => {
    setSelectedChapters(prev => prev.includes(chap) ? prev.filter(c => c !== chap) : [...prev, chap]);
  };

  const handleStartGame = () => {
    setAppState("loading-game");
    setTimeout(() => {
      let filtered = allFetchedQuestions.filter(q => q.board === board && q.class === selectedClass && selectedSubjects.includes(q.subject));
      if (selectedChapters.length > 0) filtered = filtered.filter(q => selectedChapters.includes(q.chapter));
      if (difficulty !== "Mixed") filtered = filtered.filter(q => q.difficulty === difficulty);

      if (filtered.length < 5) {
        alert(`Only ${filtered.length} questions found. Please select broader filters.`);
        setAppState("setup");
        return;
      }

      const gameQuestions = filtered.sort(() => Math.random() - 0.5).slice(0, questionCount);
      setActiveQuestions(gameQuestions);
      setStartTime(Date.now());
      setHistoryId(null);
      setAppState("playing");
    }, 500);
  };

  const handleGameComplete = (rawResults: GameResults) => {
    if (!user) return;
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const totalQ = activeQuestions.length;
    
    const responses = rawResults.responses || new Map();
    const analysisData: any[] = [];
    
    let correct = 0;
    let skipped = 0;

    activeQuestions.forEach(q => {
      const userAns = responses.get(q.id) || null;
      const isCorrect = userAns === q.correctAnswer;
      if (isCorrect) correct++;
      else if (!userAns) skipped++;

      analysisData.push({
        questionId: q.id, question: q.question, userAnswer: userAns, 
        correctAnswer: q.correctAnswer, isCorrect, 
        explanation: q.explanation || "No explanation available.", options: q.options
      });
    });

    const wrong = totalQ - correct - skipped;
    let score = mode === "instant" ? (rawResults.score || 0) : (correct * 4);

    setFinalResults({ score, correct, wrong, skipped, timeSpent, responses });
    setAppState("result");

    saveGameHistory({
      userId: user.uid, userName: user.displayName || "Solo Warrior",
      gameId: `solo_${Date.now()}`, mode: "solo", type: mode,
      score, totalQuestions: totalQ, correctAnswers: correct, wrongAnswers: wrong, skippedAnswers: skipped,
      timeSpent, accuracy: 0, subject: selectedSubjects.join(", "),
      board, class: selectedClass, difficulty, 
      questionsData: analysisData 
    }).then((savedId) => {
       if (savedId) setHistoryId(savedId);
    });
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
        <p className="text-slate-500 font-bold animate-pulse">Syncing Question Bank...</p>
      </div>
    );
  }

  if (appState === "setup" || appState === "loading-game") {
    return (
      <SoloSetup 
        loading={appState === "loading-game"}
        totalQuestions={allFetchedQuestions.length}
        board={board} setBoard={setBoard}
        selectedClass={selectedClass} setSelectedClass={setSelectedClass}
        selectedSubjects={selectedSubjects} toggleSubject={toggleSubject}
        selectedChapters={selectedChapters} toggleChapter={toggleChapter}
        difficulty={difficulty} setDifficulty={setDifficulty}
        mode={mode} setMode={setMode}
        questionCount={questionCount} setQuestionCount={setQuestionCount}
        timePerQuestion={timePerQuestion} setTimePerQuestion={setTimePerQuestion}
        availableBoards={availableBoards} availableClasses={availableClasses}
        availableSubjects={availableSubjects} availableChapters={availableChapters}
        difficulties={DIFFICULTIES} questionCounts={QUESTION_COUNTS} timeOptions={TIME_OPTIONS}
        onStart={handleStartGame}
      />
    );
  }

  if (appState === "result" && finalResults) {
    return (
      <SoloResult 
        score={finalResults.score}
        correct={finalResults.correct}
        totalQuestions={activeQuestions.length}
        timeSpent={finalResults.timeSpent}
        historyId={historyId} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  // ✅ View: Playing (Rendered via Dynamic Imports)
  if (appState === "playing") {
    const examTimeLimit = Math.ceil((questionCount * timePerQuestion) / 60);

    return mode === "instant" ? (
      <SoloInstantInterface
        questions={activeQuestions}
        timeLimit={timePerQuestion}
        onComplete={(score, correct, streak, responses) => handleGameComplete({ score, correct, wrong: 0, skipped: 0, responses, timeSpent: 0 })}
        onExit={() => setAppState("setup")}
      />
    ) : (
      <SoloExamInterface
        questions={activeQuestions}
        timeLimit={examTimeLimit} 
        onSubmit={(responses) => handleGameComplete({ responses, score: 0, correct: 0, wrong: 0, skipped: 0, timeSpent: 0 })}
        onExit={() => setAppState("setup")}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
    </div>
  );
}