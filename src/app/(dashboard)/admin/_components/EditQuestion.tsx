"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { 
  collection, query, where, getDocs, deleteDoc, updateDoc, doc, limit 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Search, Trash2, Edit2, Filter, Loader2, CheckCircle, CheckSquare, Square, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MathRenderer } from "@/components/math-renderer";
import EditQuestionModal, { Question } from "./EditQuestionModal";

// ✅ 1. OPTIMIZATION: Extract & Memoize List Item
// This prevents re-rendering ALL items when only one changes
const QuestionItem = memo(({ 
  q, 
  onToggleReview, 
  onEdit, 
  onDelete 
}: { 
  q: Question, 
  onToggleReview: (id: string, status?: boolean) => void, 
  onEdit: (q: Question) => void, 
  onDelete: (id: string) => void 
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: q.isReviewed ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-panel p-5 flex flex-col md:flex-row gap-4 group transition-all border-2 ${q.isReviewed ? "bg-slate-50 border-slate-100 grayscale-[0.5]" : "bg-white border-transparent hover:border-violet-200"}`}
    >
      <button 
        onClick={() => onToggleReview(q.id, q.isReviewed)}
        className={`flex-shrink-0 mt-1 transition-colors ${q.isReviewed ? "text-green-500" : "text-slate-300 hover:text-green-500"}`}
        title={q.isReviewed ? "Mark as Unreviewed" : "Mark as Reviewed"}
      >
        {q.isReviewed ? <CheckSquare size={24} /> : <Square size={24} />}
      </button>

      <div className="flex-1 space-y-2">
        <div className="flex gap-2 flex-wrap items-center">
           {q.isReviewed && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1"><CheckCircle size={10} /> Reviewed</span>}
           <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">{q.board}</span>
           <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">{q.class}</span>
           <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded">{q.subject}</span>
        </div>
        
        <h3 className={`font-bold text-slate-800 text-lg ${q.isReviewed && "line-through decoration-slate-300"}`}>
          <MathRenderer text={q.question} />
        </h3>
        
        <div className="flex flex-wrap gap-2 text-sm text-slate-500">
           <span className="font-bold text-emerald-600 flex items-center gap-1">
             <CheckCircle size={14} /> <MathRenderer text={q.correctAnswer} />
           </span>
           {q.chapter && <span className="text-slate-400">• {q.chapter}</span>}
        </div>
      </div>
      
      <div className="flex md:flex-col gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity self-start">
        <button 
          onClick={() => onEdit(q)}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(q.id)}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
});

export default function EditQuestion() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    board: "",
    class: "",
    subject: "",
    difficulty: ""
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    handleSearch();
  }, []);

  // ✅ 2. OPTIMIZATION: Use requestAnimationFrame for heavy updates
  const handleSearch = async () => {
    setLoading(true);
    try {
      const qRef = collection(db, "questions");
      let q = query(qRef, limit(100)); 

      if (filters.subject) {
        q = query(qRef, where("subject", "==", filters.subject), limit(100));
      } else if (filters.board) {
        q = query(qRef, where("board", "==", filters.board), limit(100));
      }

      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      
      // Defer state update to avoid blocking main thread (Fixes "message handler took..." violation)
      requestAnimationFrame(() => {
        setQuestions(fetched);
        setLoading(false);
      });

    } catch (error) {
      console.error("Search failed", error);
      setLoading(false);
    }
  };

  const processedQuestions = useMemo(() => {
    return questions
      .filter(q => {
        if (searchTerm && !q.question.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filters.board && q.board !== filters.board) return false;
        if (filters.class && q.class !== filters.class) return false;
        if (filters.subject && q.subject !== filters.subject) return false;
        if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.isReviewed === b.isReviewed) return 0;
        return a.isReviewed ? 1 : -1;
      });
  }, [questions, searchTerm, filters]);

  // ✅ 3. OPTIMIZATION: Stable Callbacks
  const handleToggleReview = useCallback(async (id: string, currentStatus?: boolean) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, isReviewed: !currentStatus } : q));
    try {
      const docRef = doc(db, "questions", id);
      await updateDoc(docRef, { isReviewed: !currentStatus });
    } catch (error) {
      alert("Failed to update review status");
      // Revert on error
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, isReviewed: currentStatus } : q));
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteDoc(doc(db, "questions", id));
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      alert("Failed to delete question");
    }
  }, []);

  const handleSaveQuestion = async (updatedQuestion: Question) => {
    try {
      const docRef = doc(db, "questions", updatedQuestion.id);
      const { id, ...dataToSave } = updatedQuestion;
      
      await updateDoc(docRef, dataToSave);
      setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
      setEditingQuestion(null);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update question");
      throw error; 
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Edit2 className="w-8 h-8 text-violet-500" />
          Edit & Review
        </h2>
        <p className="text-slate-500 font-medium mt-2">Filter questions, edit details, and mark them as reviewed.</p>
      </div>

      <div className="glass-panel p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        
        {/* Search Input */}
        <div className="md:col-span-5 lg:col-span-2 relative">
          <label htmlFor="search-input" className="sr-only">Search</label>
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input 
            id="search-input"
            name="search"
            type="text" 
            placeholder="Search by question text..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="relative">
            <label htmlFor="filter-board" className="sr-only">Board Filter</label>
            <select 
            id="filter-board"
            name="filterBoard"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none"
            value={filters.board}
            onChange={(e) => setFilters({ ...filters, board: e.target.value })}
            >
            <option value="">All Boards</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="State Board">State Board</option>
            </select>
        </div>

        <div className="relative">
            <label htmlFor="filter-class" className="sr-only">Class Filter</label>
            <select 
            id="filter-class"
            name="filterClass"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none"
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            >
            <option value="">All Classes</option>
            {["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map(c => (
                <option key={c} value={c}>{c}</option>
            ))}
            </select>
        </div>

        <div className="relative">
            <label htmlFor="filter-subject" className="sr-only">Subject Filter</label>
            <select 
            id="filter-subject"
            name="filterSubject"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none"
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Social Science">Social Science</option>
            </select>
        </div>

        <button 
          onClick={handleSearch}
          className="px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
          Fetch
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-500 text-sm px-2">
          Showing {processedQuestions.length} questions
        </h3>
        
        {/* List of Memoized QuestionItems */}
        <AnimatePresence>
          {processedQuestions.map((q) => (
            <QuestionItem 
                key={q.id} 
                q={q} 
                onToggleReview={handleToggleReview} 
                onEdit={setEditingQuestion} 
                onDelete={handleDelete} 
            />
          ))}
        </AnimatePresence>

        {processedQuestions.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No questions found matching your filters.</p>
          </div>
        )}
      </div>

      {editingQuestion && (
        <EditQuestionModal 
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={handleSaveQuestion}
        />
      )}
    </div>
  );
}