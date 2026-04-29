import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Eye, EyeOff, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/dashboard/BottomNav";
import {
  Currency,
  CURRENCY_LABELS,
  CURRENCY_SYMBOLS,
  CURRENCY_TONES,
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
    return () => {
      cancelled = true;
    };
  }, [user]);

  const ordered = useMemo(() => {
    return ORDER.map((c) => wallets.find((w) => w.currency === c)).filter(Boolean) as WalletRow[];
  }, [wallets]);

  const totalUsd = useMemo(() => {
    if (!rates) return 0;
    return ordered.reduce((sum, w) => sum + toUsd(w.currency, Number(w.balance), rates), 0);
  }, [ordered, rates]);

  return (
    <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex flex-col">
      {/* Top */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <button onClick={() => navigate("/dashboard")} className="text-white/70 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Wallets</h1>
        <button onClick={() => setHidden((h) => !h)} className="text-white/70 hover:text-white">
          {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Total balance hero */}
      <div className="px-5 pt-4">
        <div className="rounded-3xl bg-gradient-to-br from-[hsl(220,30%,15%)] to-[hsl(220,40%,9%)] border border-white/10 p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl" />
          <p className="text-xs text-white/50 uppercase tracking-wider">Total Balance (USD)</p>
          <p className="text-4xl font-bold mt-2 tracking-tight">
            {hidden ? "••••••" : `$${formatBalance("USD", totalUsd)}`}
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>Across {ordered.length} wallet{ordered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Wallet list */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-base font-semibold mb-3">Your Assets</p>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-white/40" />
          </div>
        ) : (
          <div className="space-y-2">
            {ordered.map((w) => {
              const usd = rates ? toUsd(w.currency, Number(w.balance), rates) : 0;
              return (
                <button
                  key={w.id}
                  onClick={() => navigate(`/wallet/${w.currency}`)}
                  className="w-full bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl px-4 py-4 flex items-center gap-3 hover:bg-[hsl(220,30%,15%)] transition-colors"
                >
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${CURRENCY_TONES[w.currency]} flex items-center justify-center text-lg font-bold`}>
                    {CURRENCY_SYMBOLS[w.currency]}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold">{w.currency}</p>
                    <p className="text-xs text-white/50 truncate">{CURRENCY_LABELS[w.currency]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {hidden ? "••••" : formatBalance(w.currency, Number(w.balance))}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {hidden ? "" : `≈ $${formatBalance("USD", usd)}`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1" />
      <BottomNav />
    </div>
  );
};

export default Wallet;
