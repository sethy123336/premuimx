import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Settings, Wallet, Monitor, Bot, BookOpen, LogOut, HelpCircle, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  username?: string;
  email?: string;
}

const items = [
  { icon: User, label: "Profile", path: "/dashboard" },
  { icon: Wallet, label: "Wallets", path: "/wallet" },
  { icon: Monitor, label: "Fund Deriv", path: "/fund-deriv" },
  { icon: BookOpen, label: "Journal", path: "/journal" },
  { icon: Bot, label: "PremiumX AI", path: "/ai" },
  { icon: Settings, label: "Settings", path: "/dashboard" },
  { icon: HelpCircle, label: "Support", path: "/dashboard" },
];

const DrawerMenu = ({ username, email }: Props) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button aria-label="Menu" className="text-white/70 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-[hsl(220,40%,8%)] border-white/10 text-white w-[280px] p-0">
        <SheetHeader className="px-5 pt-6 pb-4 border-b border-white/10">
          <SheetTitle className="text-white text-left">
            <span className="capitalize">{username || "Trader"}</span>
          </SheetTitle>
          <p className="text-xs text-white/50 text-left truncate">{email}</p>
        </SheetHeader>

        <nav className="px-3 py-4 space-y-1">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.label}
                onClick={() => navigate(it.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4 text-white/60" />
                {it.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pt-2 border-t border-white/10 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DrawerMenu;
