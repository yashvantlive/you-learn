"use client";

import { motion } from "framer-motion";
import { Sparkles, Trophy, Flame } from "lucide-react";

interface WelcomeBannerProps {
  userName: string;
  rankTitle: string;
  level: number;
  xp: number;
  nextLevelXp: number;
}

export default function WelcomeBanner({ userName, rankTitle, level, xp, nextLevelXp }: WelcomeBannerProps) {
  const progress = Math.min((xp % 1000) / 10, 100);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
      {/* Background Patterns */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-white opacity-10 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* User Greeting */}
        <div className="text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md border border-white/10">
            <Flame size={14} className="text-orange-300 animate-pulse" /> Daily Streak: 3 Days
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back, {userName.split(" ")[0]}! 👋
          </h1>
          <p className="text-purple-100 font-medium">Your global rank is rising. Keep pushing!</p>
        </div>

        {/* Rank Progress Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full max-w-sm">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs font-bold text-purple-200 uppercase">Current Rank</p>
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" />
                <span className="font-black text-lg">{rankTitle} (Lvl {level})</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-purple-200 uppercase">Next Level</p>
              <span className="font-bold">{Math.round(1000 - (xp % 1000))} XP left</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(255,200,0,0.5)]"
            />
          </div>
        </div>

      </div>
    </div>
  );
}