import { useState } from "react";
import { Menu, Bell, Copy, Bitcoin, Wallet, ArrowLeftRight, RefreshCw, BarChart3, Bot } from "lucide-react";
import logo from "@/assets/logo.png";

const currencies = ["NGN", "GHS", "USD"] as const;

const services = [
  { icon: Bitcoin, label: "Crypto", color: "bg-purple-500" },
  { icon: Wallet, label: "Fund Accounts", color: "bg-purple-500" },
  { icon: ArrowLeftRight, label: "Send & Receive", color: "bg-purple-500" },
  { icon: RefreshCw, label: "Convert", color: "bg-purple-500" },
  { icon: BarChart3, label: "Track Trades", color: "bg-purple-500" },
  { icon: Bot, label: "AI Advisor", color: "bg-purple-500" },
];

const Dashboard = () => {
  const [activeCurrency, setActiveCurrency] = useState<typeof currencies[number]>("NGN");

  const balances: Record<typeof currencies[number], string> = {
    NGN: "605,752.37",
    GHS: "12,340.00",
    USD: "1,250.00",
  };

  const handleCopyTag = () => {
    navigator.clipboard.writeText("lb");
  };

  return (
    <div className="min-h-screen bg-[hsl(220,30%,8%)] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Menu className="w-6 h-6 text-white/80" />
        <div className="relative">
          <Bell className="w-6 h-6 text-white/80" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-400">
          <img src={logo} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Wallet Section */}
      <div className="px-5 pt-2 pb-6">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Wallet Balance</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {balances[activeCurrency]}
        </h1>

        {/* Currency Tabs */}
        <div className="flex gap-0 bg-[hsl(220,30%,14%)] rounded-lg w-fit overflow-hidden">
          {currencies.map((cur) => (
            <button
              key={cur}
              onClick={() => setActiveCurrency(cur)}
              className={`px-5 py-2 text-sm font-semibold transition-all ${
                activeCurrency === cur
                  ? "bg-[hsl(220,30%,20%)] text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              {cur}
            </button>
          ))}
        </div>

        {/* AstroTag */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">AstroTag: lb</span>
            <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold">A</span>
          </div>
          <button
            onClick={handleCopyTag}
            className="text-sm text-white/60 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-5 bg-[hsl(220,20%,95%)] rounded-3xl p-6">
        <div className="grid grid-cols-3 gap-y-6 gap-x-4">
          {services.map(({ icon: Icon, label }) => (
            <button key={label} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Icon className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-[hsl(220,30%,12%)] text-center leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="flex-1" />
    </div>
  );
};

export default Dashboard;
