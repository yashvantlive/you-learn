"use client";

import { Copy, Users, Play, Crown } from "lucide-react";
import { RoomData, Player } from "@/hooks/useMultiplayer";

interface LobbyProps {
  roomId: string;
  room: RoomData;
  players: Player[];
  startGame: () => void;
  isHost: boolean;
  currentUserId: string;
}

export default function LobbyView({ roomId, room, players, startGame, isHost, currentUserId }: LobbyProps) {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room Code Copied!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="glass-panel max-w-2xl w-full p-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Lobby Live
          </div>
          <h1 className="text-4xl font-black text-slate-900">{room.config?.subject || "Battle"} Arena</h1>
          <p className="text-slate-500 font-medium">Waiting for warriors...</p>
        </div>

        {/* Room Code */}
        <div className="bg-slate-900 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl text-white">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Room Code</p>
            <p className="text-3xl font-mono font-black tracking-widest">{roomId}</p>
          </div>
          <button onClick={handleCopy} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-all flex items-center gap-2">
            <Copy size={18} /> Copy Code
          </button>
        </div>

        {/* Player Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
            <Users size={20} className="text-violet-600" /> 
            Players Ready ({players.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
            {players.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${p.id === currentUserId ? "border-violet-500 bg-violet-50" : "border-transparent bg-white"}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                  {p.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{p.name} {p.id === currentUserId && "(You)"}</p>
                  {p.isHost && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Crown size={10}/> HOST</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button 
          onClick={startGame}
          disabled={!isHost} 
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold text-xl shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isHost ? <><Play fill="currentColor" /> Start Battle Royale</> : "Waiting for Host to Start..."}
        </button>

      </div>
    </div>
  );
}