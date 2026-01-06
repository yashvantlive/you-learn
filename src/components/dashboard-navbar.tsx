"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Swords, 
  User, 
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardNavbar() {
  const pathname = usePathname();
  const { user } = useAuth(); // Logout removed from here

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      activeColor: "text-violet-600 bg-violet-50"
    },
    {
      name: "Solo",
      href: "/solo",
      icon: BrainCircuit,
      activeColor: "text-blue-600 bg-blue-50"
    },
    {
      name: "Battle",
      href: "/room/join",
      icon: Swords,
      activeColor: "text-pink-600 bg-pink-50"
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      activeColor: "text-emerald-600 bg-emerald-50"
    }
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/50 bg-white/60 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sparkles size={16} fill="currentColor" />
          </div>
          <span className="font-black text-lg text-slate-900 tracking-tight hidden md:block">
            YouLearn
          </span>
        </Link>

        {/* Nav Items */}
        <nav className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all duration-200 font-bold text-sm",
                  isActive 
                    ? item.activeColor 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon size={18} className={cn(isActive && "animate-pulse")} />
                <span className={cn("hidden md:block", isActive && "block")}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Info (Logout Removed) */}
        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900 leading-none">
              {user?.displayName?.split(" ")[0]}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Student
            </span>
          </div>
          
          {/* Avatar / Profile Icon */}
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
             {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
             ) : (
                <User size={18} className="text-slate-500" />
             )}
          </div>
        </Link>

      </div>
    </header>
  );
}