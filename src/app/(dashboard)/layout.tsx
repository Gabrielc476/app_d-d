"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  DiceD20,
  Users,
  User,
  BookOpen,
  Sword,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-dnd-red border-t-transparent" />
      </div>
    );
  }

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <DiceD20 className="mr-2 h-5 w-5" />,
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
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col space-y-4 py-4">
                  <div className="flex items-center gap-2 px-2">
                    <DiceD20 className="h-6 w-6 text-dnd-red" />
                    <span className="font-bold text-xl">D&D App</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center gap-2">
              <DiceD20 className="h-6 w-6 text-dnd-red" />
              <span className="font-bold text-xl hidden md:inline-block">
                D&D App
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isMounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleTheme}
                className="rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline-block">Sair</span>
            </Button>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-dnd-red flex items-center justify-center text-white">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-medium hidden md:inline-block">
                {session?.user?.name || "Usuário"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar e conteúdo principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden border-r md:block md:w-64 bg-background overflow-y-auto">
          <div className="flex h-full flex-col">
            <div className="flex flex-col space-y-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="container p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
