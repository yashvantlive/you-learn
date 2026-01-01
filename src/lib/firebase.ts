import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRHEFRRjGIhTGyaBXK_rwLQAu-UnuN4pU",
  authDomain: "class-10th-you-learn.firebaseapp.com",
  databaseURL: "https://class-10th-you-learn-default-rtdb.firebaseio.com",
  projectId: "class-10th-you-learn",
  storageBucket: "class-10th-you-learn.firebasestorage.app",
  messagingSenderId: "662845038910",
  appId: "1:662845038910:web:54c6b5840c685dbbf7cc6f"
};

// Singleton Pattern: अगर App पहले से है तो उसे ही यूज करें, नया न बनाएं
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getDatabase(app);     // Realtime DB (Rooms के लिए)
export const firestore = getFirestore(app); // Firestore (Questions के लिए)