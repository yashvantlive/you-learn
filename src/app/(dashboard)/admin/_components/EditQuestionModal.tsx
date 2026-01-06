"use client";

import { useState } from "react";
import { X, Save, Edit2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Question type definition
export interface Question {
  id: string;
  question: string;
  subject: string;
  board: string;
  class: string;
  difficulty: string;
  correctAnswer: string;
  options: string[];
  explanation?: string;
  chapter?: string;
  isReviewed?: boolean; 
}

interface EditQuestionModalProps {
  question: Question;
  onClose: () => void;
  onSave: (updatedQuestion: Question) => Promise<void>;
}

export default function EditQuestionModal({ question, onClose, onSave }: EditQuestionModalProps) {
  const [formData, setFormData] = useState<Question>({ ...question });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Save failed inside modal", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    
    // If the option being changed is the correct answer, update correct answer too
    let newCorrect = formData.correctAnswer;
    if (formData.options[index] === formData.correctAnswer) {
        newCorrect = value;
    }
    setFormData({ ...formData, options: newOptions, correctAnswer: newCorrect });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <motion.div 
        initial={{ scale: 0.95 }} 
        animate={{ scale: 1 }} 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Edit2 size={20} className="text-violet-600"/> Edit Question
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div className="space-y-2">
            <label htmlFor="edit-question-text" className="text-sm font-bold text-slate-700">Question Text (LaTeX Supported)</label>
            <textarea 
              id="edit-question-text"
              name="editQuestion"
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-violet-500 outline-none font-medium text-slate-800"
              rows={3}
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            {/* ✅ Fixed: Changed label to h3 to avoid accessibility error */}
            <h3 className="text-sm font-bold text-slate-700">Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.options?.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <button 
                    onClick={() => setFormData({...formData, correctAnswer: opt})}
                    className={`w-10 h-10 flex-shrink-0 rounded-lg border-2 flex items-center justify-center font-bold transition-colors ${formData.correctAnswer === opt ? "bg-green-500 border-green-500 text-white" : "border-slate-200 text-slate-400"}`}
                    type="button"
                  >
                    {String.fromCharCode(65 + idx)}
                  </button>
                  <div className="flex-1">
                    <label htmlFor={`edit-option-${idx}`} className="sr-only">Option {String.fromCharCode(65 + idx)}</label>
                    <input 
                        id={`edit-option-${idx}`}
                        name={`editOption-${idx}`}
                        type="text" 
                        className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 outline-none"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-explanation" className="text-sm font-bold text-slate-700">Explanation</label>
            <textarea 
              id="edit-explanation"
              name="editExplanation"
              className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-violet-500 outline-none text-sm"
              rows={3}
              value={formData.explanation || ""}
              onChange={(e) => setFormData({...formData, explanation: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <label htmlFor="edit-board" className="text-xs font-bold text-slate-500">Board</label>
              <select 
                id="edit-board"
                name="editBoard"
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                value={formData.board}
                onChange={(e) => setFormData({...formData, board: e.target.value})}
              >
                 <option value="CBSE">CBSE</option>
                 <option value="ICSE">ICSE</option>
                 <option value="State Board">State Board</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-class" className="text-xs font-bold text-slate-500">Class</label>
              <select 
                id="edit-class"
                name="editClass"
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
              >
                 {["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-subject" className="text-xs font-bold text-slate-500">Subject</label>
              <input 
                id="edit-subject"
                name="editSubject"
                type="text" 
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-chapter" className="text-xs font-bold text-slate-500">Chapter</label>
              <input 
                id="edit-chapter"
                name="editChapter"
                type="text" 
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                value={formData.chapter || ""}
                onChange={(e) => setFormData({...formData, chapter: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}