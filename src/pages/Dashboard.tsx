import { useEffect, useMemo, useState } from "react";

import { Bell, Wallet, ArrowDownToLine, ArrowUpFromLine, Repeat, Send, Loader2 } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";
import DrawerMenu from "@/components/dashboard/DrawerMenu";
import MainBalanceCard from "@/components/dashboard/MainBalanceCard";
import DashboardRatesStrip from "@/components/dashboard/DashboardRatesStrip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FundModal from "@/components/dashboard/FundModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import ConvertModal from "@/components/dashboard/ConvertModal";
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

type ActionKey = "fund" | "withdraw" | "convert" | "send";

const quickActions: {
  key: ActionKey;
  icon: typeof ArrowDownToLine;
  label: string;
  iconColor: string;
  bg: string;
  ring: string;
}[] = [
  { key: "fund", icon: ArrowDownToLine, label: "Fund", iconColor: "text-emerald-400", bg: "bg-emerald-500/15", ring: "ring-emerald-500/20" },
  { key: "withdraw", icon: ArrowUpFromLine, label: "Withdraw", iconColor: "text-red-400", bg: "bg-red-500/15", ring: "ring-red-500/20" },
  { key: "convert", icon: Repeat, label: "Convert", iconColor: "text-amber-400", bg: "bg-amber-500/15", ring: "ring-amber-500/20" },
  { key: "send", icon: Send, label: "Send", iconColor: "text-sky-400", bg: "bg-sky-500/15", ring: "ring-sky-500/20" },
];

const actionCopy: Record<Exclude<ActionKey, "fund" | "withdraw" | "convert">, { title: string; description: string }> = {
  send: { title: "Send to AstroTag", description: "Instantly send to another PremiumX user via AstroTag. Coming next." },
};

const Dashboard = () => {
  
  const { user } = useAuth();
  
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


  return (
    <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <DrawerMenu username={username} email={user?.email ?? undefined} />
        <h2 className="text-lg font-bold text-amber-400 tracking-wide">PremiumX</h2>
        <div className="flex items-center gap-3">
          <button className="relative text-white/70 hover:text-white" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[hsl(220,30%,18%)] border border-white/10 flex items-center justify-center text-sm font-bold text-amber-300 uppercase">
            {greetingName.charAt(0)}
          </div>
        </div>
      </div>

      {/* Welcome */}
      <div className="px-5 pt-4 pb-2 flex items-end justify-between">
        <div>
          <p className="text-xs text-white/50">Welcome back,</p>
          <h1 className="text-2xl font-bold capitalize flex items-center gap-2">
            {greetingName} <span className="text-xl">👋</span>
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Main Balance Card */}
      <MainBalanceCard wallets={wallets.map((w) => ({ currency: w.currency, balance: Number(w.balance) }))} loading={loading} />

      {/* Quick Actions */}
      <div className="px-5 pt-5 pb-2">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                onClick={() => setOpenAction(a.key)}
                className="flex flex-col items-center gap-2 bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl py-4 hover:bg-[hsl(220,30%,15%)] transition-colors"
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center ${a.bg} ring-1 ${a.ring}`}>
                  <Icon className={`w-5 h-5 ${a.iconColor}`} />
                </span>
                <span className="text-[11px] font-medium text-white/80">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Market Rates */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-2">Live Market Rates</p>
      </div>
      <DashboardRatesStrip />

      {/* PremiumX AI Signal */}
      <div className="px-5 pt-5">
        <button
          type="button"
          className="w-full flex items-center gap-3 bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl p-4 hover:bg-[hsl(220,30%,15%)] transition-colors text-left"
        >
          <span className="w-11 h-11 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20 flex items-center justify-center text-xl">
            🧠
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">PremiumX AI Signal</p>
            <p className="text-xs text-emerald-300/80 truncate">BTC bullish divergence detected — see full analysis</p>
          </div>
          <span className="text-white/40 text-lg">›</span>
        </button>
      </div>



      {/* Recent Activity */}
      {user && <TransactionsList userId={user.id} refreshKey={txRefreshKey} showFilters />}

      <div className="flex-1" />

      <BottomNav />

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

      {/* Convert Modal */}
      {user && (
        <ConvertModal
          open={openAction === "convert"}
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
        open={openAction !== null && openAction !== "fund" && openAction !== "withdraw" && openAction !== "convert"}
        onOpenChange={(o) => !o && setOpenAction(null)}
      >
        <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
          {openAction && openAction !== "fund" && openAction !== "withdraw" && openAction !== "convert" && (
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
