"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Icons } from "@/components/icons";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // अगर यूजर पहले से लॉग इन है, तो उसे सीधे डैशबोर्ड पर भेजें
    if (user && !loading) {
      setIsRedirecting(true); // UI को लॉक कर दें
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      await login();
      // लॉगिन सफल होने पर useEffect अपने आप रिडायरेक्ट कर देगा
    } catch (error) {
      console.error("Login trigger failed", error);
    }
  };

  // 1. Loading UI: जब तक चेक हो रहा है कि यूजर लॉग इन है या नहीं
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <div className="bg-violet-100 p-4 rounded-full animate-pulse">
          <Icons.spinner className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
        <p className="text-slate-500 font-medium">Checking authentication...</p>
      </div>
    );
  }

  // 2. Main Login Form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-violet-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <Icons.user className="w-8 h-8 text-violet-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500">
            Sign in to save your progress and join battles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="w-full gap-3 relative overflow-hidden font-semibold text-base py-6 border-slate-200 hover:bg-slate-50 hover:text-slate-900" 
            disabled={loading || isRedirecting}
            variant="outline"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Secure Authentication</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}