import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff, Loader2, Plus, Repeat, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/dashboard/BottomNav";
import FundModal from "@/components/dashboard/FundModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import ConvertModal from "@/components/dashboard/ConvertModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Currency,
  fetchUsdRates,
  formatBalance,
  toUsd,
  UsdRates,
} from "@/lib/currency";

interface WalletRow {
  id: string;
  currency: Currency;
  balance: number;
  available_balance: number;
}

const FIAT: Currency[] = ["NGN", "USD"];
const CRYPTO: Currency[] = ["USDT", "BTC", "ETH"];

type ActionKey = "fund" | "withdraw" | "convert" | "send";

const fmtNgn = (v: number) => "₦" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
const fmtUsd = (v: number) => "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [rates, setRates] = useState<UsdRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [openAction, setOpenAction] = useState<ActionKey | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = async () => {
    if (!user) return;
    const { data } = await supabase.from("wallets").select("id,currency,balance,available_balance").eq("user_id", user.id);
    setWallets((data ?? []) as WalletRow[]);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      supabase.from("wallets").select("id,currency,balance,available_balance").eq("user_id", user.id),
      fetchUsdRates(),
    ]).then(([walletRes, rateData]) => {
      if (cancelled) return;
      setWallets((walletRes.data ?? []) as WalletRow[]);
      setRates(rateData);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user, refreshKey]);

  const byCurrency = useMemo(() => {
    const m: Partial<Record<Currency, WalletRow>> = {};
    wallets.forEach((w) => { m[w.currency] = w; });
    return m;
  }, [wallets]);

  const ngnWalletId = byCurrency.NGN?.id;

  const ngnBal = Number(byCurrency.NGN?.balance ?? 0);
  const usdBal = Number(byCurrency.USD?.balance ?? 0);
  const ngnInUsd = rates ? toUsd("NGN", ngnBal, rates) : 0;
  const usdInNgn = rates ? usdBal * rates.NGN : 0;

  const actions: { key: ActionKey; label: string; icon: typeof ArrowDownToLine; color: string; bg: string; ring: string }[] = [
    { key: "fund", label: "Deposit", icon: ArrowDownToLine, color: "text-emerald-400", bg: "bg-emerald-500/15", ring: "ring-emerald-500/20" },
    { key: "withdraw", label: "Withdraw", icon: ArrowUpFromLine, color: "text-red-400", bg: "bg-red-500/15", ring: "ring-red-500/20" },
    { key: "convert", label: "Convert", icon: Repeat, color: "text-amber-400", bg: "bg-amber-500/15", ring: "ring-amber-500/20" },
    { key: "send", label: "Send", icon: Send, color: "text-sky-400", bg: "bg-sky-500/15", ring: "ring-sky-500/20" },
  ];

  return (
    <div className="h-[100dvh] bg-[hsl(220,40%,7%)] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pb-2 bg-[hsl(220,40%,7%)]"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <button onClick={() => navigate("/dashboard")} className="text-white/70 hover:text-white" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Wallets</h1>
        <button onClick={() => setHidden((h) => !h)} className="text-white/70 hover:text-white" aria-label="Toggle balance">
          {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Scrollable inner */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-none pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-white/40" />
          </div>
        ) : (
          <>
            {/* FIAT WALLETS */}
            <div className="px-5 pt-4">
              <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-2">Fiat Wallets</p>
              <div className="grid grid-cols-2 gap-3">
                {/* NGN */}
                <button
                  onClick={() => navigate("/wallet/NGN")}
                  className="relative overflow-hidden text-left rounded-2xl bg-gradient-to-br from-[hsl(220,35%,15%)] to-[hsl(220,40%,10%)] border border-white/10 p-4"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
                  <p className="text-xs text-white/60">NGN Wallet</p>
                  <p className="text-xl font-bold text-amber-400 mt-1 tabular-nums">{hidden ? "••••" : fmtNgn(ngnBal)}</p>
                  <p className="text-[11px] text-white/50 mt-1">≈ {hidden ? "••" : fmtUsd(ngnInUsd)}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">Active</span>
                </button>
                {/* USD */}
                <button
                  onClick={() => navigate("/wallet/USD")}
                  className="relative overflow-hidden text-left rounded-2xl bg-gradient-to-br from-[hsl(220,35%,15%)] to-[hsl(220,40%,10%)] border border-white/10 p-4"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-sky-400/10 blur-2xl pointer-events-none" />
                  <p className="text-xs text-white/60">USD Wallet</p>
                  <p className="text-xl font-bold text-amber-400 mt-1 tabular-nums">{hidden ? "••••" : fmtUsd(usdBal)}</p>
                  <p className="text-[11px] text-white/50 mt-1">≈ {hidden ? "••" : fmtNgn(usdInNgn)}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">Active</span>
                </button>
              </div>
            </div>

            {/* CRYPTO WALLETS */}
            <div className="px-5 pt-5">
              <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-2">Crypto Wallets</p>
              <div className="grid grid-cols-2 gap-3">
                {CRYPTO.map((c) => {
                  const w = byCurrency[c];
                  const bal = Number(w?.balance ?? 0);
                  const meta: Record<Currency, { name: string; unit: string; change: string; changeColor: string; subtitle: string }> = {
                    NGN: { name: "NGN", unit: "NGN", change: "", changeColor: "", subtitle: "" },
                    USD: { name: "USD", unit: "USD", change: "", changeColor: "", subtitle: "" },
                    USDT: { name: "USDT", unit: "USD", change: "+0.1%", changeColor: "text-emerald-400", subtitle: "TRC20 · BEP20 · ERC20" },
                    BTC: { name: "Bitcoin", unit: "BTC", change: "+1.2%", changeColor: "text-emerald-400", subtitle: "Bitcoin Network" },
                    ETH: { name: "Ethereum", unit: "ETH", change: "-0.5%", changeColor: "text-red-400", subtitle: "ERC20" },
                  };
                  const m = meta[c];
                  const display = c === "USDT" ? `$${formatBalance("USDT", bal)}` : `${formatBalance(c, bal)} ${m.unit}`;
                  return (
                    <button
                      key={c}
                      onClick={() => navigate(`/wallet/${c}`)}
                      className="text-left rounded-2xl bg-[hsl(220,30%,12%)] border border-white/5 p-4"
                    >
                      <p className="text-xs text-white/60">{m.name}</p>
                      <p className="text-base font-bold mt-1 tabular-nums truncate">{hidden ? "••••" : display}</p>
                      <p className={`text-[11px] mt-1 font-semibold ${m.changeColor}`}>{m.change}</p>
                      <p className="text-[10px] text-white/40 mt-1 truncate">{m.subtitle}</p>
                    </button>
                  );
                })}
                {/* Add Wallet */}
                <button className="rounded-2xl border border-dashed border-white/15 bg-[hsl(220,30%,10%)] p-4 flex flex-col items-center justify-center gap-1 text-white/50 hover:text-white/80 hover:border-white/30 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Add Wallet</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pt-5">
              <div className="grid grid-cols-4 gap-3">
                {actions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.key}
                      onClick={() => setOpenAction(a.key)}
                      className="flex flex-col items-center gap-2 bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl py-4 hover:bg-[hsl(220,30%,15%)] transition-colors"
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.bg} ring-1 ${a.ring}`}>
                        <Icon className={`w-5 h-5 ${a.color}`} />
                      </span>
                      <span className="text-[11px] font-medium text-white/80">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-shrink-0">
        <BottomNav />
      </div>

      {/* Modals */}
      {user && (
        <>
          <FundModal
            open={openAction === "fund"}
            onOpenChange={(o) => !o && setOpenAction(null)}
            userId={user.id}
            ngnWalletId={ngnWalletId}
            onCreated={() => { setRefreshKey((k) => k + 1); reload(); }}
          />
          <WithdrawModal
            open={openAction === "withdraw"}
            onOpenChange={(o) => !o && setOpenAction(null)}
            userId={user.id}
            wallets={wallets.filter((w) => ["NGN", "USD", "USDT"].includes(w.currency)) as any}
            onCreated={() => { setRefreshKey((k) => k + 1); reload(); }}
          />
          <ConvertModal
            open={openAction === "convert"}
            onOpenChange={(o) => !o && setOpenAction(null)}
            userId={user.id}
            wallets={wallets.filter((w) => ["NGN", "USD", "USDT"].includes(w.currency)) as any}
            onCreated={() => { setRefreshKey((k) => k + 1); reload(); }}
          />
          <Dialog open={openAction === "send"} onOpenChange={(o) => !o && setOpenAction(null)}>
            <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Send to AstroTag</DialogTitle>
                <DialogDescription className="text-white/60">
                  Instantly send to another PremiumX user via AstroTag. Coming next.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={() => setOpenAction(null)} className="w-full">Got it</Button>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Wallet;
