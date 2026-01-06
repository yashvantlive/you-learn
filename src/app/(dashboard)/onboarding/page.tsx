"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { rtdb } from "@/lib/firebase"; 
import { ref, update } from "firebase/database";
import { BookOpen, GraduationCap, CheckCircle, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [board, setBoard] = useState("CBSE");
  const [selectedClass, setSelectedClass] = useState("10");

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // ✅ Initialize Profile with Gamification Stats
      await update(ref(rtdb, `users/${user.uid}/profile`), {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        board: board,
        class: "Class " + selectedClass,
        role: "user",
        isOnboarded: true,
        joinedAt: Date.now(),
        // 🎮 Gamification Stats Init
        totalXP: 0,
        level: 1,
        totalGames: 0,
        rankTitle: "Rookie"
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Setup Profile 🚀</h1>
          <p className="text-slate-500 font-medium">Select your academic preferences.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><GraduationCap size={18} /> Select Board</label>
            <div className="grid grid-cols-3 gap-2">
              {["CBSE", "ICSE", "State"].map((b) => (
                <button key={b} onClick={() => setBoard(b)} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${board === b ? "border-violet-600 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-500 hover:border-violet-300"}`}>{b}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><BookOpen size={18} /> Select Class</label>
            <div className="grid grid-cols-4 gap-2">
              {["9", "10", "11", "12"].map((c) => (
                <button key={c} onClick={() => setSelectedClass(c)} className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${selectedClass === c ? "border-violet-600 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-500 hover:border-violet-300"}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" /> : <>Complete Setup <CheckCircle size={20} /></>}
        </button>
      </div>
    </div>
  );
}