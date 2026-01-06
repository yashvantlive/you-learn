"use client";

import Link from "next/link";
import { BrainCircuit, Swords, ArrowRight, Zap } from "lucide-react";

export default function ActionGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* Solo Card */}
      <Link href="/solo" className="group relative overflow-hidden rounded-3xl bg-white p-1 border-2 border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:scale-[1.01]">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <BrainCircuit size={120} className="text-blue-600 rotate-12" />
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-[20px] h-full flex flex-col justify-between relative z-10">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 text-white">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Solo Training</h3>
              <p className="text-slate-500 font-medium mt-1">Master your concepts with AI-powered unlimited practice.</p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-blue-700 font-bold group-hover:gap-4 transition-all">
            Start Practice <ArrowRight size={20} />
          </div>
        </div>
      </Link>

      {/* Battle Card (Highlighted) */}
      <Link href="/room/join" className="group relative overflow-hidden rounded-3xl bg-slate-900 p-1 transition-all hover:shadow-2xl hover:scale-[1.01] hover:shadow-violet-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 opacity-20 group-hover:opacity-30 transition-opacity" />
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Swords size={120} className="text-white -rotate-12" />
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-[20px] h-full flex flex-col justify-between relative z-10 border border-white/10">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 text-white">
                <Swords size={32} />
              </div>
              <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> 12 Active
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Live Battles</h3>
              <p className="text-slate-400 font-medium mt-1">Compete with friends or random players in real-time.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
            Enter Arena <ArrowRight size={20} />
          </div>
        </div>
      </Link>

    </div>
  );
}