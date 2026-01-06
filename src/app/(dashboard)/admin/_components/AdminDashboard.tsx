"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BarChart3,
  BookOpen,
  Layers,
  TrendingUp,
  Database,
  PieChart,
  Activity,
} from "lucide-react";

interface Stats {
  totalQuestions: number;
  byBoard: Record<string, number>;
  byClass: Record<string, number>;
  bySubject: Record<string, number>;
  byChapter: Record<string, number>;
  byDifficulty: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    byBoard: {},
    byClass: {},
    bySubject: {},
    byChapter: {},
    byDifficulty: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "board" | "class" | "subject" | "chapter" | "difficulty"
  >("board");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const questionsRef = collection(db, "questions");
      const snapshot = await getDocs(questionsRef);

      const newStats: Stats = {
        totalQuestions: snapshot.size,
        byBoard: {},
        byClass: {},
        bySubject: {},
        byChapter: {},
        byDifficulty: {},
      };

      // Heavy Calculation
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.board) newStats.byBoard[data.board] = (newStats.byBoard[data.board] || 0) + 1;
        if (data.class) newStats.byClass[data.class] = (newStats.byClass[data.class] || 0) + 1;
        if (data.subject) newStats.bySubject[data.subject] = (newStats.bySubject[data.subject] || 0) + 1;
        if (data.chapter) newStats.byChapter[data.chapter] = (newStats.byChapter[data.chapter] || 0) + 1;
        if (data.difficulty) newStats.byDifficulty[data.difficulty] = (newStats.byDifficulty[data.difficulty] || 0) + 1;
      });

      // ✅ FIX 1: Defer state update to next frame to avoid freezing (Forced Reflow)
      requestAnimationFrame(() => {
        setStats(newStats);
        setLoading(false);
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    switch (selectedView) {
      case "board": return stats.byBoard;
      case "class": return stats.byClass;
      case "subject": return stats.bySubject;
      case "chapter": return stats.byChapter;
      case "difficulty": return stats.byDifficulty;
    }
  };

  const getColor = (index: number) => {
    const colors = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-cyan-500 to-blue-600",
      "from-yellow-500 to-orange-600",
      "from-indigo-500 to-purple-600",
    ];
    return colors[index % colors.length];
  };

  // ✅ FIX 2: Memoize sorted data to prevent recalc on re-renders
  const sortedEntries = useMemo(() => {
      const currentData = getCurrentData();
      return Object.entries(currentData).sort((a, b) => b[1] - a[1]);
  }, [stats, selectedView]);

  const maxValue = Math.max(1, ...Object.values(getCurrentData())); // Avoid division by zero

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center">
        <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-violet-500" />
          Admin Dashboard
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Complete overview of your question bank
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Questions", count: stats.totalQuestions, icon: Database, gradient: "from-violet-400 to-purple-600" },
          { label: "Boards", count: Object.keys(stats.byBoard).length, icon: BookOpen, gradient: "from-blue-400 to-indigo-600" },
          { label: "Subjects", count: Object.keys(stats.bySubject).length, icon: Layers, gradient: "from-green-400 to-emerald-600" },
          { label: "Chapters", count: Object.keys(stats.byChapter).length, icon: PieChart, gradient: "from-orange-400 to-red-600" },
          { label: "Classes", count: Object.keys(stats.byClass).length, icon: TrendingUp, gradient: "from-pink-400 to-rose-600" }
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }} // Reduced delay for snappier load
            className="glass-panel p-6 text-center space-y-3"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mx-auto`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{item.count}</p>
              <p className="text-sm text-slate-600 font-semibold">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Selector */}
      <motion.div className="glass-panel p-4">
        <div className="flex flex-wrap gap-3">
          {[
            { key: "board", label: "By Board", icon: BookOpen },
            { key: "class", label: "By Class", icon: Activity },
            { key: "subject", label: "By Subject", icon: Layers },
            { key: "chapter", label: "By Chapter", icon: PieChart },
            { key: "difficulty", label: "By Difficulty", icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedView(key as typeof selectedView)}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                selectedView === key
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div key={selectedView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 capitalize">
          Questions {selectedView === "difficulty" ? "by" : "per"} {selectedView}
        </h3>
        {sortedEntries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="font-semibold">No data available</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedEntries.map(([name, count], index) => {
              const percentage = (count / maxValue) * 100;
              return (
                <motion.div 
                    key={name} 
                    initial={{ x: -20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: Math.min(index * 0.05, 0.5) }} // Cap delay for long lists
                    className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[70%]">{name}</span>
                    <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">{count} ({Math.round((count / stats.totalQuestions) * 100)}%)</span>
                  </div>
                  
                  {/* ✅ FIX 3: Use transform (scaleX) instead of width animation to prevent Reflow */}
                  <div className="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <motion.div 
                        initial={{ scaleX: 0 }} 
                        animate={{ scaleX: 1 }} 
                        style={{ width: `${percentage}%`, originX: 0 }} // Set width via style, animate scale
                        transition={{ duration: 0.8, ease: "easeOut" }} 
                        className={`h-full bg-gradient-to-r ${getColor(index)} rounded-full`} 
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}