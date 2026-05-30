import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  className?: string;
}

const ThemeToggle = ({ className = "" }: Props) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-surface text-foreground hover:bg-surface-elevated transition-colors ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;
