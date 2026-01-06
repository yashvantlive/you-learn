"use client";

import { useEffect, useState } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, query, orderByChild, limitToLast, get } from "firebase/database";
import { Crown, Trophy, Medal, User } from "lucide-react";

interface LeaderboardUser {
  uid: string;
  displayName: string;
  totalXP: number;
  level: number;
  rankTitle: string;
}

export default function GlobalLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch top 10 users by XP (Note: RTDB sorts ascending, so we reverse later)
        const usersRef = ref(rtdb, "users");
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const userList: LeaderboardUser[] = Object.keys(data).map(key => ({
            uid: key,
            displayName: data[key].profile.displayName || "Unknown",
            totalXP: data[key].profile.totalXP || 0,
            level: data[key].profile.level || 1,
            rankTitle: data[key].profile.rankTitle || "Rookie"
          }));

          // Sort Descending by XP
          const sorted = userList.sort((a, b) => b.totalXP - a.totalXP).slice(0, 10);
          setLeaders(sorted);
        }
      } catch (error) {
        console.error("Leaderboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-4 text-center text-sm text-slate-400">Loading Ranks...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Trophy className="text-yellow-400" size={18} /> Global Rankings
        </h3>
        <span className="text-xs bg-white/10 px-2 py-1 rounded">Top 10</span>
      </div>
      
      <div className="divide-y divide-slate-100">
        {leaders.map((user, index) => (
          <div key={user.uid} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 flex items-center justify-center font-bold text-slate-500">
              {index === 0 ? <Crown size={20} className="text-yellow-500 fill-yellow-500" /> : 
               index === 1 ? <Medal size={20} className="text-slate-400" /> :
               index === 2 ? <Medal size={20} className="text-orange-400" /> : 
               `#${index + 1}`}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="text-violet-600 font-bold">{user.rankTitle}</span> • Lvl {user.level}
              </p>
            </div>
            
            <div className="text-right">
              <span className="block font-black text-slate-800">{user.totalXP}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">XP</span>
            </div>
          </div>
        ))}

        {leaders.length === 0 && (
          <div className="p-6 text-center text-slate-400 text-sm">No players found yet.</div>
        )}
      </div>
    </div>
  );
}