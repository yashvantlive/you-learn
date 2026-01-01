"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 p-4 pb-24">
      <Card className="border-t-4 border-t-violet-600">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-24 h-24 bg-violet-100 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-violet-600">
            {user?.displayName?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.displayName}</h1>
            <p className="text-slate-500">Class {user?.class || 10} • CBSE</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-900 ml-1">Settings</h3>
        <Card>
          <CardContent className="p-0 divide-y">
            <div className="p-4 flex items-center justify-between">
              <span className="flex items-center gap-3">
                <Icons.user className="w-5 h-5 text-slate-400" /> Edit Profile
              </span>
              <Icons.arrowRight className="w-4 h-4 text-slate-300" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="flex items-center gap-3">
                <Icons.trophy className="w-5 h-5 text-slate-400" /> Statistics
              </span>
              <Icons.arrowRight className="w-4 h-4 text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button variant="destructive" className="w-full" onClick={logout}>
        <Icons.logout className="w-4 h-4 mr-2" /> Log Out
      </Button>
    </div>
  );
}