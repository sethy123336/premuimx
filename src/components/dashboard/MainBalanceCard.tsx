import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { fetchUsdRates, type UsdRates, type Currency, toUsd } from "@/lib/currency";

interface WalletRow {
  currency: Currency;
  balance: number;
}

interface Props {
  wallets: WalletRow[];
  loading?: boolean;
}

const fmt = (currency: "NGN" | "USD", value: number) => {
  const sym = currency === "NGN" ? "₦" : "$";
  return (
    sym +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  );
};

const fmtInt = (currency: "NGN" | "USD", value: number) => {
  const sym = currency === "NGN" ? "₦" : "$";
  return sym + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
};

const MainBalanceCard = ({ wallets, loading }: Props) => {
  const [display, setDisplay] = useState<"NGN" | "USD">("USD");
  const [hidden, setHidden] = useState(false);
  const [rates, setRates] = useState<UsdRates | null>(null);

  useEffect(() => {
    fetchUsdRates().then(setRates);
  }, []);

  const totalUsd = useMemo(() => {
    if (!rates) return 0;
    return wallets.reduce((sum, w) => sum + toUsd(w.currency, Number(w.balance) || 0, rates), 0);
  }, [wallets, rates]);

  const totalDisplay = display === "USD" ? totalUsd : totalUsd * (rates?.NGN ?? 0);
  const altDisplay = display === "USD" ? totalUsd * (rates?.NGN ?? 0) : totalUsd;
  const altCurrency: "NGN" | "USD" = display === "USD" ? "NGN" : "USD";

  return (
    <div className="px-5 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(220,40%,16%)] via-[hsl(220,45%,12%)] to-[hsl(220,50%,8%)] border border-white/10 p-5">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        {/* Header row */}
        <div className="flex items-center justify-between mb-3 relative">
          <p className="text-sm text-white/70 font-medium">Total Balance</p>
          <div className="flex items-center gap-3">
            {/* NGN/USD switch toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${display === "NGN" ? "text-white" : "text-white/40"}`}>NGN</span>
              <button
                onClick={() => setDisplay((d) => (d === "USD" ? "NGN" : "USD"))}
                className="relative w-10 h-5 rounded-full bg-white/10 transition-colors"
                aria-label="Toggle currency"
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-amber-400 transition-transform ${
                    display === "USD" ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className={`text-xs font-medium ${display === "USD" ? "text-white" : "text-white/40"}`}>USD</span>
            </div>
            <button onClick={() => setHidden((v) => !v)} aria-label="Toggle balance" className="text-white/50 hover:text-white">
              {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main amount */}
        <div className="relative">
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {hidden ? "••••••" : loading || !rates ? "—" : fmt(display, totalDisplay)}
          </p>
          <p className="text-xs text-white/50 mt-1">
            {rates ? `≈ ${fmtInt(altCurrency, altDisplay)} at ₦${rates.NGN.toFixed(0)}/USD` : "Loading rate…"}
          </p>
        </div>

        {/* Footer pill row */}
        <div className="flex items-center gap-3 mt-4 relative">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3 h-3" />
            +2.4% today
          </span>
          <span className="text-xs text-white/40">Last updated: just now</span>
        </div>
      </div>
    </div>
  );
};

export default MainBalanceCard;
