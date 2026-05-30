import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Eye, EyeOff, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/dashboard/BottomNav";
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

const ORDER: Currency[] = ["NGN", "USD", "USDT", "BTC", "ETH"];

const ASSET_META: Record<Currency, { name: string; symbol: string; iconBg: string; iconText: string }> = {
  NGN: { name: "Nigerian Naira", symbol: "₦", iconBg: "from-emerald-500/30 to-emerald-500/5", iconText: "text-emerald-300" },
  USD: { name: "US Dollar", symbol: "$", iconBg: "from-sky-500/30 to-sky-500/5", iconText: "text-sky-300" },
  USDT: { name: "Tether", symbol: "₮", iconBg: "from-teal-500/30 to-teal-500/5", iconText: "text-teal-300" },
  BTC: { name: "Bitcoin", symbol: "₿", iconBg: "from-amber-500/30 to-amber-500/5", iconText: "text-amber-300" },
  ETH: { name: "Ethereum", symbol: "Ξ", iconBg: "from-purple-500/30 to-purple-500/5", iconText: "text-purple-300" },
};

const fmtUsd = (v: number) =>
  "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [rates, setRates] = useState<UsdRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

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
  }, [user]);

  const byCurrency = useMemo(() => {
    const m: Partial<Record<Currency, WalletRow>> = {};
    wallets.forEach((w) => { m[w.currency] = w; });
    return m;
  }, [wallets]);

  const totalUsd = useMemo(() => {
    if (!rates) return 0;
    return wallets.reduce((sum, w) => sum + toUsd(w.currency, Number(w.balance) || 0, rates), 0);
  }, [wallets, rates]);

  return (
    <div className="h-[100dvh] bg-[hsl(220,40%,7%)] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pb-2 bg-[hsl(220,40%,7%)]"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <div className="w-5" />
        <h1 className="text-lg font-semibold">Wallets</h1>
        <button onClick={() => setHidden((h) => !h)} className="text-white/70 hover:text-white" aria-label="Toggle balance">
          {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-none pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-white/40" />
          </div>
        ) : (
          <>
            {/* Total Balance Card */}
            <div className="px-5 pt-4">
              <div data-keep-dark className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(220,40%,16%)] via-[hsl(220,45%,12%)] to-[hsl(220,50%,8%)] border border-white/10 p-6 text-white">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
                <p className="text-xs uppercase tracking-wider text-white/60 font-medium">Total Balance (USD)</p>
                <p className="text-5xl font-bold tracking-tight tabular-nums mt-3">
                  {hidden ? "••••••" : !rates ? "—" : fmtUsd(totalUsd)}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-emerald-400 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>Across {wallets.length} wallets</span>
                </div>
              </div>
            </div>

            {/* Your Assets */}
            <div className="px-5 pt-6">
              <h2 className="text-xl font-bold mb-3">Your Assets</h2>
              <div className="space-y-3">
                {ORDER.map((c) => {
                  const w = byCurrency[c];
                  if (!w) return null;
                  const bal = Number(w.balance ?? 0);
                  const usdEq = rates ? toUsd(c, bal, rates) : 0;
                  const meta = ASSET_META[c];
                  return (
                    <button
                      key={c}
                      onClick={() => navigate(`/wallet/${c}`)}
                      className="w-full flex items-center gap-3 rounded-2xl bg-[hsl(220,30%,11%)] border border-white/5 p-4 hover:bg-[hsl(220,30%,14%)] transition-colors text-left"
                    >
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xl font-bold ${meta.iconText}`}>{meta.symbol}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold">{c}</p>
                        <p className="text-xs text-white/50 truncate">{meta.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold tabular-nums">
                          {hidden ? "••••" : formatBalance(c, bal)}
                        </p>
                        <p className="text-xs text-white/50 tabular-nums">≈ {hidden ? "••" : fmtUsd(usdEq)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
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
    </div>
  );
};

export default Wallet;
