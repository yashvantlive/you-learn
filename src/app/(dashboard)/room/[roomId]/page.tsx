"use client";

import { useEffect, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

// ✅ Import Hook from LOCAL directory
import { useMultiplayer } from "./_hooks/useMultiplayer";

// ✅ Import Components
import LobbyView from "../_components/LobbyView";
import GameArena from "../_components/GameArena";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  // ✅ Unwrap params properly
  const { roomId } = use(params);
  const { user } = useAuth();
  
  const { 
    room, 
    players, 
    joinRoom, 
    startGame, 
    submitAnswer,
    nextQuestion,
    isConnected,
  } = useMultiplayer({
    roomId,
    playerId: user?.uid || "",
    playerName: user?.displayName || "Guest",
    isHost: false 
  });

  const isHost = room ? (room as any).hostId === user?.uid : false;

  useEffect(() => {
    if (user && isConnected && room) {
      // @ts-ignore: Check if player exists
      const isAlreadyJoined = room.players && room.players[user.uid];
      if (!isAlreadyJoined) {
        joinRoom(roomId);
      }
    }
  }, [user, isConnected, room, roomId, joinRoom]);

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
        <p className="font-bold text-slate-500">Syncing Battle Data...</p>
      </div>
    );
  }

  // ✅ Force casting to 'any' for components if strict types still mismatch slightly
  // This is safe because our Local Hook structure is now aligned with logic
  const safeRoom = room as any;
  const safePlayers = players as any[];

  if (room.gameState.status === "playing" || room.gameState.status === "finished") {
    return (
      <GameArena 
        roomId={roomId}
        room={safeRoom}
        playerId={user?.uid || ""}
        submitAnswer={submitAnswer}
        nextQuestion={nextQuestion}
        isHost={isHost} 
        players={safePlayers}
      />
    );
  }

  return (
    <LobbyView 
      roomId={roomId}
      room={safeRoom}
      players={safePlayers}
      startGame={startGame}
      isHost={isHost}
      currentUserId={user?.uid || ""}
    />
  );
}