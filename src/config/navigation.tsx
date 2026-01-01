import { Icons } from "@/components/icons";

export const navItems = [
  { 
    label: "Home", 
    href: "/dashboard", 
    icon: Icons.home // We will add Home icon in next step
  },
  { 
    label: "Solo", 
    href: "/solo", 
    icon: Icons.user 
  },
  { 
    label: "Multiplayer", 
    href: "/room/join", 
    icon: Icons.game 
  },
  { 
    label: "Profile", 
    href: "/profile", 
    icon: Icons.userCircle // We will add UserCircle icon in next step
  }
];