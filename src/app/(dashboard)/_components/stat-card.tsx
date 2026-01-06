import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  suffix?: string;
  subtitle?: string;
  gradient?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  suffix = "", 
  subtitle, 
  gradient = "from-violet-500 to-purple-500" 
}: StatCardProps) {
  return (
    <div className="glass-panel p-5 rounded-2xl hover:translate-y-[-2px] transition-transform duration-300">
      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-md mb-3`}>
        {icon}
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
        {label}
      </p>
      <h4 className="text-2xl font-black text-slate-900">
        {value}
        <span className="text-lg text-slate-400 font-medium ml-0.5">{suffix}</span>
      </h4>
      {subtitle && (
        <p className="text-slate-400 text-[10px] font-semibold mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}