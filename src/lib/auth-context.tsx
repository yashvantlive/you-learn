"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await handleUserProfile(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUserProfile = async (authUser: FirebaseUser) => {
    try {
      const userRef = ref(db, `users/${authUser.uid}/profile`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        setUser(snapshot.val() as UserProfile);
      } else {
        const newUser: UserProfile = {
          uid: authUser.uid,
          displayName: authUser.displayName || "Student",
          email: authUser.email || "",
          photoURL: authUser.photoURL || "",
          level: 1,
          xp: 0,
          coins: 0,
          rank: "Bronze",
          class: 10,
          board: "CBSE",
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
        };
        await set(userRef, newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true); // Fix: UI responsiveness
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);