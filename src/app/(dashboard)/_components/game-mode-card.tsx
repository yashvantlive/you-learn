import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Icons } from "@/components/icons";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  buttonText: string;
  gradient: string; // css class for gradient
}

export function GameModeCard({ title, description, icon: Icon, href, buttonText, gradient }: GameModeCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-md group relative">
      <div className={`absolute inset-0 opacity-10 ${gradient}`} />
      <CardContent className="p-6 relative z-10 flex flex-col h-full">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${gradient} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <CardDescription className="mb-6 flex-1">{description}</CardDescription>
        <Link href={href} className="w-full">
          <Button className="w-full gap-2 group-hover:translate-x-1 transition-transform">
            {buttonText} <Icons.arrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}