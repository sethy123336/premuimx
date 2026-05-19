import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Rate {
  symbol: string;
  price: number | null;
  change: number | null;
  fmt: (n: number) => string;
}

const fmtUsd = (n: number) =>
  "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: n < 10 ? 4 : 0 }).format(n);
const fmtNgn = (n: number) =>
  "₦" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

const DashboardRatesStrip = () => {
  const [rates, setRates] = useState<Rate[]>([
    { symbol: "USD/NGN", price: null, change: null, fmt: fmtNgn },
    { symbol: "BTC", price: null, change: null, fmt: fmtUsd },
    { symbol: "ETH", price: null, change: null, fmt: fmtUsd },
    { symbol: "USDT/NGN", price: null, change: null, fmt: fmtNgn },
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
        setRates([
          { symbol: "USD/NGN", price: fx?.rates?.NGN ?? null, change: null, fmt: fmtNgn },
          { symbol: "BTC", price: coin?.bitcoin?.usd ?? null, change: coin?.bitcoin?.usd_24h_change ?? null, fmt: fmtUsd },
          { symbol: "ETH", price: coin?.ethereum?.usd ?? null, change: coin?.ethereum?.usd_24h_change ?? null, fmt: fmtUsd },
          { symbol: "USDT/NGN", price: coin?.tether?.ngn ?? null, change: null, fmt: fmtNgn },
        ]);
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="px-5">
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
        {rates.map((r) => {
          const up = r.change != null ? r.change >= 0 : null;
          return (
            <div
              key={r.symbol}
              className="flex-shrink-0 bg-[hsl(220,30%,12%)] border border-white/5 rounded-xl px-3 py-2 min-w-[120px]"
            >
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium">{r.symbol}</p>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-xs font-bold tabular-nums">{r.price != null ? r.fmt(r.price) : "—"}</p>
                {r.change != null && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(r.change).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardRatesStrip;
