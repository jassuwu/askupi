"use client";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Footer() {
  return (
    <footer className="mt-auto w-full py-4 sm:py-6">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center gap-3 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            className="text-muted-foreground hover:text-primary underline transition-all duration-300"
            href="https://github.com/jassuwu/askupi"
            target="_blank">
            vibecoded
          </Link>
          by
          <Link
            className="text-muted-foreground hover:text-primary underline transition-all duration-300"
            href="https://jassuwu.com"
            target="_blank">
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
