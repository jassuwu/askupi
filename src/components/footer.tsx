"use client";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            className="text-muted-foreground underline hover:text-primary transition-all duration-300"
            href="https://github.com/jassuwu/askupi"
            target="_blank"
          >
            vibecoded
          </Link>
          by
          <Link
            className="text-muted-foreground underline hover:text-primary transition-all duration-300"
            href="https://jassuwu.com"
            target="_blank"
          >
            jass
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <p className="text-muted-foreground text-xs">askupi</p>
          <p className="text-muted-foreground text-md">•</p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
