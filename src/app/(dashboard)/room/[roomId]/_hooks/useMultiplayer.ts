"use client";

import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, set, update, get, remove } from "firebase/database";
import { useRouter } from "next/navigation";

// --- Types Definition (Aligned with Global Types) ---

export type QuizMode = "instant" | "exam";

export interface GameConfig {
  board: string;
  class: string;
  subjects: string[];
  subject: string; // ✅ Added to match global type (Derived from subjects)
  chapters: string | string[];
  difficulty: string;
  questionIds: string[];
  totalQuestions: number;
  timePerQuestion?: number;
  totalTime?: number;
  quizMode: QuizMode;
  maxPlayers?: number;
}

export interface GameState {
  status: "lobby" | "playing" | "finished";
  startTime: number;
  endTime?: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  status: "ready" | "playing" | "submitted";
  streak?: number;
  joinedAt: number; // ✅ Added to match global type
}

export interface RoomData {
  config: GameConfig;
  gameState: GameState;
  players: Record<string, Player>;
  hostId: string;
}

interface UseMultiplayerProps {
  roomId: string;
  playerId: string;
  playerName: string;
  isHost: boolean;
}

export function useMultiplayer({ roomId, playerId, playerName }: UseMultiplayerProps) {
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Sync Room Data
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(rtdb, `rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // ✅ Polyfill: Ensure 'subject' exists (derived from subjects array)
        if (data.config && !data.config.subject) {
          data.config.subject = data.config.subjects ? data.config.subjects.join(", ") : "General";
        }

        setRoom(data as RoomData);
        setIsConnected(true);
      } else {
        setRoom(null);
        setError("Room not found or deleted");
        setIsConnected(false);
      }
    }, (err) => {
      console.error(err);
      setError(err.message);
    });

    return () => unsubscribe();
  }, [roomId]);

  // 2. Join Room Logic
  const joinRoom = async (targetRoomId: string) => {
    if (!playerId || !playerName || !room) return;

    const playerRef = ref(rtdb, `rooms/${targetRoomId}/players/${playerId}`);
    const snapshot = await get(playerRef);

    if (!snapshot.exists()) {
      const isRealHost = room.hostId === playerId;

      await set(playerRef, {
        id: playerId,
        name: playerName,
        score: 0,
        isHost: isRealHost,
        status: "ready",
        streak: 0,
        joinedAt: Date.now() // ✅ Added joinedAt timestamp
      });
    }
  };

  // 3. Start Game
  const startGame = async () => {
    if (!room) return;
    if (room.hostId !== playerId) {
        console.error("Only the host can start the game!");
        return;
    }

    await update(ref(rtdb, `rooms/${roomId}/gameState`), {
      status: "playing",
      startTime: Date.now(),
    });
  };

  // 4. Submit Answer
  const submitAnswer = async (points: number) => {
    if (!room || !playerId) return;

    const playerRef = ref(rtdb, `rooms/${roomId}/players/${playerId}`);
    
    await update(playerRef, {
      score: points, 
      status: room.config.quizMode === 'exam' ? 'submitted' : 'playing'
    });
  };

  // 5. Update Streak
  const updateStreak = async (streak: number) => {
    if (!room || !playerId) return;
    await update(ref(rtdb, `rooms/${roomId}/players/${playerId}`), {
      streak: streak
    });
  };

  // 6. Next Question / End Game
  const nextQuestion = async () => {
    if (!room || room.hostId !== playerId) return;
    
    await update(ref(rtdb, `rooms/${roomId}/gameState`), {
      status: "finished",
      endTime: Date.now()
    });
  };

  // 7. Leave Room
  const leaveRoom = async () => {
    if (!roomId || !playerId) return;
    await remove(ref(rtdb, `rooms/${roomId}/players/${playerId}`));
    router.push('/dashboard');
  };

  const playersList = room ? Object.values(room.players || {}) : [];

  return {
    room,
    players: playersList,
    isConnected,
    error,
    joinRoom,
    startGame,
    submitAnswer,
    updateStreak,
    nextQuestion,
    leaveRoom
  };
}