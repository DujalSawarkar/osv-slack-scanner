"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Shield, Github } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-3 transition-all hover:opacity-80"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none tracking-tight">
              OSV Scanner
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              Powered by Google OSV
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button size="default" className="gap-2 shadow-sm">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
