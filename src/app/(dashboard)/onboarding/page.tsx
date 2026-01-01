"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore"; // Or Realtime DB
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("10");

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Save to Realtime DB
      await update(ref(db, `users/${user.uid}/profile`), {
        class: parseInt(selectedClass),
        isOnboarded: true, // Mark as complete
        board: "CBSE" // Default for now
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>One last step! 🚀</CardTitle>
          <CardDescription>Tell us about your class to personalize your quizzes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {["9", "10", "11", "12"].map((cls) => (
              <Button
                key={cls}
                variant={selectedClass === cls ? "default" : "outline"}
                onClick={() => setSelectedClass(cls)}
                className="h-12 text-lg"
              >
                Class {cls}
              </Button>
            ))}
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
            {loading ? "Saving..." : "Start Learning"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}