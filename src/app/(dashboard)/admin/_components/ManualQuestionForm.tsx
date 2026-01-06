"use client";

import { 
  CheckCircle, AlertCircle, Save, 
  BookOpen, Layers, Target, FileText, HelpCircle,
  GraduationCap, Sparkles, RefreshCw
} from "lucide-react";

// Types defined here or imported
export interface QuestionForm {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface ManualQuestionFormProps {
  form: QuestionForm;
  setForm: (form: QuestionForm) => void;
  loading: boolean;
  message: { type: 'success' | 'error', text: string } | null;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onOptionChange: (index: number, value: string) => void;
  onCorrectAnswerSelect: (index: number) => void;
}

const BOARDS = ["CBSE", "ICSE", "State Board"];
const CLASS_OPTIONS: Record<string, string[]> = {
  CBSE: ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"],
  ICSE: ["Class 8", "Class 9", "Class 10"],
  "State Board": ["Class 8", "Class 9", "Class 10"],
};
const SUBJECT_OPTIONS: Record<string, string[]> = {
  "Class 8": ["Mathematics", "Science", "Social Science", "English"],
  "Class 9": ["Mathematics", "Science", "Social Science", "English"],
  "Class 10": ["Mathematics", "Science", "Social Science", "English"],
  "Class 11": ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
  "Class 12": ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
};
const DIFFICULTIES: Array<"Easy" | "Medium" | "Hard"> = ["Easy", "Medium", "Hard"];

export default function ManualQuestionForm({
  form, setForm, loading, message,
  onSubmit, onReset, onOptionChange, onCorrectAnswerSelect
}: ManualQuestionFormProps) {
  
  const availableClasses = form.board ? CLASS_OPTIONS[form.board] || [] : [];
  const availableSubjects = form.class ? SUBJECT_OPTIONS[form.class] || [] : [];

  return (
    <div className="glass-panel p-6 md:p-10 rounded-3xl border border-white/50 shadow-2xl">
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" /> Question Metadata
          </h2>
          
          <div className="grid md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label htmlFor="manual-board" className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                <GraduationCap size={14} /> Board
              </label>
              <div className="relative">
                <select 
                  id="manual-board" 
                  name="board"
                  className="w-full p-3.5 rounded-xl bg-white border-2 border-slate-200 focus:border-violet-400 outline-none font-semibold text-slate-800 appearance-none cursor-pointer" 
                  value={form.board} 
                  onChange={(e) => setForm({ ...form, board: e.target.value, class: "", subject: "" })}
                >
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="manual-class" className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                <BookOpen size={14} /> Class
              </label>
              <div className="relative">
                <select 
                  id="manual-class" 
                  name="class"
                  className="w-full p-3.5 rounded-xl bg-white border-2 border-slate-200 focus:border-violet-400 outline-none font-semibold text-slate-800 appearance-none cursor-pointer disabled:opacity-50" 
                  value={form.class} 
                  onChange={(e) => setForm({ ...form, class: e.target.value, subject: "" })} 
                  disabled={!form.board}
                >
                  <option value="">Select Class</option>
                  {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="manual-subject" className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                <Sparkles size={14} /> Subject
              </label>
              <div className="relative">
                <select 
                  id="manual-subject" 
                  name="subject"
                  className="w-full p-3.5 rounded-xl bg-white border-2 border-slate-200 focus:border-violet-400 outline-none font-semibold text-slate-800 appearance-none cursor-pointer disabled:opacity-50" 
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} 
                  disabled={!form.class}
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="manual-chapter" className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                <Layers size={14} /> Chapter
              </label>
              <input 
                id="manual-chapter" 
                name="chapter"
                type="text" 
                placeholder="e.g. Real Numbers" 
                className="w-full p-3.5 rounded-xl bg-white border-2 border-slate-200 focus:border-violet-400 outline-none font-medium text-slate-800" 
                value={form.chapter} 
                onChange={(e) => setForm({ ...form, chapter: e.target.value })} 
              />
            </div>
            
            <div className="space-y-2">
              {/* ✅ Fixed: Changed label to span to prevent "label not associated" error */}
              <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                <Target size={14} /> Difficulty
              </span>
              <div className="flex bg-white p-1.5 rounded-xl border-2 border-slate-200">
                {DIFFICULTIES.map((level) => (
                  <button 
                    key={level} 
                    type="button" 
                    onClick={() => setForm({ ...form, difficulty: level })} 
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${form.difficulty === level ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <hr className="border-slate-200" />
        
        <div className="space-y-3">
          <label htmlFor="manual-question" className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle size={20} className="text-violet-500" /> Question Text
          </label>
          <textarea 
            id="manual-question" 
            name="question"
            rows={4} 
            placeholder="Type the question here..." 
            className="w-full p-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-violet-400 outline-none text-lg font-medium text-slate-800 resize-none" 
            value={form.question} 
            onChange={(e) => setForm({ ...form, question: e.target.value })} 
          />
        </div>

        <div className="space-y-4">
          {/* ✅ Fixed: Changed label to h3 */}
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-500" /> Answer Options
          </h3>
          <div className="grid gap-3">
            {form.options.map((opt, idx) => {
              const isCorrect = form.correctAnswer === opt && opt !== "";
              return (
                <div key={idx} className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => onCorrectAnswerSelect(idx)} 
                    disabled={!form.options[idx]} 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all border-2 font-bold text-lg ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-110' : form.options[idx] ? 'bg-white border-slate-300 text-slate-600 hover:border-violet-400' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </button>
                  <div className="flex-1 relative">
                      <label htmlFor={`option-${idx}`} className="sr-only">Option {String.fromCharCode(65 + idx)}</label>
                      <input 
                          id={`option-${idx}`} 
                          name={`option-${idx}`} 
                          type="text" 
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`} 
                          className={`w-full p-3.5 rounded-xl border-2 outline-none font-medium transition-all ${isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-slate-200 focus:border-violet-400'}`} 
                          value={opt} 
                          onChange={(e) => onOptionChange(idx, e.target.value)} 
                      />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="manual-explanation" className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" /> Explanation
          </label>
          <textarea 
            id="manual-explanation" 
            name="explanation"
            rows={3} 
            placeholder="Explain the answer..." 
            className="w-full p-4 rounded-xl bg-blue-50/50 border-2 border-blue-100 focus:border-blue-400 outline-none text-slate-700 text-sm font-medium resize-none" 
            value={form.explanation} 
            onChange={(e) => setForm({ ...form, explanation: e.target.value })} 
          />
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center gap-4">
          <button type="submit" disabled={loading} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-xl">
            {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <><Save size={20} /> Upload Question</>}
          </button>
          <button type="button" onClick={onReset} disabled={loading} className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <RefreshCw size={18} /> Reset
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-3 animate-in slide-in-from-right ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200' : 'bg-red-50 text-red-700 border-2 border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}