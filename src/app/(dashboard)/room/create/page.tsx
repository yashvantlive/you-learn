"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db, rtdb } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { ref, set, get } from "firebase/database"; 
import { 
  Swords, Sparkles, Loader2, BookOpen, 
  GraduationCap, Layers, Check, Clock, Settings2, Zap, FileText, Users 
} from "lucide-react";

interface Question {
  id: string;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  difficulty: string;
}

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];
const TIME_OPTIONS = [15, 30, 45, 60, 90, 120]; 
const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30, 50];

function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CreateRoomPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loadingData, setLoadingData] = useState(true);
  const [creating, setCreating] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [board, setBoard] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Mixed");
  const [quizMode, setQuizMode] = useState<"instant" | "exam">("instant");
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [maxPlayers, setMaxPlayers] = useState(100);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const q = query(collection(db, "questions"), limit(2000)); 
        const snapshot = await getDocs(q);
        const fetchedQuestions: Question[] = snapshot.docs.map(doc => ({
          id: doc.id,
          board: doc.data().board || "Unknown",
          class: doc.data().class || "Unknown",
          subject: doc.data().subject || "Unknown",
          chapter: doc.data().chapter || "Unknown",
          difficulty: doc.data().difficulty || "Medium"
        }));
        setAllQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchMetadata();
  }, []);

  const availableBoards = useMemo(() => [...new Set(allQuestions.map(q => q.board))].sort(), [allQuestions]);
  const availableClasses = useMemo(() => board ? [...new Set(allQuestions.filter(q => q.board === board).map(q => q.class))].sort() : [], [allQuestions, board]);
  const availableSubjects = useMemo(() => (board && selectedClass) ? [...new Set(allQuestions.filter(q => q.board === board && q.class === selectedClass).map(q => q.subject))].sort() : [], [allQuestions, board, selectedClass]);
  const availableChapters = useMemo(() => (board && selectedClass && selectedSubjects.length === 1) ? [...new Set(allQuestions.filter(q => q.board === board && q.class === selectedClass && q.subject === selectedSubjects[0]).map(q => q.chapter))].sort() : [], [allQuestions, board, selectedClass, selectedSubjects]);

  useEffect(() => { setSelectedClass(""); setSelectedSubjects([]); setSelectedChapters([]); }, [board]);
  useEffect(() => { setSelectedSubjects([]); setSelectedChapters([]); }, [selectedClass]);
  useEffect(() => { setSelectedChapters([]); }, [selectedSubjects]);

  const toggleSubject = (subj: string) => setSelectedSubjects(prev => {
    const isSelected = prev.includes(subj);
    if (!isSelected && prev.length >= 1) setSelectedChapters([]);
    return isSelected ? prev.filter(s => s !== subj) : [...prev, subj];
  });
  const toggleChapter = (chap: string) => setSelectedChapters(prev => prev.includes(chap) ? prev.filter(c => c !== chap) : [...prev, chap]);

  const handleCreate = async () => {
    if (!user || selectedSubjects.length === 0) return;
    setCreating(true);

    try {
      let filtered = allQuestions.filter(q => q.board === board && q.class === selectedClass && selectedSubjects.includes(q.subject));
      if (selectedChapters.length > 0) filtered = filtered.filter(q => selectedChapters.includes(q.chapter));
      if (difficulty !== "Mixed") filtered = filtered.filter(q => q.difficulty === difficulty);

      if (filtered.length < questionCount) {
        alert(`Found only ${filtered.length} questions. Reduce count or change filters.`);
        setCreating(false);
        return;
      }
      const shuffledIds = filtered.map(q => q.id).sort(() => 0.5 - Math.random()).slice(0, questionCount);
      const totalTimeMinutes = Math.ceil((questionCount * timePerQuestion) / 60);

      let roomId = generateRoomCode();
      let roomRef = ref(rtdb, `rooms/${roomId}`);
      let snapshot = await get(roomRef);
      while (snapshot.exists()) {
        roomId = generateRoomCode();
        roomRef = ref(rtdb, `rooms/${roomId}`);
        snapshot = await get(roomRef);
      }

      await set(roomRef, {
        config: {
          board, class: selectedClass, subjects: selectedSubjects,
          chapters: selectedChapters.length > 0 ? selectedChapters : "Mixed",
          difficulty, totalQuestions: shuffledIds.length, questionIds: shuffledIds,
          timePerQuestion, totalTime: totalTimeMinutes, quizMode, maxPlayers
        },
        gameState: { status: "lobby", currentQuestionIndex: 0, startTime: 0 },
        players: {}, hostId: user.uid
      });
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("System Error.");
    } finally {
      setCreating(false);
    }
  };

  if (loadingData) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><Loader2 className="w-12 h-12 animate-spin text-violet-600" /><p className="text-slate-500 font-bold">Syncing Question Bank...</p></div>;

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 max-w-4xl mx-auto">
      <div className="text-center space-y-3 mb-8 animate-in slide-in-from-top-4">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl mb-2"><Swords className="w-8 h-8 text-violet-600" /></div>
        <h1 className="text-4xl font-black text-slate-900">Battle Config</h1>
        <p className="text-slate-500 font-medium">{allQuestions.length} Questions Available</p>
      </div>

      <div className="grid gap-8">
        
        {/* SECTION 1: CONTENT FILTERS */}
        <div className="glass-panel p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Layers className="w-5 h-5 text-blue-600" /> Content Selection</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="create-board" className="text-xs font-bold text-slate-500 uppercase">Board</label>
              <select 
                id="create-board"
                name="board"
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold outline-none focus:border-violet-500 transition-all" 
                value={board} 
                onChange={(e) => setBoard(e.target.value)}
              >
                <option value="">Select Board</option>
                {availableBoards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="create-class" className="text-xs font-bold text-slate-500 uppercase">Class</label>
              <select 
                id="create-class"
                name="class"
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold outline-none focus:border-violet-500 transition-all disabled:opacity-50" 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)} 
                disabled={!board}
              >
                <option value="">Select Class</option>
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Subjects</span>
            {availableSubjects.length === 0 ? <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-sm border-2 border-dashed">Select Board & Class first</div> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableSubjects.map(subj => {
                  const isSelected = selectedSubjects.includes(subj);
                  return (
                    <button key={subj} onClick={() => toggleSubject(subj)} className={`p-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${isSelected ? "bg-violet-600 border-violet-600 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-violet-300"}`}>
                      {subj} {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedSubjects.length === 1 && availableChapters.length > 0 && (
             <div className="space-y-2 animate-in fade-in">
               <span className="text-xs font-bold text-slate-500 uppercase">Chapters (Optional)</span>
               <div className="flex flex-wrap gap-2">
                 {availableChapters.map(chap => {
                   const isSelected = selectedChapters.includes(chap);
                   return (
                     <button key={chap} onClick={() => toggleChapter(chap)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isSelected ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                       {chap}
                     </button>
                   );
                 })}
               </div>
             </div>
          )}
        </div>

        {/* SECTION 2: BATTLE PARAMETERS */}
        <div className="glass-panel p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Settings2 className="w-5 h-5 text-pink-600" /> Battle Rules</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <button onClick={() => setQuizMode("instant")} className={`p-4 rounded-xl border-2 text-left transition-all ${quizMode === 'instant' ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${quizMode === 'instant' ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Zap size={20} /></div>
                <span className="font-bold text-slate-900">Instant Mode</span>
              </div>
              <p className="text-xs text-slate-500">Immediate feedback.</p>
            </button>
            <button onClick={() => setQuizMode("exam")} className={`p-4 rounded-xl border-2 text-left transition-all ${quizMode === 'exam' ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${quizMode === 'exam' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}><FileText size={20} /></div>
                <span className="font-bold text-slate-900">Exam Mode</span>
              </div>
              <p className="text-xs text-slate-500">Submit at end.</p>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="create-question-count" className="text-xs font-bold text-slate-500 uppercase flex gap-2"><BookOpen size={14}/> Questions</label>
              <select 
                id="create-question-count"
                name="questionCount"
                className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold outline-none" 
                value={questionCount} 
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              >
                {QUESTION_COUNTS.map(n => <option key={n} value={n}>{n} Questions</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="create-time" className="text-xs font-bold text-slate-500 uppercase flex gap-2"><Clock size={14}/> Time / Q</label>
              <select 
                id="create-time"
                name="timePerQuestion"
                className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold outline-none" 
                value={timePerQuestion} 
                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t} Seconds</option>)}
              </select>
            </div>
          </div>

          {/* 5. Max Players Fix */}
          <div className="space-y-2">
             <label htmlFor="max-players" className="text-xs font-bold text-slate-500 uppercase flex gap-2"><Users size={14}/> Max Players (Limit)</label>
             <div className="flex items-center gap-4">
               <input 
                 id="max-players"
                 name="maxPlayers"
                 type="range" 
                 min="1" 
                 max="1000" 
                 value={maxPlayers} 
                 onChange={(e) => setMaxPlayers(Number(e.target.value))}
                 className="flex-1 accent-violet-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
               />
               <span className="font-mono font-bold text-lg w-16 text-center border-2 border-slate-200 rounded-lg py-1">{maxPlayers}</span>
             </div>
             <p className="text-[10px] text-slate-400">Allows {maxPlayers} player{maxPlayers > 1 ? 's' : ''} to join. Set to 1 for solo testing.</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl text-white flex justify-between items-center shadow-lg">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Total Duration</p>
              <p className="text-2xl font-black font-mono">{Math.ceil((questionCount * timePerQuestion) / 60)} <span className="text-sm font-sans text-slate-400">min</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Total Score</p>
              <p className="text-xl font-bold">{questionCount * 100} XP</p>
            </div>
          </div>

        </div>

        <button 
          onClick={handleCreate}
          disabled={creating || selectedSubjects.length === 0}
          className="w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? <Loader2 className="animate-spin" /> : <Sparkles fill="currentColor" />}
          Create Battle Room
        </button>

      </div>
    </div>
  );
}