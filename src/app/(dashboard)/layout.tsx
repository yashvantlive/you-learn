"use client";

import AuthGate from "@/components/auth-gate";
import { DashboardNavbar } from "@/components/dashboard-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🔒 Security Wrapper
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        
        {/* ✅ Navigation Added Here */}
        <DashboardNavbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
        </main>
      </div>
    </AuthGate>
  );
}