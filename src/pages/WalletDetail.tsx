import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Repeat, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/dashboard/BottomNav";
import TransactionsList from "@/components/dashboard/TransactionsList";
import FundModal from "@/components/dashboard/FundModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import ConvertModal from "@/components/dashboard/ConvertModal";
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

const VALID: Currency[] = ["NGN", "USD", "USDT", "BTC", "ETH"];

type Action = "fund" | "withdraw" | "convert" | "send" | null;

const WalletDetail = () => {
  const { currency } = useParams<{ currency: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [rates, setRates] = useState<UsdRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<Action>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const cur = (currency?.toUpperCase() as Currency) || "NGN";
  const isValid = VALID.includes(cur);

  const reload = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallets")
      .select("id,currency,balance,available_balance")
      .eq("user_id", user.id);
    if (data) setWallets(data as WalletRow[]);
  };

  useEffect(() => {
    if (!user || !isValid) {
      setLoading(false);
      return;
    }
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
  }, [user, isValid]);

  const wallet = useMemo(() => wallets.find((w) => w.currency === cur), [wallets, cur]);
  const usdValue = wallet && rates ? toUsd(cur, Number(wallet.balance), rates) : 0;

  const supportsFiatActions = cur === "NGN";
  const supportsConvert = ["NGN", "USD", "USDT"].includes(cur);
  const supportsWithdraw = ["NGN", "USD", "USDT"].includes(cur);

  const onCreated = () => {
    setRefreshKey((k) => k + 1);
    reload();
  };

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex items-center justify-center">
        <p>Unknown wallet</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex flex-col">
      {/* Top */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <button onClick={() => navigate("/wallet")} className="text-white/70 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{cur} Wallet</h1>
        <div className="w-5" />
      </div>

      {/* Balance card */}
      <div className="px-5 pt-4">
        <div className={`rounded-3xl bg-gradient-to-br ${CURRENCY_TONES[cur]} border border-white/10 p-6 relative overflow-hidden`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {CURRENCY_SYMBOLS[cur]}
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider">{CURRENCY_LABELS[cur]}</p>
              <p className="text-sm text-white/70">{cur}</p>
            </div>
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white/40 mt-6" />
          ) : (
            <>
              <p className="text-4xl font-bold mt-5 tracking-tight">
                {formatBalance(cur, Number(wallet?.balance ?? 0))}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-white/60">
                <span>≈ ${formatBalance("USD", usdValue)}</span>
                <span>
                  Available: {formatBalance(cur, Number(wallet?.available_balance ?? 0))}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 pt-6">
        <p className="text-sm font-semibold mb-3 text-white/80">Actions</p>
        <div className="grid grid-cols-4 gap-3">
          <button
            disabled={!supportsFiatActions}
            onClick={() => setAction("fund")}
            className="flex flex-col items-center gap-2 bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl py-4 hover:bg-[hsl(220,30%,15%)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-medium text-white/80">Fund</span>
          </button>
          <button
            disabled={!supportsWithdraw}
            onClick={() => setAction("withdraw")}
            className="flex flex-col items-center gap-2 bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl py-4 hover:bg-[hsl(220,30%,15%)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-medium text-white/80">Withdraw</span>
          </button>
          <button
            disabled={!supportsConvert}
            onClick={() => setAction("convert")}
            className="flex flex-col items-center gap-2 bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl py-4 hover:bg-[hsl(220,30%,15%)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Repeat className="w-5 h-5 text-sky-400" />
            <span className="text-[11px] font-medium text-white/80">Convert</span>
          </button>
          <button
            onClick={() => toast({ title: "Send via AstroTag", description: "Coming next." })}
            className="flex flex-col items-center gap-2 bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl py-4 hover:bg-[hsl(220,30%,15%)] transition-colors"
          >
            <Send className="w-5 h-5 text-purple-400" />
            <span className="text-[11px] font-medium text-white/80">Send</span>
          </button>
        </div>
        {(cur === "BTC" || cur === "ETH") && (
          <p className="text-xs text-white/40 mt-3 text-center">
            On-chain {cur} deposits and withdrawals coming soon.
          </p>
        )}
      </div>

      {/* History */}
      {user && (
        <TransactionsList userId={user.id} refreshKey={refreshKey} currency={cur} limit={50} />
      )}

      <div className="flex-1" />
      <BottomNav />

      {/* Modals */}
      {user && (
        <>
          <FundModal
            open={action === "fund"}
            onOpenChange={(o) => !o && setAction(null)}
            userId={user.id}
            ngnWalletId={wallets.find((w) => w.currency === "NGN")?.id}
            onCreated={onCreated}
          />
          <WithdrawModal
            open={action === "withdraw"}
            onOpenChange={(o) => !o && setAction(null)}
            userId={user.id}
            wallets={wallets.filter((w) => ["NGN", "USD", "USDT"].includes(w.currency)) as any}
            onCreated={onCreated}
          />
          <ConvertModal
            open={action === "convert"}
            onOpenChange={(o) => !o && setAction(null)}
            userId={user.id}
            wallets={wallets.filter((w) => ["NGN", "USD", "USDT"].includes(w.currency)) as any}
            onCreated={onCreated}
          />
        </>
      )}
    </div>
  );
};

export default WalletDetail;
