import { useEffect, useMemo, useState } from "react";
import { Menu, History, Search, Lock, ArrowDownToLine } from "lucide-react";
import paypalLogo from "@/assets/paypal-logo.png";
import BottomNav from "@/components/dashboard/BottomNav";
import DrawerMenu from "@/components/dashboard/DrawerMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { fetchUsdRates, type UsdRates } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

type TabKey = "deposit" | "withdraw" | "history";

interface Platform {
  id: string;
  name: string;
  emoji?: string;
  logo?: string;
  bg: string;
}
  name: string;
  emoji: string;
  bg: string;
}

const PLATFORMS: Platform[] = [
  { id: "deriv", name: "Deriv", emoji: "📊", bg: "bg-rose-500/15" },
  { id: "paypal", name: "PayPal", emoji: "🅿️", bg: "bg-sky-500/15" },
  { id: "skrill", name: "Skrill", emoji: "💳", bg: "bg-purple-500/15" },
  { id: "binance", name: "Binance", emoji: "🟡", bg: "bg-amber-500/15" },
  { id: "bybit", name: "Bybit", emoji: "🔵", bg: "bg-blue-500/15" },
  { id: "neteller", name: "Neteller", emoji: "💰", bg: "bg-orange-500/15" },
];

interface HistoryItem {
  id: string;
  platform: string;
  type: "Deposit" | "Withdraw";
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  { id: "1", platform: "Deriv", type: "Deposit", amount: 250, status: "Completed", date: "May 18, 2026" },
  { id: "2", platform: "Binance", type: "Withdraw", amount: 120, status: "Pending", date: "May 16, 2026" },
  { id: "3", platform: "PayPal", type: "Deposit", amount: 80, status: "Completed", date: "May 12, 2026" },
];

const FundDeriv = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>("deposit");
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [rates, setRates] = useState<UsdRates | null>(null);

  // Deposit form
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");

  // Withdraw form
  const [wPlatform, setWPlatform] = useState("deriv");
  const [wAccount, setWAccount] = useState("");
  const [wAmount, setWAmount] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => { fetchUsdRates().then(setRates); }, []);

  const filtered = useMemo(
    () => PLATFORMS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const usdAmt = Number(amount) || 0;
  const ngnRate = rates?.NGN ?? 1605.4;
  const youPayNgn = usdAmt * ngnRate;

  const fmtNgn = (n: number) => "₦" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

  const handleConfirm = () => {
    if (!selectedPlatform) return toast({ title: "Select a platform", variant: "destructive" });
    if (!account.trim()) return toast({ title: "Enter account ID", variant: "destructive" });
    if (usdAmt < 1) return toast({ title: "Enter valid amount", variant: "destructive" });
    toast({ title: "Funding request submitted", description: `${PLATFORMS.find((p) => p.id === selectedPlatform)?.name} • $${usdAmt}` });
    setAccount(""); setAmount("");
  };

  const handleWithdraw = () => {
    if (!wAccount.trim()) return toast({ title: "Enter destination account", variant: "destructive" });
    if (Number(wAmount) < 1) return toast({ title: "Enter valid amount", variant: "destructive" });
    if (pin.length < 4) return toast({ title: "Enter 4-digit PIN", variant: "destructive" });
    toast({ title: "Withdrawal submitted", description: `${PLATFORMS.find((p) => p.id === wPlatform)?.name} • $${wAmount}` });
    setWAccount(""); setWAmount(""); setPin("");
  };

  return (
    <div className="h-[100dvh] bg-[hsl(220,40%,7%)] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pb-3 bg-[hsl(220,40%,7%)]"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <DrawerMenu username={user?.email?.split("@")[0]} email={user?.email ?? undefined} />
        <h1 className="text-base font-bold">Brokerage Funding</h1>
        <button
          onClick={() => setTab("history")}
          className="w-9 h-9 rounded-xl bg-[hsl(220,30%,12%)] border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
          aria-label="History"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-5">
        <div className="grid grid-cols-3 bg-[hsl(220,30%,10%)] rounded-xl p-1 border border-white/5">
          {(["deposit", "withdraw", "history"] as TabKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === k ? "bg-[hsl(220,30%,16%)] text-white" : "text-white/50"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-none pt-3 pb-4">
        {tab === "deposit" && (
          <>
            {/* Search */}
            <div className="px-5">
              <div className="flex items-center gap-2 bg-[hsl(220,30%,10%)] border border-white/5 rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search platforms..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Platforms */}
            <div className="px-5 pt-4">
              <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-2">Select Platform</p>
              <div className="grid grid-cols-3 gap-2.5">
                {filtered.map((p) => {
                  const active = selectedPlatform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border transition-colors ${
                        active
                          ? "bg-amber-500/10 border-amber-500/40"
                          : "bg-[hsl(220,30%,10%)] border-white/5 hover:bg-[hsl(220,30%,13%)]"
                      }`}
                    >
                      <span className={`w-10 h-10 rounded-lg ${p.bg} flex items-center justify-center text-lg`}>
                        {p.emoji}
                      </span>
                      <span className="text-xs font-semibold text-white/90">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            {selectedPlatform && (
              <div className="px-5 pt-4">
                <div className="rounded-2xl bg-[hsl(220,30%,10%)] border border-white/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-semibold">
                      {PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
                    </span>
                    <span className="text-xs text-white/50">selected</span>
                  </div>

                  <div>
                    <Label className="text-xs text-white/70">Account Email / ID</Label>
                    <Input
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="your@deriv.com"
                      maxLength={100}
                      className="mt-1 bg-[hsl(220,30%,14%)] border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-white/70">Amount (USD)</Label>
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      inputMode="decimal"
                      placeholder="50.00"
                      className="mt-1 bg-[hsl(220,30%,14%)] border-white/10 text-white"
                    />
                  </div>

                  <div className="rounded-xl bg-[hsl(220,30%,14%)] border border-white/5 p-3 text-xs space-y-1.5">
                    <div className="flex justify-between"><span className="text-white/60">You pay</span><span className="text-amber-400 font-semibold tabular-nums">{fmtNgn(youPayNgn)}</span></div>
                    <div className="flex justify-between"><span className="text-white/60">Rate</span><span className="text-white/80 tabular-nums">{fmtNgn(ngnRate)}/USD</span></div>
                    <div className="flex justify-between"><span className="text-white/60">Fee</span><span className="text-emerald-400 font-semibold">Free</span></div>
                  </div>

                  <Button onClick={handleConfirm} className="w-full bg-[hsl(220,30%,14%)] hover:bg-[hsl(220,30%,18%)] border border-white/10">
                    <Lock className="w-4 h-4 mr-2" />
                    Confirm Fund
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "withdraw" && (
          <div className="px-5 space-y-3">
            <div>
              <Label className="text-xs text-white/70">Select Platform</Label>
              <Select value={wPlatform} onValueChange={setWPlatform}>
                <SelectTrigger className="mt-1 bg-[hsl(220,30%,14%)] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,14%)] border-white/10 text-white">
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-white/70">Destination Account</Label>
              <Input
                value={wAccount}
                onChange={(e) => setWAccount(e.target.value)}
                placeholder="Account ID or email"
                maxLength={100}
                className="mt-1 bg-[hsl(220,30%,14%)] border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-xs text-white/70">Amount (USD)</Label>
              <Input
                value={wAmount}
                onChange={(e) => setWAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                placeholder="0.00"
                className="mt-1 bg-[hsl(220,30%,14%)] border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-xs text-white/70">Security PIN</Label>
              <Input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                type="password"
                placeholder="••••"
                className="mt-1 bg-[hsl(220,30%,14%)] border-white/10 text-white tracking-widest"
              />
            </div>

            <Button onClick={handleWithdraw} className="w-full bg-[hsl(220,30%,14%)] hover:bg-[hsl(220,30%,18%)] border border-white/10">
              Submit Withdrawal
            </Button>
          </div>
        )}

        {tab === "history" && (
          <div className="px-5 space-y-2">
            {MOCK_HISTORY.map((h) => (
              <div key={h.id} className="bg-[hsl(220,30%,10%)] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(220,30%,16%)] flex items-center justify-center">
                  <ArrowDownToLine className={`w-4 h-4 ${h.type === "Deposit" ? "text-emerald-400" : "text-red-400 rotate-180"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{h.platform} • {h.type}</p>
                  <p className="text-[11px] text-white/50">{h.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">${h.amount}</p>
                  <p className={`text-[10px] font-semibold ${
                    h.status === "Completed" ? "text-emerald-400" : h.status === "Pending" ? "text-amber-400" : "text-red-400"
                  }`}>{h.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
};

export default FundDeriv;
