import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 w-full flex justify-between items-center py-4 px-10">
      <h1 className="text-2xl font-bold">AskUPI</h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
