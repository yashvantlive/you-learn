"use client";

import { Gamepad2, Target, Zap, Award } from "lucide-react";

interface StatsOverviewProps {
  stats: {
    totalGames: number;
    accuracy: number;
    totalXP: number;
    level: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const items = [
    { icon: Gamepad2, label: "Matches", value: stats.totalGames, color: "text-blue-500" },
    { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, color: "text-green-500" },
    { icon: Zap, label: "Total XP", value: stats.totalXP, color: "text-yellow-500" },
    { icon: Award, label: "Global Rank", value: `#${stats.level}`, color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((stat, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
          <stat.icon className={`w-8 h-8 ${stat.color}`} />
          <span className="text-2xl font-black text-slate-900">{stat.value}</span>
          <span className="text-xs font-bold text-slate-400 uppercase">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}