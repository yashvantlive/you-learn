import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  buttonText: string;
  gradient: string; // e.g. "from-violet-600 to-fuchsia-600"
  bgGradient: string; // e.g. "from-violet-50 to-fuchsia-50"
  textColor: string; // e.g. "text-violet-600"
}

export function GameModeCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  buttonText, 
  gradient, 
  bgGradient, 
  textColor 
}: GameModeCardProps) {
  return (
    <Link href={href} className="block group">
      <div className={`bg-gradient-to-br ${bgGradient} hover:shadow-md hover:scale-[1.01] border border-white/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer`}>
        
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm ${textColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-600 text-sm mb-4">{description}</p>
        
        <div className={`w-full h-12 bg-gradient-to-r ${gradient} text-white rounded-xl flex items-center justify-center font-bold gap-2 shadow-lg opacity-90 group-hover:opacity-100 transition-all`}>
          {buttonText} <ArrowRight size={18} />
        </div>
      </div>
    </Link>
  );
}