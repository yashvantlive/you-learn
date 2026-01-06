"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  ref, onValue, set, update, get,
  serverTimestamp, onDisconnect, DataSnapshot
} from "firebase/database";
import { rtdb } from "@/lib/firebase";

// --- Types ---
export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  avatar?: string;
  joinedAt: number;
  isHost: boolean;
  lastAnswerTime?: number;
}

export interface GameConfig {
  subject: string;
  totalQuestions: number;
  questionIds: string[];
  timePerQuestion: number;
}

export interface GameState {
  status: "lobby" | "playing" | "finished";
  currentQuestionIndex: number;
  startTime: number | null;
  answersRevealed: boolean;
}

export interface RoomData {
  config: GameConfig;
  gameState: GameState;
  players: Record<string, Player>;
}

interface UseMultiplayerOptions {
  roomId: string | null;
  playerId: string;
  playerName: string;
  isHost?: boolean;
}

export function useMultiplayer({
  roomId,
  playerId,
  playerName,
  isHost = false,
}: UseMultiplayerOptions) {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const roomRef = roomId ? ref(rtdb, `rooms/${roomId}`) : null;

  // 1. Connection Status Listener
  useEffect(() => {
    const connectedRef = ref(rtdb, ".info/connected");
    const unsub = onValue(connectedRef, (snap) => setIsConnected(snap.val() === true));
    return () => unsub();
  }, []);

  // 2. Room Data Listener
  useEffect(() => {
    if (!roomRef) return;
    const unsub = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoom(snapshot.val());
      } else {
        setRoom(null);
        setError("Room not found or deleted");
      }
    }, (err) => {
      console.error(err);
      setError("Permission denied or connection lost");
    });
    return () => unsub();
  }, [roomRef]);

  // --- ACTIONS ---

  // Join Room
  const joinRoom = useCallback(async (targetId: string) => {
    if (!playerId) return;
    const playerRef = ref(rtdb, `rooms/${targetId}/players/${playerId}`);
    
    // Set player data
    const playerData: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      streak: 0,
      joinedAt: Date.now(),
      isHost: isHost
    };

    await set(playerRef, playerData);
    
    // Auto-remove on disconnect
    await onDisconnect(playerRef).remove();
  }, [playerId, playerName, isHost]);

  // Start Game (Host Only)
  const startGame = useCallback(async () => {
    if (!roomId || !isHost) return;
    await update(ref(rtdb, `rooms/${roomId}/gameState`), {
      status: "playing",
      startTime: serverTimestamp(),
      currentQuestionIndex: 0,
      answersRevealed: false
    });
  }, [roomId, isHost]);

  // Submit Answer
  const submitAnswer = useCallback(async (points: number) => {
    if (!roomId || !room) return;
    const pRef = ref(rtdb, `rooms/${roomId}/players/${playerId}`);
    const current = room.players[playerId];
    
    await update(pRef, {
      score: (current?.score || 0) + points,
      streak: points > 0 ? (current?.streak || 0) + 1 : 0,
      lastAnswerTime: serverTimestamp()
    });
  }, [roomId, room, playerId]);

  // Next Question (Host Only)
  const nextQuestion = useCallback(async () => {
    if (!roomId || !isHost || !room) return;
    
    const nextIdx = room.gameState.currentQuestionIndex + 1;
    const isOver = nextIdx >= room.config.totalQuestions;
    
    await update(ref(rtdb, `rooms/${roomId}/gameState`), {
      status: isOver ? "finished" : "playing",
      currentQuestionIndex: isOver ? room.gameState.currentQuestionIndex : nextIdx,
      startTime: serverTimestamp(),
      answersRevealed: false
    });
  }, [roomId, isHost, room]);

  return {
    room,
    isConnected,
    error,
    joinRoom,
    startGame,
    submitAnswer,
    nextQuestion,
    players: room ? Object.values(room.players).sort((a, b) => b.score - a.score) : []
  };
}