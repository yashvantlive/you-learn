"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, FileText, Swords, Calendar, ArrowRight, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GameHistory {
  id: string;
  mode: "solo" | "multiplayer";
  type: "instant" | "exam";
  score: number;
  subject: string;
  playedAt: string;
  correctAnswers: number;
  totalQuestions: number;
}

interface BattleHistoryProps {
  history: GameHistory[];
}

export default function BattleHistory({ history }: BattleHistoryProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleExpand = (title: string) => {
    setExpandedCategory(prev => prev === title ? null : title);
  };

  // Helper function to format Date & Time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }); // Output Example: "Jan 5, 10:30 PM"
  };

  const categories = [
    {
      title: "Solo Instant",
      icon: Zap,
      mode: "solo",
      type: "instant",
      style: "bg-gradient-to-br from-blue-50 to-white border-blue-200",
      iconStyle: "bg-blue-500 text-white shadow-blue-200",
      textStyle: "text-blue-700",
      badgeStyle: "bg-blue-100 text-blue-700"
    },
    {
      title: "Solo Exam",
      icon: FileText,
      mode: "solo",
      type: "exam",
      style: "bg-gradient-to-br from-violet-50 to-white border-violet-200",
      iconStyle: "bg-violet-600 text-white shadow-violet-200",
      textStyle: "text-violet-700",
      badgeStyle: "bg-violet-100 text-violet-700"
    },
    {
      title: "Battle Instant",
      icon: Swords,
      mode: "multiplayer",
      type: "instant",
      style: "bg-gradient-to-br from-orange-50 to-white border-orange-200",
      iconStyle: "bg-orange-500 text-white shadow-orange-200",
      textStyle: "text-orange-700",
      badgeStyle: "bg-orange-100 text-orange-700"
    },
    {
      title: "Battle Exam",
      icon: Swords,
      mode: "multiplayer",
      type: "exam",
      style: "bg-gradient-to-br from-rose-50 to-white border-rose-200",
      iconStyle: "bg-rose-500 text-white shadow-rose-200",
      textStyle: "text-rose-700",
      badgeStyle: "bg-rose-100 text-rose-700"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-500" /> Battle Archives
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, idx) => {
          const categoryGames = history.filter(
            g => g.mode === cat.mode && g.type === cat.type
          );
          
          const isExpanded = expandedCategory === cat.title;
          const visibleGames = isExpanded ? categoryGames : categoryGames.slice(0, 3);

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-3xl shadow-sm border flex flex-col transition-all duration-300 ${cat.style} ${isExpanded ? 'row-span-2 h-auto' : 'h-full'}`}
            >
              
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl shadow-lg ${cat.iconStyle}`}>
                    <cat.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{cat.title}</h4>
                    <span className="text-xs font-bold text-slate-400">{categoryGames.length} Sessions</span>
                  </div>
                </div>
                {categoryGames.length > 0 && (
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${cat.badgeStyle}`}>
                    {categoryGames.reduce((acc, g) => acc + g.score, 0)} XP
                  </span>
                )}
              </div>

              {/* List */}
              <div className="flex-1 space-y-3">
                {categoryGames.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-200/50 rounded-2xl bg-white/50">
                    <cat.icon className="w-8 h-8 opacity-20" />
                    <p className="text-xs font-bold opacity-50">No battles yet</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {visibleGames.map((game, i) => (
                      <Link key={game.id} href={`/history/${game.id}`} className="block group">
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex justify-between items-center p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group-hover:scale-[1.01]"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                              {game.subject || "General Quiz"}
                            </p>
                            {/* ✅ Updated: Shows Date AND Time */}
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Clock size={10} /> {formatDateTime(game.playedAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-right">
                             <div className="hidden sm:block">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                                <span className={`text-sm font-black ${cat.textStyle}`}>+{game.score}</span>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <ArrowRight size={14} />
                             </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* View All Button */}
              {categoryGames.length > 3 && (
                <motion.div layout className="mt-4 pt-2 text-center border-t border-black/5">
                  <button 
                    onClick={() => toggleExpand(cat.title)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 w-full py-2 transition-colors"
                  >
                    {isExpanded ? (
                      <>Show Less <ChevronUp size={14} /></>
                    ) : (
                      <>View All ({categoryGames.length - 3} more) <ChevronDown size={14} /></>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}