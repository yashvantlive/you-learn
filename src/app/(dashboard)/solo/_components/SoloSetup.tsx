"use client";

import { 
  Layers, GraduationCap, BookOpen, Check, Settings2, 
  Zap, FileText, Target, Clock, Sparkles, Swords 
} from "lucide-react";
import { Loader2 } from "lucide-react";

interface SoloSetupProps {
  loading: boolean;
  totalQuestions: number;
  board: string;
  setBoard: (v: string) => void;
  selectedClass: string;
  setSelectedClass: (v: string) => void;
  selectedSubjects: string[];
  toggleSubject: (v: string) => void;
  selectedChapters: string[];
  toggleChapter: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  mode: "instant" | "exam";
  setMode: (v: "instant" | "exam") => void;
  questionCount: number;
  setQuestionCount: (v: number) => void;
  timePerQuestion: number;
  setTimePerQuestion: (v: number) => void;
  availableBoards: string[];
  availableClasses: string[];
  availableSubjects: string[];
  availableChapters: string[];
  difficulties: string[];
  questionCounts: number[];
  timeOptions: number[];
  onStart: () => void;
}

export default function SoloSetup({
  loading, totalQuestions,
  board, setBoard,
  selectedClass, setSelectedClass,
  selectedSubjects, toggleSubject,
  selectedChapters, toggleChapter,
  difficulty, setDifficulty,
  mode, setMode,
  questionCount, setQuestionCount,
  timePerQuestion, setTimePerQuestion,
  availableBoards, availableClasses, availableSubjects, availableChapters,
  difficulties, questionCounts, timeOptions,
  onStart
}: SoloSetupProps) {

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-8 animate-in slide-in-from-top-4">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl mb-2">
          <Swords className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">Solo Training</h1>
        <p className="text-slate-500 font-medium">
          Customize your practice session from {totalQuestions} available questions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* LEFT: CONTENT FILTERS */}
        <div className="glass-panel p-6 md:p-8 space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" /> Content
          </h3>

          <div className="space-y-4">
            {/* 1. Board Select Fix */}
            <div className="space-y-2">
              <label htmlFor="board-select" className="text-xs font-bold text-slate-500 uppercase flex gap-2">
                <GraduationCap size={14}/> Board
              </label>
              <select 
                id="board-select"
                name="board"
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold outline-none focus:border-violet-500 transition-all" 
                value={board} 
                onChange={(e) => setBoard(e.target.value)}
              >
                <option value="">Select Board</option>
                {availableBoards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* 2. Class Select Fix */}
            <div className="space-y-2">
              <label htmlFor="class-select" className="text-xs font-bold text-slate-500 uppercase flex gap-2">
                <BookOpen size={14}/> Class
              </label>
              <select 
                id="class-select"
                name="class"
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold outline-none focus:border-violet-500 transition-all disabled:opacity-50" 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)} 
                disabled={!board}
              >
                <option value="">Select Class</option>
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex gap-2"><Layers size={14}/> Subjects</span>
              {availableSubjects.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-xs border-dashed border-2">Select Board & Class</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSubjects.map(subj => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <button key={subj} onClick={() => toggleSubject(subj)} className={`p-2 rounded-lg text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${isSelected ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>
                        {subj} {isSelected && <Check size={12} />}
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
        </div>

        {/* RIGHT: BATTLE RULES */}
        <div className="glass-panel p-6 md:p-8 space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-pink-600" /> Rules
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setMode("instant")} className={`p-3 rounded-xl border-2 text-left transition-all ${mode === 'instant' ? "border-violet-500 bg-violet-50" : "border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className={mode === 'instant' ? "text-violet-600" : "text-slate-400"} />
                <span className="font-bold text-sm text-slate-900">Instant</span>
              </div>
              <p className="text-[10px] text-slate-500">Fast feedback</p>
            </button>
            <button onClick={() => setMode("exam")} className={`p-3 rounded-xl border-2 text-left transition-all ${mode === 'exam' ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className={mode === 'exam' ? "text-blue-600" : "text-slate-400"} />
                <span className="font-bold text-sm text-slate-900">Exam</span>
              </div>
              <p className="text-[10px] text-slate-500">Real simulation</p>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 3. Difficulty Select Fix */}
            <div className="space-y-2">
              <label htmlFor="difficulty-select" className="text-xs font-bold text-slate-500 uppercase flex items-center">
                <Target size={14} className="inline mr-1"/> Difficulty
              </label>
              <select 
                id="difficulty-select"
                name="difficulty"
                className="w-full p-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold outline-none text-sm" 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* 4. Question Count Select Fix */}
            <div className="space-y-2">
              <label htmlFor="questions-select" className="text-xs font-bold text-slate-500 uppercase flex items-center">
                <BookOpen size={14} className="inline mr-1"/> Questions
              </label>
              <select 
                id="questions-select"
                name="questionCount"
                className="w-full p-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold outline-none text-sm" 
                value={questionCount} 
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              >
                {questionCounts.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center"><Clock size={14} className="inline mr-1"/> Time / Question</span>
            <div className="grid grid-cols-4 gap-2">
                {timeOptions.map(t => (
                  <button key={t} onClick={() => setTimePerQuestion(t)} className={`py-1.5 rounded-lg text-xs font-bold transition-all ${timePerQuestion === t ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>{t}s</button>
                ))}
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl text-white flex justify-between items-center shadow-lg">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Time</p>
              <p className="text-xl font-black font-mono">{Math.ceil((questionCount * timePerQuestion) / 60)} <span className="text-xs font-sans text-slate-400">min</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Max Score</p>
              <p className="text-xl font-bold">{questionCount * (mode === 'exam' ? 4 : 100)} XP</p>
            </div>
          </div>

          <button 
            onClick={onStart}
            disabled={loading || selectedSubjects.length === 0}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Sparkles fill="currentColor" /> Start Practice</>}
          </button>
        </div>
      </div>
    </div>
  );
}