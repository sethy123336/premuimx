import { useState } from "react";
import { Menu, Bell, DollarSign, Grid2X2, Wallet, BookOpen, Bot, Monitor } from "lucide-react";
import logo from "@/assets/logo.png";

const walletCards = [
  { currency: "NGN", balance: "2,450,000.00", change: "+12.5%", changeColor: "text-green-400" },
  { currency: "USD", balance: "5,280.50", change: "+8.2%", changeColor: "text-green-400" },
  { currency: "USDT", balance: "3,150.00", change: "-2.1%", changeColor: "text-red-400" },
];

const bottomTabs = [
  { icon: Grid2X2, label: "Dashboard", active: true },
  { icon: Wallet, label: "Wallet", active: false },
  { icon: Monitor, label: "Fund Deriv", active: false },
  { icon: BookOpen, label: "Journal", active: false },
  { icon: Bot, label: "AI", active: false },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <Menu className="w-6 h-6 text-white/70" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-white/70" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-400">
            <img src={logo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Welcome */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-2xl font-bold">
          Hello, <span className="text-amber-400">Dan</span>
        </h1>
        <p className="text-sm text-white/50 mt-1">Here's your trading overview</p>
      </div>

      {/* Wallet Balances */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-white/80" />
          <span className="text-base font-semibold">Wallet Balances</span>
        </div>

        <div className="space-y-3">
          {walletCards.map((card) => (
            <div
              key={card.currency}
              className="bg-[hsl(220,30%,12%)] rounded-2xl px-5 py-4 flex items-center justify-between border border-white/5"
            >
              <div>
                <p className="text-xs text-white/50 mb-1">{card.currency}</p>
                <p className="text-2xl font-bold tracking-tight">{card.balance}</p>
                <p className={`text-xs mt-1 ${card.changeColor}`}>{card.change}</p>
              </div>
              <DollarSign className="w-10 h-10 text-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-base font-semibold">Quick Actions</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Navigation */}
      <div className="bg-[hsl(220,30%,10%)] border-t border-white/10 px-2 pb-2 pt-2">
        <div className="flex justify-around">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
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
    </div>
  );
};

export default Dashboard;
