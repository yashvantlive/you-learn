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

  const handleGoogleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError("");

    try {
      // Force account selection to prevent auto-login issues
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      // 1. Google Sign In
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user) {
        throw new Error("Authentication failed: No user data");
      }

      // 2. Check Profile Status in Realtime DB
      const profileRef = ref(rtdb, `users/${user.uid}/profile`);
      const snapshot = await get(profileRef);

      // 3. Intelligent Redirect
      if (snapshot.exists() && snapshot.val().isOnboarded === true) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }

    } catch (err: any) {
      console.error("Login Error:", err);

      // Handle specific Firebase Auth errors
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup blocked. Please allow popups for this site.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("Another sign-in is in progress.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      // CRITICAL: Always reset loading state
      setLoading(false);
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
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-violet-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Signing in...
              </span>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </button>
          
          <Link 
            href="/" 
            className="w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} /> Back to Home
          </Link>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-xl text-center border border-red-100 animate-in fade-in">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
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