"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is finished and user is missing
    if (!isLoading && !user) {
      console.log("AuthGate: Unauthorized, redirecting to login");
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" aria-hidden="true" />
        <p className="text-slate-500 font-medium animate-pulse">Checking authentication…</p>
        <span className="sr-only">Authentication check in progress</span>
      </div>
    );
  }

  // If not loading and no user, return null (useEffect handles redirect)
  if (!user) {
    return null;
  }

  // User is authenticated
  return <>{children}</>;
}