"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { 
  collection, getDocs, doc, updateDoc, deleteDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Folder, FileText, ChevronRight, Home, ArrowLeft, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MathRenderer } from "@/components/math-renderer"; 
import QuestionEditorModal, { Question } from "./QuestionEditorModal";

type FolderItem = {
  name: string;
  count: number;
  type: "folder";
};

type FileItem = {
  data: Question;
  type: "file";
};

// ✅ 1. OPTIMIZATION: Memoized Folder Card
const FolderCard = memo(({ item, onClick }: { item: FolderItem, onClick: () => void }) => (
  <motion.button
    layout
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    onClick={onClick}
    className="group flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-violet-400 hover:shadow-lg transition-all text-left w-full"
  >
    <div className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center group-hover:bg-violet-50 group-hover:text-violet-500 flex-shrink-0">
      <Folder className="fill-current w-6 h-6" />
    </div>
    <div>
      <h3 className="font-bold text-slate-800 line-clamp-1">{item.name}</h3>
      <p className="text-xs font-bold text-slate-400 mt-1">{item.count} items</p>
    </div>
  </motion.button>
));
FolderCard.displayName = "FolderCard";

// ✅ 2. OPTIMIZATION: Memoized File Card
const FileCard = memo(({ item, onClick }: { item: FileItem, onClick: () => void }) => (
  <motion.div
    layout
    initial={{ y: 10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    onClick={onClick}
    className="cursor-pointer group flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all"
  >
    <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500">
      <FileText size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-800 line-clamp-2 text-sm">
        <MathRenderer text={item.data.question} />
      </h4>
      <div className="flex items-center gap-2 mt-2">
         <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Question</span>
      </div>
    </div>
  </motion.div>
));
FileCard.displayName = "FileCard";

// Helper to calculate folder structure
const getNextLevelItems = (questions: Question[], path: string[]): (FolderItem | FileItem)[] => {
  const level = path.length;
  if (level === 5) {
    return questions.map(q => ({ data: q, type: "file" as const }));
  }

  const groups: Record<string, number> = {};
  questions.forEach(q => {
    let key = "";
    if (level === 0) key = q.board;
    else if (level === 1) key = q.class;
    else if (level === 2) key = q.subject;
    else if (level === 3) key = q.chapter;
    else if (level === 4) key = q.difficulty;

    if (key) {
      const normalizedKey = key.trim();
      groups[normalizedKey] = (groups[normalizedKey] || 0) + 1;
    }
  });

  return Object.entries(groups).map(([name, count]) => ({
    name,
    count,
    type: "folder" as const 
  })).sort((a, b) => a.name.localeCompare(b.name));
};

export default function QuestionBankExplorer() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]); 
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "questions"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        
        // ✅ 3. OPTIMIZATION: Defer State Update
        requestAnimationFrame(() => {
          setQuestions(data);
          setLoading(false);
        });

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (currentPath.length > 0 && q.board !== currentPath[0]) return false;
      if (currentPath.length > 1 && q.class !== currentPath[1]) return false;
      if (currentPath.length > 2 && q.subject !== currentPath[2]) return false;
      if (currentPath.length > 3 && q.chapter !== currentPath[3]) return false;
      if (currentPath.length > 4 && q.difficulty !== currentPath[4]) return false;
      return true;
    });
  }, [questions, currentPath]);

  const displayItems = useMemo(() => {
    return getNextLevelItems(filteredQuestions, currentPath);
  }, [filteredQuestions, currentPath]);

  // Callbacks for stable references
  const handleNavigate = useCallback((folderName: string) => {
    setCurrentPath(prev => [...prev, folderName]);
  }, []);

  const handleNavigateUp = useCallback((index?: number) => {
    setCurrentPath(prev => index === undefined ? prev.slice(0, -1) : prev.slice(0, index));
  }, []);

  const handleSave = async (id: string, updatedData: any) => {
    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, updatedData);
    setQuestions(prev => prev.map(q => q.id === id ? { ...updatedData, id } : q));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "questions", id));
      setQuestions(prev => prev.filter(q => q.id !== id));
      setEditingQuestion(null);
    } catch (error) {
      alert("Delete failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p>Loading Question Bank...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Folder className="w-8 h-8 text-violet-500" />
          Question Explorer
        </h2>
        <p className="text-slate-500 font-medium mt-1">Navigate folders, edit via Form or Raw JSON.</p>
      </div>

      <div className="glass-panel min-h-[500px] flex flex-col p-0 overflow-hidden border border-slate-200 shadow-xl bg-white">
        
        {/* Breadcrumbs */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2 overflow-x-auto">
          <button onClick={() => setCurrentPath([])} className={`p-2 rounded-lg hover:bg-white transition-all ${currentPath.length === 0 ? 'text-violet-600 bg-white shadow-sm' : 'text-slate-500'}`}>
            <Home size={18} />
          </button>
          {currentPath.map((folder, index) => (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <button onClick={() => handleNavigateUp(index + 1)} className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${index === currentPath.length - 1 ? "bg-violet-100 text-violet-700" : "hover:bg-white text-slate-500"}`}>
                {folder}
              </button>
            </div>
          ))}
        </div>

        {/* Folder Content */}
        <div className="flex-1 p-6 bg-slate-50/30">
          {currentPath.length > 0 && (
            <button onClick={() => handleNavigateUp()} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm">
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {displayItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
               <Folder className="w-16 h-16 mb-2" />
               <p>Empty Folder</p>
             </div>
          ) : (
            <div className={`grid gap-4 ${currentPath.length === 5 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
              <AnimatePresence mode="popLayout">
                {displayItems.map((item) => (
                  item.type === "folder" ? (
                    <FolderCard 
                        key={item.name} 
                        item={item} 
                        onClick={() => handleNavigate(item.name)} 
                    />
                  ) : (
                    <FileCard 
                        key={(item as FileItem).data.id} 
                        item={item as FileItem} 
                        onClick={() => setEditingQuestion((item as FileItem).data)} 
                    />
                  )
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 p-3 border-t border-slate-200 text-xs font-bold text-slate-400 px-6">
          {filteredQuestions.length} items
        </div>
      </div>

      {editingQuestion && (
        <QuestionEditorModal 
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}