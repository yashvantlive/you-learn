export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  level: number;
  xp: number;
  coins: number;
  rank: string; // 'Bronze' | 'Silver' | 'Gold' etc.
  class: number; // 6-12
  board: 'CBSE' | 'ICSE' | 'STATE';
  createdAt: number;
  lastLoginAt: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[]; // Array of 4 strings
  correct: number;   // 0-3 index
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  chapter: string;
}

export interface Room {
  roomId: string;
  roomCode: string;
  hostId: string;
  subject: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Record<string, RoomPlayer>;
  currentQuestionIndex: number;
  maxPlayers: number;
  createdAt: number;
}

export interface RoomPlayer {
  uid: string;
  displayName: string;
  photoURL: string;
  score: number;
  ready: boolean;
  isHost: boolean;
}
// ... (User, Question, Room interfaces वैसे ही रखें)

export interface UserStats {
  totalGames: number;
  totalWins: number;
  totalXP: number;
  totalCoins: number;
  winRate: number;
  avgAccuracy: number;
  currentStreak: number;
  bestStreak: number;
  rank: string;
}

// यह हेल्पर फंक्शन XP से लेवल निकालने के लिए (Legacy Logic से लिया गया)
export const getLevelInfo = (xp: number) => {
  const baseXP = 1000;
  const factor = 1.2;
  // Simple geometric sequence logic approximation or just linear for v1
  // For now, let's use a simple formula: Level = floor(XP / 1000) + 1
  const level = Math.floor(xp / 1000) + 1;
  const currentLevelXP = (level - 1) * 1000;
  const nextLevelXP = level * 1000;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  return { level, progress, nextLevelXP };
};