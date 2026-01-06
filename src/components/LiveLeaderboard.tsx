"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, CheckCircle2, AlertCircle, Shield } from "lucide-react";

interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: string;
}

interface LiveLeaderboardProps {
  players: Player[];
  currentPlayerId: string;
  isHost: boolean;
  onEndGame: () => void;
  gameMode?: "instant" | "exam"; 
}

export default function LiveLeaderboard({ players, currentPlayerId, isHost, onEndGame, gameMode = "instant" }: LiveLeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // ✅ EXAM MODE (Updated: Glassmorphism Style)
  if (gameMode === "exam") {
    if (!isHost) return null; 

    const submittedCount = players.filter(p => p.score > 0).length;
    const totalPlayers = players.length;

    return (
      // Glass Container
      <div className="mt-6 p-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl overflow-hidden relative">
          
          {/* Glass Shine Effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
              <Trophy size={14} className="text-slate-400" /> Exam Status
            </h4>

            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${submittedCount === totalPlayers ? "bg-green-100 border-green-200 text-green-600" : "bg-blue-100 border-blue-200 text-blue-600"}`}>
                  {submittedCount === totalPlayers ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Submissions</p>
                 <p className="text-2xl font-black text-slate-800">
                    {submittedCount} <span className="text-lg text-slate-400 font-bold">/ {totalPlayers}</span>
                 </p>
               </div>
            </div>

            <button 
              onClick={onEndGame}
              className="w-full py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 backdrop-blur-md transition-all border border-red-400/50"
            >
              End Battle
            </button>
          </div>
      </div>
    );
  }

  // ✅ INSTANT MODE (Vertical Sidebar List) - Keep as is
  return (
    <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm h-fit sticky top-4">
      <div className="flex items-center justify-between mb-4 px-1">
         <h3 className="text-sm font-black text-slate-700 uppercase flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" /> Leaderboard
         </h3>
         {isHost && (
            <button onClick={onEndGame} title="End Game" className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
              <Shield size={16} />
            </button>
         )}
      </div>

      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        <AnimatePresence mode="popLayout">
          {sortedPlayers.map((player, index) => {
            const isMe = player.id === currentPlayerId;
            const isTop = index === 0;
            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isMe ? "bg-violet-50 border-violet-500 z-10" : "bg-slate-50 border-transparent hover:border-slate-200"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xs ${isTop ? "bg-yellow-400 text-white shadow-sm" : "bg-white text-slate-400"}`}>{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${isMe ? "text-violet-700" : "text-slate-700"}`}>{player.name} {isMe && "(You)"}</p>
                  <p className="text-[10px] font-bold text-slate-400">{player.score} XP</p>
                </div>
                {isTop && <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full shadow-md border-2 border-white z-20"><Crown size={10} fill="currentColor" /></div>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}