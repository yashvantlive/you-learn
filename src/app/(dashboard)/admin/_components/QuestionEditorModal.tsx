"use client";

import { useState, useEffect } from "react";
import { 
  Save, X, Trash2, Loader2, Eye, PenTool, CheckCircle, AlertCircle, Code, Copy, BookOpen 
} from "lucide-react";
import { motion } from "framer-motion";
import { MathRenderer } from "@/components/math-renderer"; 

export interface Question {
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
  [key: string]: any; 
}

interface QuestionEditorModalProps {
  question: Question;
  onClose: () => void;
  onSave: (id: string, updatedData: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function QuestionEditorModal({ 
  question, onClose, onSave, onDelete 
}: QuestionEditorModalProps) {
  
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "json">("edit");
  const [formData, setFormData] = useState<Question>({ ...question });
  const [jsonString, setJsonString] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Initialize JSON string excluding ID
  useEffect(() => {
    const { id, ...rest } = question;
    setJsonString(JSON.stringify(rest, null, 2));
  }, [question]);

  const switchTab = (tab: "edit" | "preview" | "json") => {
    if (activeTab === "json" && (tab === "edit" || tab === "preview")) {
      try {
        const parsed = JSON.parse(jsonString);
        setFormData({ ...parsed, id: question.id });
      } catch (e) {
        alert("Invalid JSON! Fix syntax errors before switching.");
        return;
      }
    } else if (tab === "json") {
      const { id, ...rest } = formData;
      setJsonString(JSON.stringify(rest, null, 2));
    }
    setActiveTab(tab);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    let newCorrect = formData.correctAnswer;
    if (formData.options[index] === formData.correctAnswer) {
        newCorrect = value;
    }
    setFormData({ ...formData, options: newOptions, correctAnswer: newCorrect });
  };

  const handleSaveClick = async () => {
    setSaveStatus("saving");
    try {
      let dataToSave: any;
      if (activeTab === "json") {
        const parsed = JSON.parse(jsonString);
        if (!parsed.question || !parsed.options) throw new Error("Invalid structure");
        dataToSave = parsed;
      } else {
        const { id, ...rest } = formData;
        dataToSave = rest;
      }

      await onSave(question.id, dataToSave);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving: " + (error as Error).message);
      setSaveStatus("error");
    }
  };

  const handleDeleteClick = async () => {
    if (confirm("Permanently delete this question?")) {
      await onDelete(question.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <motion.div 
        initial={{ scale: 0.95 }} 
        animate={{ scale: 1 }} 
        className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-7xl h-[90vh] overflow-hidden flex flex-col"
      >
        
        {/* Header */}
        <div className="p-0 border-b border-slate-200 bg-slate-50 flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between p-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
               <PenTool className="w-5 h-5 text-violet-600" />
               Editor <span className="text-slate-400 font-normal text-sm">/ {question.id}</span>
             </h3>
             <div className="flex items-center gap-2">
                <button onClick={() => {
                    const { id, ...rest } = formData;
                    navigator.clipboard.writeText(JSON.stringify(rest, null, 2));
                    alert("JSON Copied!");
                }} className="p-2 hover:bg-slate-200 rounded-full text-slate-500" title="Copy JSON">
                    <Copy size={18} />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
                    <X size={24} className="text-slate-500" />
                </button>
             </div>
          </div>
          
          {/* Tabs */}
          <div className="flex px-6 gap-1">
            <button onClick={() => switchTab("edit")} className={`px-6 py-3 text-sm font-bold rounded-t-lg transition-colors border-t border-x ${activeTab === "edit" ? "bg-white border-slate-200 text-blue-600 border-b-white translate-y-[1px]" : "bg-slate-100 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200"}`}>
              Edit Form
            </button>
            <button onClick={() => switchTab("preview")} className={`px-6 py-3 text-sm font-bold rounded-t-lg transition-colors border-t border-x ${activeTab === "preview" ? "bg-white border-slate-200 text-violet-600 border-b-white translate-y-[1px]" : "bg-slate-100 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200"}`}>
              <Eye size={16} className="inline mr-2"/> Student Preview
            </button>
            <button onClick={() => switchTab("json")} className={`px-6 py-3 text-sm font-bold rounded-t-lg transition-colors border-t border-x ${activeTab === "json" ? "bg-white border-slate-200 text-orange-600 border-b-white translate-y-[1px]" : "bg-slate-100 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200"}`}>
              <Code size={16} className="inline mr-2"/> Raw JSON
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white relative p-0">
          
          {/* --- EDIT FORM --- */}
          {activeTab === "edit" && (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
              <div className="space-y-3">
                <label htmlFor="explorer-question" className="text-base font-bold text-slate-800">Question Text (LaTeX Supported)</label>
                <textarea 
                  id="explorer-question"
                  rows={4} 
                  className="w-full p-5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-slate-800 font-medium text-lg leading-relaxed"
                  value={formData.question}
                  onChange={(e) => handleFormChange("question", e.target.value)}
                />
              </div>

              <div className="space-y-4">
                {/* ✅ Fixed: Changed label to h3 to avoid accessibility error */}
                <h3 className="text-base font-bold text-slate-800">Options & Answer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.options.map((opt, i) => (
                    <div key={i} className={`flex gap-3 items-center p-3 rounded-xl border-2 transition-all ${formData.correctAnswer === opt && opt !== "" ? "border-green-500 bg-green-50" : "border-slate-100"}`}>
                        <button 
                        onClick={() => handleFormChange("correctAnswer", opt)}
                        className={`w-10 h-10 flex-shrink-0 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${formData.correctAnswer === opt ? "bg-green-500 border-green-500 text-white" : "border-slate-200 text-slate-400 hover:border-slate-300 bg-white"}`}
                        >
                        {String.fromCharCode(65+i)}
                        </button>
                        <div className="flex-1">
                            <label htmlFor={`explorer-option-${i}`} className="sr-only">Option {String.fromCharCode(65+i)}</label>
                            <input 
                            id={`explorer-option-${i}`}
                            type="text" 
                            className="w-full p-2 bg-transparent outline-none font-medium text-slate-700"
                            placeholder={`Option ${String.fromCharCode(65+i)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(i, e.target.value)}
                            />
                        </div>
                        {formData.correctAnswer === opt && <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />}
                    </div>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="explorer-explanation" className="text-base font-bold text-slate-800">Explanation</label>
                <textarea 
                  id="explorer-explanation"
                  rows={3} 
                  className="w-full p-5 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-blue-400 outline-none text-slate-700 font-medium resize-none"
                  value={formData.explanation || ""}
                  onChange={(e) => handleFormChange("explanation", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* --- PREVIEW --- */}
          {activeTab === "preview" && (
            <div className="h-full bg-slate-50 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-200 animate-in zoom-in-95 duration-300">
                    <div className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-relaxed">
                        <span className="text-slate-300 mr-4 text-xl align-top">Q.</span>
                        <MathRenderer text={formData.question} />
                        </h2>
                        
                        <div className="grid gap-4 pt-4">
                        {formData.options.map((opt, i) => (
                            <div key={i} className={`p-5 rounded-xl border-2 flex items-center gap-4 transition-all ${opt === formData.correctAnswer ? "border-green-500 bg-green-50 shadow-sm" : "border-slate-100 hover:border-slate-300"}`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${opt === formData.correctAnswer ? "bg-green-200 text-green-800" : "bg-slate-100 text-slate-500"}`}>
                                {String.fromCharCode(65+i)}
                            </div>
                            <div className="font-medium text-slate-700 text-lg">
                                <MathRenderer text={opt} />
                            </div>
                            {opt === formData.correctAnswer && <CheckCircle className="ml-auto text-green-600" size={24} />}
                            </div>
                        ))}
                        </div>

                        {formData.explanation && (
                        <div className="mt-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4">
                            <div className="w-1 bg-yellow-400 rounded-full shrink-0"></div>
                            <div>
                                <h4 className="font-bold text-yellow-800 text-xs uppercase mb-2 tracking-wider">Explanation</h4>
                                <p className="text-slate-800 leading-relaxed"><MathRenderer text={formData.explanation} /></p>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
          )}

          {/* --- JSON EDITOR --- */}
          {activeTab === "json" && (
            <div className="absolute inset-0 flex flex-col bg-[#1e1e1e]">
              <div className="bg-[#2d2d2d] px-4 py-2 text-xs text-gray-400 flex items-center gap-2 border-b border-[#3e3e3e]">
                <AlertCircle size={12} className="text-yellow-500" />
                <span>Editing Raw JSON. Be careful with syntax.</span>
              </div>
              <label htmlFor="explorer-json" className="sr-only">JSON Editor</label>
              <textarea 
                id="explorer-json"
                value={jsonString}
                onChange={(e) => setJsonString(e.target.value)}
                className="flex-1 w-full p-6 font-mono text-base leading-7 text-[#d4d4d4] bg-[#1e1e1e] resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-white z-20 flex-shrink-0 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button onClick={handleDeleteClick} className="flex items-center gap-2 px-5 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors">
            <Trash2 size={20} /> <span className="hidden md:inline">Delete Question</span>
          </button>

          <div className="flex items-center gap-4">
             <span className="text-slate-400 text-sm font-medium hidden md:inline">
                {saveStatus === "success" ? "Changes saved successfully" : "Unsaved changes"}
             </span>
             <button 
              onClick={handleSaveClick}
              disabled={saveStatus === "saving" || saveStatus === "success"}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${saveStatus === "success" ? "bg-green-500 scale-105" : "bg-slate-900 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5"}`}
            >
              {saveStatus === "saving" ? <Loader2 className="w-5 h-5 animate-spin" /> : saveStatus === "success" ? <><CheckCircle size={20} /> Saved!</> : <><Save size={20} /> Save Changes</>}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}