"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, rtdb } from "@/lib/firebase"; 
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { ref, get } from "firebase/database"; 
import { Loader2 } from "lucide-react";

// ✅ Modular Components Imports
import ProfileHeader from "./_components/ProfileHeader";
import StatsOverview from "./_components/StatsOverview";
import BattleHistory from "./_components/BattleHistory";

// --- Types ---
interface UserProfile {
  displayName: string;
  email: string;
  role: string;
  isOnboarded: boolean;
}

// ✅ Updated Type: Added 'type' field
interface GameHistory {
  id: string;
  gameId: string;
  mode: "solo" | "multiplayer";
  type: "instant" | "exam"; 
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  subject: string;
  playedAt: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  
  // Stats State
  const [stats, setStats] = useState({
    totalGames: 0,
    totalXP: 0,
    accuracy: 0,
    level: 1,
    rankTitle: "Rookie",
    nextLevelXP: 1000
  });

  const isAdmin = userProfile?.role === "admin";

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // 1. Fetch User Profile
        const profileRef = ref(rtdb, `users/${user.uid}/profile`);
        const profileSnap = await get(profileRef);
        
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.val());
        }

        // 2. Fetch Game History
        const q = query(
          collection(db, "gameHistory"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(100) // Fetched more to distribute among categories
        );

        const snapshot = await getDocs(q);
        const games = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as GameHistory[];

        setHistory(games);
        calculateStats(games);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // --- Calculate Stats ---
  const calculateStats = (games: GameHistory[]) => {
    if (games.length === 0) return;

    const totalGames = games.length;
    const totalXP = games.reduce((acc, curr) => acc + (curr.score || 0), 0);
    
    const totalCorrect = games.reduce((acc, curr) => acc + (curr.correctAnswers || 0), 0);
    const totalQuestions = games.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const level = Math.floor(totalXP / 1000) + 1;
    const nextLevelXP = level * 1000;
    
    let rankTitle = "Rookie";
    if (level >= 5) rankTitle = "Scholar";
    if (level >= 10) rankTitle = "Elite";
    if (level >= 20) rankTitle = "Master";
    if (level >= 50) rankTitle = "Grandmaster";

    setStats({ totalGames, totalXP, accuracy, level, rankTitle, nextLevelXP });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>;
  }

  const xpProgress = ((stats.totalXP % 1000) / 1000) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-4 pb-24 md:p-8">
      
      {/* 1. Header Component */}
      <ProfileHeader 
        user={user} 
        stats={stats} 
        xpProgress={xpProgress} 
        isAdmin={isAdmin} 
        logout={logout} 
      />

      {/* 2. Stats Grid Component */}
      <StatsOverview stats={stats} />

      {/* 3. Categorized History Component (The 4 Cards) */}
      <BattleHistory history={history} />

    </div>
  );
}