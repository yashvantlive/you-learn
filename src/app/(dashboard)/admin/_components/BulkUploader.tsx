"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Upload, FileJson, CheckCircle, AlertCircle, Loader, Code, FileText, Download, Eye, X, Save
} from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// ✅ 1. OPTIMIZATION: Memoized Item Component to prevent reflows in large lists
const PreviewItem = memo(({ q, index }: { q: Question, index: number }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-violet-300 transition-colors">
    <div className="flex justify-between items-start gap-4">
      <div className="flex gap-3">
        <span className="flex-shrink-0 w-8 h-8 bg-violet-100 text-violet-700 font-bold rounded-lg flex items-center justify-center text-sm">
          #{index + 1}
        </span>
        <div>
          <p className="font-bold text-slate-900 mb-1">{q.question}</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="bg-slate-100 px-2 py-1 rounded">{q.board}</span>
            <span className="bg-slate-100 px-2 py-1 rounded">{q.class}</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{q.subject}</span>
            <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">{q.chapter}</span>
            <span className={`px-2 py-1 rounded ${q.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{q.difficulty}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-bold text-slate-400 uppercase">Correct Answer</span>
        <p className="font-bold text-emerald-600">{q.correctAnswer}</p>
      </div>
    </div>
  </div>
));
PreviewItem.displayName = "PreviewItem";

export default function BulkUploader() {
  const [jsonInput, setJsonInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [previewData, setPreviewData] = useState<Question[] | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const sampleJSON = {
    questions: [
      {
        question: "What is the capital of India?",
        options: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
        correctAnswer: "Delhi",
        explanation: "Delhi is the capital city of India.",
        board: "CBSE",
        class: "Class 10",
        subject: "Social Science",
        chapter: "Federalism",
        difficulty: "Easy",
      }
    ],
  };

  const validateQuestion = (q: any, index: number): string | null => {
    if (!q.question || typeof q.question !== "string") return `Question ${index + 1}: Missing or invalid 'question' field`;
    if (!Array.isArray(q.options) || q.options.length !== 4) return `Question ${index + 1}: 'options' must be an array of 4 strings`;
    if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) return `Question ${index + 1}: 'correctAnswer' must be one of the options`;
    if (!q.board || !q.class || !q.subject || !q.chapter) return `Question ${index + 1}: Missing required fields (board, class, subject, chapter)`;
    if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) return `Question ${index + 1}: 'difficulty' must be Easy, Medium, or Hard`;
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    if (!uploadedFile.name.endsWith(".json")) { alert("Please upload a JSON file"); return; }
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => { setJsonInput(event.target?.result as string); };
    reader.readAsText(uploadedFile);
  };

  const handlePreview = () => {
    setResult(null);
    try {
      if (!jsonInput.trim()) {
        alert("Please select a file or paste JSON");
        return;
      }
      const data = JSON.parse(jsonInput);
      if (!data.questions || !Array.isArray(data.questions)) throw new Error("JSON must contain a 'questions' array");

      const questions: Question[] = data.questions;
      const errors: string[] = [];

      questions.forEach((q, i) => {
        const error = validateQuestion(q, i);
        if (error) errors.push(error);
      });

      if (errors.length > 0) {
        setResult({ success: 0, failed: errors.length, errors });
        return;
      }

      // ✅ 2. OPTIMIZATION: Defer large state update to next frame
      requestAnimationFrame(() => {
        setPreviewData(questions);
      });
      
    } catch (error) {
      setResult({ success: 0, failed: 1, errors: [error instanceof Error ? error.message : "Invalid JSON format"] });
    }
  };

  const cancelPreview = () => {
    setPreviewData(null);
    setResult(null);
  };

  const handleFinalUpload = async () => {
    if (!previewData) return;
    setUploading(true);
    setResult(null);

    try {
      let successCount = 0;
      const batchSize = 500;
      
      for (let i = 0; i < previewData.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = previewData.slice(i, i + batchSize);
        
        for (const question of chunk) {
          const docRef = doc(collection(db, "questions"));
          batch.set(docRef, { ...question, createdAt: serverTimestamp(), uploadedBy: "admin", uploadMethod: "bulk" });
        }
        await batch.commit();
        successCount += chunk.length;
      }

      setResult({ success: successCount, failed: 0, errors: [] });
      setJsonInput("");
      setFile(null);
      setPreviewData(null);
    } catch (error) {
      setResult({ success: 0, failed: 1, errors: [error instanceof Error ? error.message : "Upload Failed"] });
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const dataStr = JSON.stringify(sampleJSON, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-questions.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Upload className="w-8 h-8 text-violet-500" />
          Bulk Question Upload
        </h2>
        <p className="text-slate-500 font-medium mt-2">Upload multiple questions using JSON file or direct paste</p>
      </div>

      {!previewData && (
        <>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <FileJson className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2">Need a template?</h3>
                <p className="text-sm text-slate-600 mb-3">Download our sample JSON file to see the correct format for bulk uploads.</p>
                <button onClick={downloadSample} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Sample JSON
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-violet-500" /> Upload JSON File</h3>
              <label htmlFor="file-upload" className="block w-full cursor-pointer">
                <input id="file-upload" name="file" type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700">{file ? file.name : "Click to upload JSON file"}</p>
                  <p className="text-sm text-slate-500 mt-1">or drag and drop here</p>
                </div>
              </label>
            </motion.div>
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-panel p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Code className="w-5 h-5 text-violet-500" /> Paste JSON Directly</h3>
              <label htmlFor="json-input" className="sr-only">Paste JSON Code</label>
              <textarea 
                id="json-input"
                name="jsonInput"
                value={jsonInput} 
                onChange={(e) => setJsonInput(e.target.value)} 
                placeholder='{"questions": [... ]}' 
                rows={8} 
                className="w-full p-4 bg-slate-900 text-green-400 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-violet-400 outline-none" 
              />
            </motion.div>
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <button onClick={handlePreview} disabled={!jsonInput.trim()} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
              <Eye className="w-6 h-6" /> Preview & Verify Questions
            </button>
          </motion.div>
        </>
      )}

      {previewData && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-0 overflow-hidden border-2 border-violet-500/30">
          <div className="p-6 bg-violet-50/50 border-b border-violet-100 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <CheckCircle className="text-green-600" />
                Ready to Upload: {previewData.length} Questions
              </h3>
              <p className="text-slate-500 text-sm">Please verify the list below before confirming.</p>
            </div>
            <button onClick={cancelPreview} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 font-bold flex items-center gap-2 transition-colors">
              <X size={18} /> Cancel
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-6 space-y-4 bg-slate-50/50">
            {/* ✅ Optimized List Rendering */}
            {previewData.map((q, i) => (
              <PreviewItem key={i} q={q} index={i} />
            ))}
          </div>

          <div className="p-6 bg-white border-t border-slate-200">
            <button 
              onClick={handleFinalUpload} 
              disabled={uploading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? <><Loader className="w-6 h-6 animate-spin" /> Uploading to Database...</> : <><Save className="w-6 h-6" /> Confirm & Upload {previewData.length} Questions</>}
            </button>
          </div>
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`glass-panel p-6 ${result.errors.length > 0 ? "bg-red-50 border-2 border-red-200" : "bg-green-50 border-2 border-green-200"}`}>
          <div className="flex items-start gap-4">
            {result.errors.length > 0 ? <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" /> : <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />}
            <div className="flex-1">
              <h3 className={`font-bold text-lg mb-2 ${result.errors.length > 0 ? "text-red-900" : "text-green-900"}`}>{result.errors.length > 0 ? "Upload Failed" : "Upload Successful!"}</h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700"><strong>Success:</strong> {result.success} questions uploaded</p>
                {result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-red-800 mb-2">Errors:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-700">{result.errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}