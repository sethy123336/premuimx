import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, DollarSign, Grid2X2, Wallet, BookOpen, Bot, Monitor, ArrowDownToLine, ArrowUpFromLine, Repeat, Send, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FundModal from "@/components/dashboard/FundModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import TransactionsList from "@/components/dashboard/TransactionsList";
import logo from "@/assets/logo.png";

type Currency = "NGN" | "USD" | "USDT" | "BTC" | "ETH";

interface WalletRow {
  id: string;
  currency: Currency;
  balance: number;
  available_balance: number;
}

const DISPLAY_CURRENCIES: Currency[] = ["NGN", "USD", "USDT"];

const formatBalance = (currency: Currency, value: number) => {
  const fractionDigits = currency === "NGN" || currency === "USD" ? 2 : currency === "USDT" ? 2 : 6;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

const bottomTabs = [
  { icon: Grid2X2, label: "Dashboard" },
  { icon: Wallet, label: "Wallet" },
  { icon: Monitor, label: "Fund Deriv" },
  { icon: BookOpen, label: "Journal" },
  { icon: Bot, label: "AI" },
];

type ActionKey = "fund" | "withdraw" | "convert" | "send";

const quickActions: { key: ActionKey; icon: typeof ArrowDownToLine; label: string; tone: string }[] = [
  { key: "fund", icon: ArrowDownToLine, label: "Fund", tone: "text-emerald-400" },
  { key: "withdraw", icon: ArrowUpFromLine, label: "Withdraw", tone: "text-amber-400" },
  { key: "convert", icon: Repeat, label: "Convert", tone: "text-sky-400" },
  { key: "send", icon: Send, label: "Send", tone: "text-purple-400" },
];

const actionCopy: Record<Exclude<ActionKey, "fund" | "withdraw">, { title: string; description: string }> = {
  convert: { title: "Convert Currency", description: "Swap between NGN, USD and USDT at live rates. Coming next." },
  send: { title: "Send to AstroTag", description: "Instantly send to another PremiumX user via AstroTag. Coming next." },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAction, setOpenAction] = useState<ActionKey | null>(null);
  const [username, setUsername] = useState<string>("");
  const [txRefreshKey, setTxRefreshKey] = useState(0);

  const ngnWalletId = useMemo(() => wallets.find((w) => w.currency === "NGN")?.id, [wallets]);

  const reloadWallets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallets")
      .select("id,currency,balance,available_balance")
      .eq("user_id", user.id);
    if (data) setWallets(data as WalletRow[]);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      const [{ data: walletData, error: walletErr }, { data: profileData }] = await Promise.all([
        supabase.from("wallets").select("id,currency,balance,available_balance").eq("user_id", user.id),
        supabase.from("profiles").select("username").eq("user_id", user.id).maybeSingle(),
      ]);

      if (cancelled) return;

      if (walletErr) {
        toast({ title: "Couldn't load wallets", description: walletErr.message, variant: "destructive" });
      } else if (walletData) {
        setWallets(walletData as WalletRow[]);
      }

      if (profileData?.username) setUsername(profileData.username);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  const displayWallets = useMemo(() => {
    return DISPLAY_CURRENCIES.map((c) => {
      const w = wallets.find((x) => x.currency === c);
      return { currency: c, balance: w?.balance ?? 0 };
    });
  }, [wallets]);

  const greetingName = username || user?.email?.split("@")[0] || "trader";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <Menu className="w-6 h-6 text-white/70" />
        <div className="flex items-center gap-3">
          <button onClick={handleSignOut} aria-label="Sign out" className="text-white/70 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
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
          Hello, <span className="text-amber-400 capitalize">{greetingName}</span>
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
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-white/40" />
            </div>
          ) : (
            displayWallets.map((card) => (
              <div
                key={card.currency}
                className="bg-[hsl(220,30%,12%)] rounded-2xl px-5 py-4 flex items-center justify-between border border-white/5"
              >
                <div>
                  <p className="text-xs text-white/50 mb-1">{card.currency}</p>
                  <p className="text-2xl font-bold tracking-tight">{formatBalance(card.currency, card.balance)}</p>
                  <p className="text-xs mt-1 text-white/40">Available</p>
                </div>
                <DollarSign className="w-10 h-10 text-white/10" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-base font-semibold mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                onClick={() => setOpenAction(a.key)}
                className="flex flex-col items-center gap-2 bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl py-4 hover:bg-[hsl(220,30%,15%)] transition-colors"
              >
                <Icon className={`w-5 h-5 ${a.tone}`} />
                <span className="text-[11px] font-medium text-white/80">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {user && <TransactionsList userId={user.id} refreshKey={txRefreshKey} />}

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

      {/* Fund Modal */}
      {user && (
        <FundModal
          open={openAction === "fund"}
          onOpenChange={(o) => !o && setOpenAction(null)}
          userId={user.id}
          ngnWalletId={ngnWalletId}
          onCreated={() => {
            setTxRefreshKey((k) => k + 1);
            reloadWallets();
          }}
        />
      )}

      {/* Withdraw Modal */}
      {user && (
        <WithdrawModal
          open={openAction === "withdraw"}
          onOpenChange={(o) => !o && setOpenAction(null)}
          userId={user.id}
          wallets={wallets.filter((w) => ["NGN", "USD", "USDT"].includes(w.currency)) as any}
          onCreated={() => {
            setTxRefreshKey((k) => k + 1);
            reloadWallets();
          }}
        />
      )}

      {/* Other Quick Action placeholders */}
      <Dialog
        open={openAction !== null && openAction !== "fund" && openAction !== "withdraw"}
        onOpenChange={(o) => !o && setOpenAction(null)}
      >
        <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
          {openAction && openAction !== "fund" && openAction !== "withdraw" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{actionCopy[openAction].title}</DialogTitle>
                <DialogDescription className="text-white/60">
                  {actionCopy[openAction].description}
                </DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                <Button onClick={() => setOpenAction(null)} className="w-full">Got it</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
