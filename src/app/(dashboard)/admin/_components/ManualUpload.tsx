"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Upload } from "lucide-react";
import ManualQuestionForm, { QuestionForm } from "./ManualQuestionForm";

const INITIAL_FORM: QuestionForm = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  board: "CBSE",
  class: "",
  subject: "",
  chapter: "",
  difficulty: "Medium"
};

export default function ManualUpload() {
  const [form, setForm] = useState<QuestionForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploadCount, setUploadCount] = useState(0);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    if (form.correctAnswer === form.options[index] && !value) {
      setForm({ ...form, options: newOptions, correctAnswer: "" });
    } else {
      setForm({ ...form, options: newOptions });
    }
  };

  const handleCorrectAnswerSelect = (index: number) => {
    if (form.options[index]) {
      setForm({ ...form, correctAnswer: form.options[index] });
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const validationErrors: string[] = [];
    if (!form.question.trim()) validationErrors.push("Question text is required");
    if (!form.board) validationErrors.push("Board is required");
    if (!form.class) validationErrors.push("Class is required");
    if (!form.subject) validationErrors.push("Subject is required");
    if (!form.chapter.trim()) validationErrors.push("Chapter is required");
    if (form.options.some(opt => !opt.trim())) validationErrors.push("All options must be filled");
    if (!form.correctAnswer) validationErrors.push("Please select the correct answer");
    if (form.correctAnswer && !form.options.includes(form.correctAnswer)) validationErrors.push("Correct answer must match one of the options");

    if (validationErrors.length > 0) {
      setMessage({ type: 'error', text: validationErrors[0] });
      setLoading(false);
      return;
    }

    try {
      const questionData = {
        question: form.question.trim(),
        options: form.options.map(opt => opt.trim()),
        correctAnswer: form.correctAnswer.trim(),
        explanation: form.explanation.trim(),
        board: form.board,
        class: form.class,
        subject: form.subject,
        chapter: form.chapter.trim(),
        difficulty: form.difficulty,
        createdAt: serverTimestamp(),
        uploadedBy: "admin",
        version: "1.0"
      };

      await addDoc(collection(db, "questions"), questionData);
      
      // ✅ OPTIMIZATION: Use requestAnimationFrame for state updates to avoid reflow spikes
      requestAnimationFrame(() => {
        setUploadCount(prev => prev + 1);
        setMessage({ type: 'success', text: `Question #${uploadCount + 1} uploaded successfully! 🎉` });
        setForm({ ...INITIAL_FORM, board: form.board, class: form.class, subject: form.subject, difficulty: form.difficulty });
      });
      
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error("Upload Error:", error);
      setMessage({ type: 'error', text: 'Failed to upload question. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Upload className="w-8 h-8 text-violet-500" />
          Question Uplink
        </h2>
        <p className="text-slate-500 font-medium mt-2">Add new challenges to the database</p>
      </div>

      <ManualQuestionForm 
        form={form}
        setForm={setForm}
        loading={loading}
        message={message}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onOptionChange={handleOptionChange}
        onCorrectAnswerSelect={handleCorrectAnswerSelect}
      />
    </div>
  );
}