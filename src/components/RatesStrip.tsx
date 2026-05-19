import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Rate {
  symbol: string;
  label: string;
  price: number | null;
  change?: number | null;
  format: (n: number) => string;
}

const fmtUsd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 10 ? 4 : 0 }).format(n);
const fmtNgn = (n: number) =>
  "₦" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

const RatesStrip = () => {
  const [rates, setRates] = useState<Rate[]>([
    { symbol: "USD/NGN", label: "USD → NGN", price: null, format: fmtNgn },
    { symbol: "BTC/USD", label: "BTC", price: null, format: fmtUsd },
    { symbol: "ETH/USD", label: "ETH", price: null, format: fmtUsd },
    { symbol: "USDT/NGN", label: "USDT → NGN", price: null, format: fmtNgn },
  ]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [coinRes, fxRes] = await Promise.all([
          fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd,ngn&include_24hr_change=true"),
          fetch("https://open.er-api.com/v6/latest/USD"),
        ]);
        const coin = await coinRes.json();
        const fx = await fxRes.json();
        if (cancelled) return;
        const usdNgn = fx?.rates?.NGN ?? null;
        setRates([
          { symbol: "USD/NGN", label: "USD → NGN", price: usdNgn, format: fmtNgn },
          { symbol: "BTC/USD", label: "BTC", price: coin?.bitcoin?.usd ?? null, change: coin?.bitcoin?.usd_24h_change, format: fmtUsd },
          { symbol: "ETH/USD", label: "ETH", price: coin?.ethereum?.usd ?? null, change: coin?.ethereum?.usd_24h_change, format: fmtUsd },
          { symbol: "USDT/NGN", label: "USDT → NGN", price: coin?.tether?.ngn ?? null, format: fmtNgn },
        ]);
      } catch {
        // silently ignore — strip shows placeholders
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <section className="w-full bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {rates.map((r) => {
          const up = r.change != null ? r.change >= 0 : null;
          return (
            <div key={r.symbol} className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{r.label}</p>
                <p className="text-base font-bold text-foreground tabular-nums">
                  {r.price != null ? r.format(r.price) : "—"}
                </p>
              </div>
              {r.change != null && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-success" : "text-danger"}`}>
                  {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(r.change).toFixed(2)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RatesStrip;
