"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, rtdb } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Loader2, Sparkles, ShieldCheck, FileText, Home } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * 🔒 ENGINEERING NOTE: COOP/COEP WARNING
   * * If you see "Cross-Origin-Opener-Policy policy would block the window.close call" in console:
   * * 1. STATUS: EXPECTED BEHAVIOR (Do not fix)
   * 2. CAUSE:  The Google Auth popup runs on a cross-origin domain. When it completes and 
   * attempts to self-close via window.close(), modern browser COOP isolation 
   * flags this interaction because the opener (our app) enforces security policies.
   * 3. IMPACT: NONE. The auth token is successfully passed before this warning triggers.
   * The popup closes successfully despite the warning.
   * 4. ACTION: No action required. Do not relax headers further (e.g., unsafe-none) 
   * just to silence a harmless console log.
   */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Google Sign In
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Check Profile Status in Realtime DB
      const profileRef = ref(rtdb, `users/${user.uid}/profile`);
      const snapshot = await get(profileRef);

      // 3. Intelligent Redirect
      if (snapshot.exists() && snapshot.val().isOnboarded === true) {
        // If profile exists and onboarded -> Dashboard
        router.push("/dashboard");
      } else {
        // If new user or incomplete profile -> Onboarding
        router.push("/onboarding");
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Failed to sign in. Please try again.");
      setLoading(false); // Stop loading on error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl space-y-8 animate-in slide-in-from-bottom-4 border border-slate-100">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-violet-100 text-violet-600 rounded-2xl mb-2 shadow-inner">
            <Sparkles size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Welcome Back!</h1>
          <p className="text-slate-500 font-medium">Ready to conquer your exams?</p>
        </div>

        {/* Buttons Group */}
        <div className="space-y-3">
          {/* 1. Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-violet-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Checking profile...
              </span>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </button>
          
          {/* 2. ✅ Back to Home Button (Inside Card) */}
          <Link 
            href="/" 
            className="w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} /> Back to Home
          </Link>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Footer & Legal Links */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Secure Login Powered by Google
          </p>
          
          <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-500">
            <Link href="/privacy" className="flex items-center gap-1.5 hover:text-violet-600 transition-colors">
              <ShieldCheck size={14} /> Privacy Policy
            </Link>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <Link href="/terms" className="flex items-center gap-1.5 hover:text-violet-600 transition-colors">
              <FileText size={14} /> Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}