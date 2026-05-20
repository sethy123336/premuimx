import { useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, Landmark, Brain } from "lucide-react";

const tabs = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Wallet, label: "Wallets", path: "/wallet" },
  { icon: Landmark, label: "Fund", path: "/fund-deriv" },
  { icon: Brain, label: "AI", path: "/ai" },
];


const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      className="sticky bottom-0 z-40 bg-[hsl(220,30%,10%)] border-t border-white/10 px-2 pt-2"
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path || (tab.path === "/wallet" && pathname.startsWith("/wallet"));
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                isActive ? "text-amber-400" : "text-white/40"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
