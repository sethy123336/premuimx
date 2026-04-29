import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Repeat, Send, Loader2, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TxType = Database["public"]["Enums"]["transaction_type"];
type TxStatus = Database["public"]["Enums"]["transaction_status"];
type Currency = Database["public"]["Enums"]["currency_code"];

interface TxRow {
  id: string;
  type: TxType;
  status: TxStatus;
  amount: number;
  currency: Currency;
  description: string | null;
  created_at: string;
}

const typeMeta: Record<TxType, { icon: typeof ArrowDownLeft; tone: string; label: string }> = {
  deposit: { icon: ArrowDownLeft, tone: "text-emerald-400 bg-emerald-400/10", label: "Deposit" },
  withdrawal: { icon: ArrowUpRight, tone: "text-amber-400 bg-amber-400/10", label: "Withdrawal" },
  transfer: { icon: Send, tone: "text-purple-400 bg-purple-400/10", label: "Transfer" },
  convert: { icon: Repeat, tone: "text-sky-400 bg-sky-400/10", label: "Convert" },
  deriv_funding: { icon: ArrowUpRight, tone: "text-blue-400 bg-blue-400/10", label: "Deriv funding" },
};

const statusTone: Record<TxStatus, string> = {
  pending: "text-amber-400",
  completed: "text-emerald-400",
  failed: "text-red-400",
  cancelled: "text-white/40",
};

const fmt = (currency: Currency, amount: number) => {
  const digits = currency === "BTC" || currency === "ETH" ? 6 : 2;
  const symbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : "";
  return `${symbol}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)}${symbol ? "" : ` ${currency}`}`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

interface TransactionsListProps {
  userId: string;
  refreshKey?: number;
}

const TransactionsList = ({ userId, refreshKey = 0 }: TransactionsListProps) => {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("transactions")
      .select("id,type,status,amount,currency,description,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (cancelled) return;
        setRows((data ?? []) as TxRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey]);

  return (
    <div className="px-5 pt-6 pb-4">
      <p className="text-base font-semibold mb-3">Recent Activity</p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-white/40" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center text-center">
          <Receipt className="w-8 h-8 text-white/20 mb-2" />
          <p className="text-sm text-white/60">No transactions yet</p>
          <p className="text-xs text-white/40 mt-1">Fund your wallet to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((tx) => {
            const meta = typeMeta[tx.type];
            const Icon = meta.icon;
            const isOut = tx.type === "withdrawal" || tx.type === "transfer" || tx.type === "deriv_funding";
            return (
              <div
                key={tx.id}
                className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description ?? meta.label}</p>
                  <p className="text-xs text-white/40">{formatDate(tx.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isOut ? "text-white" : "text-emerald-400"}`}>
                    {isOut ? "-" : "+"}
                    {fmt(tx.currency, Number(tx.amount))}
                  </p>
                  <p className={`text-[10px] uppercase tracking-wide font-medium ${statusTone[tx.status]}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
