import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/dashboard/BottomNav";
import DrawerMenu from "@/components/dashboard/DrawerMenu";
import { useAuth } from "@/hooks/useAuth";

type TabKey = "insights" | "chat" | "news";

interface ChatMsg { role: "user" | "assistant"; content: string }

interface Signal {
  pair: string;
  side: "BUY" | "SELL" | "HOLD";
  desc: string;
  confidence: number;
  category: "Crypto" | "Forex" | "Synthetic";
  time: string;
}

const SIGNALS: Signal[] = [
  { pair: "BTC/USD", side: "BUY", desc: "Bullish divergence on 4H. RSI: 58, MACD crossing upward. Entry: $103,500 · Target: $108,000 · SL: $101,000", confidence: 78, category: "Crypto", time: "1 min ago" },
  { pair: "EUR/USD", side: "SELL", desc: "Bearish rejection at 1.0850 resistance. Targeting 1.0780 support. Risk/Reward: 1:2.5", confidence: 72, category: "Forex", time: "5 mins ago" },
  { pair: "Volatility 75", side: "HOLD", desc: "Ranging market detected. Wait for breakout above 2,840 before entering long.", confidence: 64, category: "Synthetic", time: "12 mins ago" },
];

const ADVISER_TIPS = [
  { title: "Diversify across assets", body: "Hold no more than 30% of capital in a single instrument to reduce risk exposure." },
  { title: "Cash flow first", body: "Reinvest only after locking in 50% of profits to your stable USD wallet." },
];

const NEWS_ITEMS = [
  { title: "Bitcoin reclaims $103K as ETF inflows surge", source: "CoinDesk", time: "10 mins ago" },
  { title: "Fed signals pause on rate hikes — risk assets rally", source: "Reuters", time: "1 hour ago" },
  { title: "Deriv launches new Volatility 100 (1s) index", source: "Deriv Blog", time: "3 hours ago" },
];

const QUICK_CHIPS = ["Buy BTC?", "Best trade?", "NGN forecast"];

const categoryStyle = (c: Signal["category"]) =>
  c === "Crypto" ? "bg-emerald-500/15 text-emerald-300" :
  c === "Forex" ? "bg-rose-500/15 text-rose-300" :
  "bg-sky-500/15 text-sky-300";

const sideStyle = (s: Signal["side"]) =>
  s === "BUY" ? "bg-emerald-500/20 text-emerald-400" :
  s === "SELL" ? "bg-red-500/20 text-red-400" :
  "bg-sky-500/20 text-sky-400";

const AI = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>("insights");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: `**PremiumX AI**\n\nHi ${user?.email?.split("@")[0] ?? "trader"}! I'm your AI financial assistant. Ask me anything about trading, crypto, or financial planning.\n\nTry: "Should I buy BTC now?" or "Best trade setup today?"`,
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, tab]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || streaming) return;
    setMessages((m) => [...m, { role: "user", content: t }, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    const reply = `Quick take on **"${t.slice(0, 80)}"**:\n\n- Check market structure on the 4H first.\n- Risk no more than **1–2%** per trade.\n- Wait for confirmation candle before entering.\n\n_(Mock response — your backend developer will wire up the real AI.)_`;
    let acc = "";
    for (const tok of reply.split(/(\s+)/)) {
      await new Promise((r) => setTimeout(r, 18));
      acc += tok;
      setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m)));
    }
    setStreaming(false);
  };

  return (
    <div className="h-[100dvh] bg-[hsl(220,40%,7%)] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pb-3 bg-[hsl(220,40%,7%)]"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <DrawerMenu username={user?.email?.split("@")[0]} email={user?.email ?? undefined} />
        <h1 className="text-base font-bold">PremiumX AI</h1>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-5">
        <div className="grid grid-cols-3 bg-[hsl(220,30%,10%)] rounded-xl p-1 border border-white/5">
          {([
            { k: "insights", label: "Insights" },
            { k: "chat", label: "AI Chat" },
            { k: "news", label: "News" },
          ] as { k: TabKey; label: string }[]).map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === k ? "bg-[hsl(220,30%,16%)] text-white" : "text-white/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-none pt-3 pb-4">
        {tab === "insights" && (
          <>
            <div className="px-5">
              <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-2">Trade Signals</p>
              <div className="space-y-2.5">
                {SIGNALS.map((s) => (
                  <div key={s.pair} className="rounded-2xl bg-[hsl(220,30%,10%)] border border-white/5 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-bold">{s.pair}</p>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${sideStyle(s.side)}`}>{s.side}</span>
                      </div>
                      <p className="text-[10px] text-white/40 flex-shrink-0">{s.time}</p>
                    </div>
                    <p className="text-xs text-white/60 mt-1.5 leading-relaxed">{s.desc}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-semibold">Confidence: {s.confidence}%</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${categoryStyle(s.category)}`}>{s.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 pt-5">
              <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-2">Business Adviser</p>
              <div className="space-y-2.5">
                {ADVISER_TIPS.map((t) => (
                  <div key={t.title} className="rounded-2xl bg-[hsl(220,30%,10%)] border border-white/5 p-4">
                    <p className="text-sm font-semibold text-amber-300">{t.title}</p>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{t.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "chat" && (
          <div className="px-5 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl p-3.5 text-sm leading-relaxed ${
                  m.role === "assistant" ? "bg-[hsl(220,30%,12%)] border border-white/5" : "bg-amber-500/15 border border-amber-500/20 ml-8"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-strong:text-amber-300">
                    <ReactMarkdown>{m.content || (streaming && i === messages.length - 1 ? "…" : "")}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-white">{m.content}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "news" && (
          <div className="px-5 space-y-2.5">
            {NEWS_ITEMS.map((n) => (
              <div key={n.title} className="rounded-2xl bg-[hsl(220,30%,10%)] border border-white/5 p-4">
                <p className="text-sm font-semibold leading-snug">{n.title}</p>
                <p className="text-[11px] text-white/50 mt-1.5">{n.source} • {n.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat composer */}
      {tab === "chat" && (
        <div className="flex-shrink-0 px-5 pb-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask the AI..."
              className="flex-1 bg-[hsl(220,30%,14%)] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-white/40"
            />
            <button
              onClick={() => send(input)}
              disabled={streaming || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[hsl(220,30%,14%)] border border-white/10 flex items-center justify-center text-white hover:bg-[hsl(220,30%,18%)] disabled:opacity-40"
            >
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {QUICK_CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                disabled={streaming}
                className="px-3 py-1.5 rounded-full bg-[hsl(220,30%,12%)] border border-white/10 text-xs text-white/80 hover:bg-[hsl(220,30%,16%)]"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
};

export default AI;
