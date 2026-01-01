import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // e.g. "text-violet-600"
}

export function StatCard({ label, value, icon: Icon, color = "text-primary" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h4 className="text-2xl font-bold mt-1">{value}</h4>
        </div>
        <div className={`p-3 rounded-full bg-slate-50 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}