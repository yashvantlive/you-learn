"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, ArrowRight, Keyboard, Users } from "lucide-react";

export default function JoinRoomPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    setIsJoining(true);
    router.push(`/room/${roomId.toUpperCase()}`); 
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-8 space-y-8 animate-in zoom-in-95 duration-500">
        
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200 transform -rotate-3">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Join Battle</h1>
          <p className="text-slate-500 font-medium">Enter the 6-character room code.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            {/* 1. Room Code Input Fix */}
            <label 
              htmlFor="room-code" 
              className="text-sm font-bold text-slate-700 flex items-center gap-2"
            >
              <Keyboard size={16} /> Room Code
            </label>
            <input 
              id="room-code"
              name="roomCode"
              type="text" 
              placeholder="e.g. A1B2C3"
              className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white font-mono text-lg font-bold text-center tracking-widest focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>

          <button 
            type="submit"
            disabled={!roomId.trim() || isJoining}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? (
              <span className="animate-pulse">Locating Room...</span>
            ) : (
              <>Join Now <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Or</p>
          <button 
            onClick={() => router.push('/room/create')}
            className="text-violet-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            <Users size={16} /> Create a New Room
          </button>
        </div>

      </div>
    </div>
  );
}