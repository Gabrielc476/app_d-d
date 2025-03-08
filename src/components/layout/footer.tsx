"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} D&D App. Todos os direitos
          reservados.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Termos
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Privacidade
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Sobre
          </Link>
        </div>
      </div>
    </footer>
  );
}
