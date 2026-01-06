"use client";

import Link from "next/link";
import { LogOut, Shield, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  user: any;
  stats: any;
  xpProgress: number;
  isAdmin: boolean;
  logout: () => void;
}

export default function ProfileHeader({ user, stats, xpProgress, isAdmin, logout }: ProfileHeaderProps) {
  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-10 group-hover:opacity-15 transition-opacity" />
      
      <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        
        {/* 1. Avatar Section */}
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-white shadow-2xl relative z-10">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-4 border-slate-50"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-5xl font-black text-violet-600 uppercase border-4 border-slate-50">
                {user?.displayName?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full border-4 border-white whitespace-nowrap shadow-lg">
            Level {stats.level}
          </div>
        </div>

        {/* 2. Info & XP Section */}
        <div className="flex-1 w-full flex flex-col justify-between min-h-[140px]">
          
          {/* Top Row: Name & Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
                {user?.displayName}
                {isAdmin && (
                  <span title="Admin User" className="cursor-help bg-blue-100 p-1 rounded-full">
                    <Shield size={16} className="text-blue-600" />
                  </span>
                )}
              </h1>
              <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
                <Crown size={16} className="text-yellow-500" /> {stats.rankTitle}
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-sm">{user?.email}</span>
              </p>
            </div>

            {/* Actions Buttons (Aligned Right) */}
            <div className="flex flex-row gap-3">
               {isAdmin && (
                  <Link href="/admin" className="px-5 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all">
                    <Shield size={16} /> <span className="hidden sm:inline">Admin</span>
                  </Link>
               )}
               <button onClick={logout} className="px-5 py-3 bg-white border-2 border-red-100 text-red-600 text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all">
                  <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
               </button>
            </div>
          </div>

          {/* XP Bar - Moved Down Significantly */}
          <div className="w-full max-w-lg space-y-2 mt-8 md:mt-auto pt-4 mx-auto md:mx-0">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>XP Progress</span>
              <span>{Math.round(xpProgress)}% to Lvl {stats.level + 1}</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${xpProgress}%` }} 
                className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}