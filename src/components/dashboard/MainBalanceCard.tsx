import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { fetchUsdRates, type UsdRates, type Currency, toUsd } from "@/lib/currency";

interface WalletRow {
  currency: Currency;
  balance: number;
}

interface Props {
  wallets: WalletRow[];
  loading?: boolean;
}

const formatMoney = (currency: "NGN" | "USD", value: number) => {
  const sym = currency === "NGN" ? "₦" : "$";
  return (
    sym +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  );
};

const MainBalanceCard = ({ wallets, loading }: Props) => {
  const [display, setDisplay] = useState<"NGN" | "USD">("NGN");
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

  return (
    <div className="px-5 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(220,40%,16%)] via-[hsl(220,45%,12%)] to-[hsl(220,50%,8%)] border border-white/10 p-5">
        {/* Decorative glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2 relative">
          <p className="text-xs uppercase tracking-wider text-white/50 font-medium">Total Balance</p>
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5">
            {(["NGN", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setDisplay(c)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  display === c ? "bg-amber-400 text-black" : "text-white/60 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline gap-2 relative">
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {hidden ? "••••••" : loading || !rates ? "—" : formatMoney(display, totalDisplay)}
          </p>
          <button onClick={() => setHidden((v) => !v)} aria-label="Toggle balance" className="text-white/40 hover:text-white">
            {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 relative">
          <p className="text-xs text-white/40">
            {rates ? `1 USD ≈ ₦${rates.NGN.toFixed(0)}` : "Loading rate…"}
          </p>
          <button
            onClick={() => fetchUsdRates().then(setRates)}
            className="text-white/40 hover:text-white"
            aria-label="Refresh rate"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainBalanceCard;
