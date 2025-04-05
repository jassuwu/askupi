"use client";

import * as React from "react";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [hasMounted, setHasMounted] = React.useState(false);

  // Handle system theme initially, then switch to either light or dark
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const cycleTheme = () => {
    // If we're still using system theme, switch to the actual resolved theme first
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "dark" : "light");
      return;
    }

    // After that, just toggle between light and dark
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!hasMounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-6 w-6"
    >
      <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
