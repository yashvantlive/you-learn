"use client";

import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, 
  MinusCircle, BookOpen, AlertCircle 
} from "lucide-react";
import { MathRenderer } from "@/components/math-renderer"; 

interface QuestionAnalysis {
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  options?: string[];
}

interface AnalysisData {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  subject: string;
  questionsData?: QuestionAnalysis[];
}

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const docRef = doc(db, "gameHistory", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as AnalysisData);
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div></div>;
  if (!data) return <div className="p-10 text-center text-slate-500">Result not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Performance Analysis</h1>
            <p className="text-slate-500 text-sm">{data.subject} • {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Score</p>
            <p className="text-2xl font-black text-violet-700">{data.score}</p>
          </div>
          <div className="space-y-1 border-x border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase">Accuracy</p>
            <p className="text-2xl font-black text-green-600">
              {Math.round((data.correctAnswers / data.totalQuestions) * 100)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-orange-400 uppercase">Time</p>
            <p className="text-xl font-black text-orange-700">{Math.round(data.timeSpent / 60)}m</p>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {!data.questionsData ? (
            <div className="p-10 bg-white rounded-2xl text-center border-2 border-dashed border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Detailed question data is not available for this session.</p>
            </div>
          ) : (
            data.questionsData.map((q, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                
                {/* Question Header */}
                <div className={`px-6 py-4 border-b flex justify-between items-center ${q.isCorrect ? 'bg-green-50/50 border-green-100' : q.userAnswer ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="font-bold text-slate-700 text-sm">Question {index + 1}</span>
                  {q.isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full"><CheckCircle size={12}/> Correct</span>
                  ) : q.userAnswer ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full"><XCircle size={12}/> Wrong</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded-full"><MinusCircle size={12}/> Skipped</span>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {/* Question Text */}
                  <div className="text-lg font-bold text-slate-900 leading-relaxed">
                    <MathRenderer text={q.question} />
                  </div>

                  {/* Options Grid */}
                  <div className="grid gap-3">
                    {q.options?.map((opt, i) => {
                      const isSelected = opt === q.userAnswer;
                      const isCorrectAnswer = opt === q.correctAnswer;
                      
                      let style = "border-slate-200 bg-white text-slate-600";
                      let icon = null;

                      if (isCorrectAnswer) {
                        style = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
                        icon = <CheckCircle size={18} className="text-green-600" />;
                      } else if (isSelected && !isCorrectAnswer) {
                        style = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
                        icon = <XCircle size={18} className="text-red-600" />;
                      } else if (isSelected) {
                         style = "border-green-500 bg-green-50 text-green-800";
                      }

                      return (
                        <div key={i} className={`p-4 rounded-xl border-2 flex justify-between items-center text-sm font-medium transition-all ${style}`}>
                          <div className="flex gap-3 items-center">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-black/5 text-xs font-bold">{String.fromCharCode(65+i)}</span>
                            <MathRenderer text={opt} />
                          </div>
                          {icon}
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-2">
                        <BookOpen size={14}/> Explanation
                      </h4>
                      <div className="text-sm text-blue-900 leading-relaxed">
                        <MathRenderer text={q.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}