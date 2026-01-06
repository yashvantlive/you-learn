"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, googleProvider } from "./firebase"; 
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Firebase Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!mounted) return;
      
      setUser(currentUser);
      setIsLoading(false);
    });

    // 2. SAFETY VALVE (Silent Fix)
    // Increased to 15 seconds and removed console.warn to prevent annoying logs.
    const safetyTimer = setTimeout(() => {
      if (mounted && isLoading) {
        // Silently allow the app to load if Firebase is stuck
        setIsLoading(false); 
      }
    }, 15000); 

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);