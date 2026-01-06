import { db, rtdb } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, get, update } from "firebase/database";

// ✅ 1. Detailed Question Interface (Preserved)
export interface QuestionAnalysis {
  questionId: string;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  options: string[];
}

// ✅ 2. Payload Interface (Preserved)
export interface GameHistoryPayload {
  userId: string;
  userName: string;
  gameId: string;
  mode: "solo" | "multiplayer";
  type: "instant" | "exam";
  
  // Stats
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  timeSpent: number;
  accuracy?: number;
  
  // Metadata
  subject: string;
  board: string;
  class: string;
  difficulty: string;
  
  // Analysis Data
  questionsData?: QuestionAnalysis[];
}

/**
 * Saves game history to Firestore and updates user stats in Realtime DB.
 * @returns Promise<string | null> - Returns the Firestore Document ID on success, or null on failure.
 */
export const saveGameHistory = async (data: GameHistoryPayload): Promise<string | null> => {
  try {
    const historyRef = collection(db, "gameHistory");
    
    // Calculate Accuracy safely
    const calculatedAccuracy = data.totalQuestions > 0 
      ? Math.round((data.correctAnswers / data.totalQuestions) * 100) 
      : 0;

    // ✅ 1. Save to Firestore & Capture Document Reference
    const docRef = await addDoc(historyRef, {
      ...data,
      accuracy: calculatedAccuracy,
      timestamp: serverTimestamp(),
      playedAt: new Date().toISOString()
    });

    console.log("✅ Game History Saved! ID:", docRef.id);

    // ✅ 2. Update User Profile Stats (RTDB) - Existing Logic Preserved
    const userProfileRef = ref(rtdb, `users/${data.userId}/profile`);
    const snapshot = await get(userProfileRef);

    if (snapshot.exists()) {
      const currentData = snapshot.val();
      const newTotalXP = (currentData.totalXP || 0) + data.score;
      const newTotalGames = (currentData.totalGames || 0) + 1;
      
      // Level Calculation (Example: 1000 XP per level)
      const newLevel = Math.floor(newTotalXP / 1000) + 1;

      // Rank Title Logic
      let newRankTitle = "Rookie";
      if (newLevel >= 5) newRankTitle = "Scholar";
      if (newLevel >= 10) newRankTitle = "Elite";
      if (newLevel >= 20) newRankTitle = "Master";
      if (newLevel >= 50) newRankTitle = "Grandmaster";

      // Atomic Update
      await update(userProfileRef, {
        totalXP: newTotalXP,
        totalGames: newTotalGames,
        level: newLevel,
        rankTitle: newRankTitle
      });
      
      console.log("✅ User Stats Updated via RTDB");
    } else {
      console.warn("⚠️ User profile not found in RTDB, skipping stats update.");
    }
    
    // ✅ 3. Return the Document ID so UI can link to Analysis Page
    return docRef.id;

  } catch (error) {
    console.error("❌ Error saving game history:", error);
    return null;
  }
};