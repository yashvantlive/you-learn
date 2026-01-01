"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Icons } from "@/components/icons";
import { StatCard } from "./_components/stat-card";
import { GameModeCard } from "./_components/game-mode-card";
import { UserStats, getLevelInfo } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // 1. Fetch Realtime Stats
  useEffect(() => {
    if (!user) return;

    const statsRef = ref(db, `users/${user.uid}/stats`);
    
    // Listen for changes (Realtime update!)
    const unsubscribe = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStats(snapshot.val());
      } else {
        // Default stats for new users
        setStats({
          totalGames: 0,
          totalWins: 0,
          totalXP: 0,
          totalCoins: 0,
          winRate: 0,
          avgAccuracy: 0,
          currentStreak: 0,
          bestStreak: 0,
          rank: "Unranked"
        });
      }
      setLoadingStats(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Loading State
  if (authLoading || (user && loadingStats)) {
    return <DashboardSkeleton />;
  }

  // 3. Derived Data (Level Calculation)
  const xp = stats?.totalXP || 0;
  const { level, progress, nextLevelXP } = getLevelInfo(xp);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER: Welcome & Level Progress */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.displayName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500">Ready to learn something new today?</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
            <span className="font-bold text-violet-600">Level {level}</span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-600 transition-all duration-1000" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-xs text-slate-400">{xp}/{nextLevelXP} XP</span>
          </div>
        </div>
      </section>

      {/* STATS GRID */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total XP" 
          value={stats?.totalXP.toLocaleString() || "0"} 
          icon={Icons.trophy} 
          color="text-yellow-600 bg-yellow-50"
        />
        <StatCard 
          label="Games Played" 
          value={stats?.totalGames || "0"} 
          icon={Icons.game} 
          color="text-blue-600 bg-blue-50"
        />
        <StatCard 
          label="Wins" 
          value={stats?.totalWins || "0"} 
          icon={Icons.check} 
          color="text-emerald-600 bg-emerald-50"
        />
        <StatCard 
          label="Accuracy" 
          value={`${stats?.avgAccuracy || 0}%`} 
          icon={Icons.spinner} 
          color="text-violet-600 bg-violet-50"
        />
      </section>

      {/* GAME MODES */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Choose Your Battle</h2>
        <div className="grid gap-6 md:grid-cols-2">
          
          <GameModeCard 
            title="Solo Practice"
            description="Master subjects at your own pace. Adaptive AI questions to help you improve weak areas."
            icon={Icons.user}
            href="/solo"
            buttonText="Start Practice"
            gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500"
          />

          <GameModeCard 
            title="Live Multiplayer"
            description="Compete with up to 1000 students in real-time. Join a room or host your own battle."
            icon={Icons.users}
            href="/room/join" // Or create, usually 'join' is the main entry
            buttonText="Enter Arena"
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          
        </div>
      </section>

      {/* (Optional) Recent History - Can be added later */}
    </div>
  );
}

// 4. Loading Skeleton (UI Placeholder)
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}