import { Wallet, Banknote, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    id: "wallets",
    icon: Wallet,
    title: "Wallet System",
    description: "Hold NGN, USD and crypto in one secure dashboard.",
    bullets: ["NGN Wallet", "USD Wallet", "BTC · ETH · USDT (TRC20/BEP20/ERC20)"],
    tint: "from-amber-500/15 to-amber-500/0",
  },
  {
    id: "funding",
    icon: Banknote,
    title: "Brokerage Funding",
    description: "Fund your trading accounts instantly with auto-conversion.",
    bullets: ["Deriv · Skrill · PayPal", "Binance · Bybit · Neteller", "Instant funding & receipts"],
    tint: "from-sky-500/15 to-sky-500/0",
  },
  {
    id: "ai",
    icon: Sparkles,
    title: "PremiumX AI",
    description: "Smart insights for traders, business and the market.",
    bullets: ["AI Trade Insights", "Business Adviser", "Live rates & crypto news"],
    tint: "from-violet-500/15 to-violet-500/0",
  },
];

const WhatWeDoSection = () => {
  return (
    <section id="services" className="w-full px-6 py-24 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">What we do</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Everything you need to fund, trade and grow
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Three pillars that replace a stack of disconnected tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="group relative rounded-2xl bg-surface border border-border p-7 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.tint} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{f.description}</p>
                <ul className="space-y-2 mb-6">
                  {f.bullets.map((b) => (
                    <li key={b} className="text-sm text-foreground/80 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all"
                >
                  Explore <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
