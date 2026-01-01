"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* ------------------------------- */}
      {/* 🖥️ DESKTOP SIDEBAR (Hidden on Mobile) */}
      {/* ------------------------------- */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white fixed inset-y-0 z-50 shadow-sm">
        
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white">
            <Icons.trophy className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            YouLearn
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-violet-50 text-violet-700 shadow-sm border border-violet-100" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-violet-600" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button (Bottom) */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-slate-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <Icons.logout className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------- */}
      {/* 📱 MOBILE BOTTOM NAV (Hidden on Desktop) */}
      {/* ------------------------------- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                  isActive ? "text-violet-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <div className={cn(
                  "p-1 rounded-xl transition-all",
                  isActive && "bg-violet-100"
                )}>
                  <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ------------------------------- */}
      {/* 📄 MAIN CONTENT AREA */}
      {/* ------------------------------- */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="mx-auto max-w-5xl p-4 pb-24 md:p-8 md:pb-8">
          {children}
        </div>
      </main>

    </div>
  );
}