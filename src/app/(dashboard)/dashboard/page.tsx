"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, rtdb } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { ref, get } from "firebase/database";
import { Loader2 } from "lucide-react";

// ✅ Import Premium Components
import WelcomeBanner from "./_components/WelcomeBanner";
import LiveTicker from "./_components/LiveTicker";
import ActionGrid from "./_components/ActionGrid";
import StatsOverview from "../profile/_components/StatsOverview"; // Reusing profile stats
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalXP: 0,
    accuracy: 0,
    level: 1,
    rankTitle: "Rookie",
    nextLevelXP: 1000
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // 1. Fetch Realtime Profile (Fast)
        const profileRef = ref(rtdb, `users/${user.uid}/profile`);
        const profileSnap = await get(profileRef);
        
        let xp = 0;
        if (profileSnap.exists()) {
          xp = profileSnap.val().totalXP || 0;
        }

        // 2. Fetch History for Stats (Standard)
        const q = query(
          collection(db, "gameHistory"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const games = snapshot.docs.map(doc => doc.data());

        // 3. Calc Stats
        const totalGames = games.length;
        const totalCorrect = games.reduce((acc, curr) => acc + (curr.correctAnswers || 0), 0);
        const totalQuestions = games.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        const level = Math.floor(xp / 1000) + 1;
        
        let rankTitle = "Rookie";
        if (level >= 5) rankTitle = "Scholar";
        if (level >= 10) rankTitle = "Elite";
        if (level >= 20) rankTitle = "Master";
        if (level >= 50) rankTitle = "Grandmaster";

        setStats({ totalGames, totalXP: xp, accuracy, level, rankTitle, nextLevelXP: level * 1000 });
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8 pb-32">
      
      {/* 1. Live Activity Ticker (FOMO) */}
      <LiveTicker />

      {/* 2. Hero Section (Motivation) */}
      <WelcomeBanner 
        userName={user?.displayName || "Champion"}
        rankTitle={stats.rankTitle}
        level={stats.level}
        xp={stats.totalXP}
        nextLevelXp={stats.nextLevelXP}
      />

      {/* 3. Main Game Modes (Premium 3D Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xl font-bold text-slate-800">Start Playing</h2>
        </div>
        <ActionGrid />
      </div>

      {/* 4. Quick Stats (Reused from Profile for consistency) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xl font-bold text-slate-800">Your Progress</h2>
           <Link href="/profile" className="text-sm font-bold text-violet-600 hover:underline">View Full Profile</Link>
        </div>
        <StatsOverview stats={stats} />
      </div>

    </div>
  );
}