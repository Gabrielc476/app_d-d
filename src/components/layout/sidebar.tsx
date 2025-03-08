"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DiceD20,
  Users,
  User,
  BookOpen,
  Sword,
  Scroll,
  Shield,
  Home,
} from "lucide-react";

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="mr-2 h-5 w-5" />,
    },
    {
      title: "Personagens",
      href: "/characters",
      icon: <User className="mr-2 h-5 w-5" />,
    },
    {
      title: "Campanhas",
      href: "/campaigns",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      title: "Magias",
      href: "/spells",
      icon: <BookOpen className="mr-2 h-5 w-5" />,
    },
    {
      title: "Itens",
      href: "/items",
      icon: <Sword className="mr-2 h-5 w-5" />,
    },
    {
      title: "Combate",
      href: "/combat",
      icon: <Shield className="mr-2 h-5 w-5" />,
    },
    {
      title: "Dados",
      href: "/dice",
      icon: <DiceD20 className="mr-2 h-5 w-5" />,
    },
    {
      title: "Anotações",
      href: "/notes",
      icon: <Scroll className="mr-2 h-5 w-5" />,
    },
  ];

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <nav className="flex h-full flex-col">
      {mobile && (
        <div className="flex items-center gap-2 p-4 border-b">
          <DiceD20 className="h-6 w-6 text-dnd-red" />
          <span className="font-bold text-xl">D&D App</span>
        </div>
      )}
      <div className="flex flex-col space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleClick}
            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
