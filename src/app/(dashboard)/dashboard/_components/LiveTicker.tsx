"use client";

import { useEffect, useState } from "react";
import { Zap, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAKE_EVENTS = [
  { user: "Aarav", action: "won 50 XP in Battle", icon: Swords },
  { user: "Priya", action: "reached Level 5", icon: Zap },
  { user: "Rahul", action: "just started a Solo Match", icon: Zap },
  { user: "Sneha", action: "is dominating the leaderboard!", icon: Swords },
  { user: "Vikram", action: "won a Battle Royale", icon: Swords },
];

export default function LiveTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FAKE_EVENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentEvent = FAKE_EVENTS[index];

  return (
    <div className="flex items-center justify-center py-2">
      <div className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-slate-700">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-slate-400 uppercase tracking-wider">LIVE:</span>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1"
          >
            <currentEvent.icon size={12} className="text-yellow-400" />
            <span className="text-white">{currentEvent.user}</span>
            <span className="text-slate-400">{currentEvent.action}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}