import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Loader2, TrendingUp, TrendingDown, Target } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TradeEntryModal, { type TradeEntry } from "@/components/journal/TradeEntryModal";

const monthName = (d: Date) => d.toLocaleString(undefined, { month: "long", year: "numeric" });

const toIso = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmtMoney = (n: number) => {
  const sign = n < 0 ? "-" : n > 0 ? "+" : "";
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const Journal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [dayOpen, setDayOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<TradeEntry | null>(null);
  const [entryOpen, setEntryOpen] = useState(false);

  const monthStart = useMemo(() => toIso(new Date(cursor.getFullYear(), cursor.getMonth(), 1)), [cursor]);
  const monthEnd = useMemo(() => toIso(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)), [cursor]);

  const reload = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("trade_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("trade_date", monthStart)
      .lte("trade_date", monthEnd)
      .order("created_at", { ascending: false });
    if (data) setEntries(data as TradeEntry[]);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      await reload();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, monthStart, monthEnd]);

  // Aggregate per day
  const byDay = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number; wins: number }>();
    for (const e of entries) {
      const cur = map.get(e.trade_date) ?? { pnl: 0, count: 0, wins: 0 };
      cur.pnl += Number(e.pnl_amount);
      cur.count += 1;
      if (e.outcome === "win") cur.wins += 1;
      map.set(e.trade_date, cur);
    }
    return map;
  }, [entries]);

  // Month stats
  const stats = useMemo(() => {
    let pnl = 0, wins = 0, losses = 0, count = 0;
    let best: { date: string; pnl: number } | null = null;
    let worst: { date: string; pnl: number } | null = null;
    for (const [date, d] of byDay.entries()) {
      pnl += d.pnl;
      count += d.count;
      wins += d.wins;
      losses += d.count - d.wins;
      if (!best || d.pnl > best.pnl) best = { date, pnl: d.pnl };
      if (!worst || d.pnl < worst.pnl) worst = { date, pnl: d.pnl };
    }
    const winRate = count > 0 ? (wins / count) * 100 : 0;
    return { pnl, count, winRate, best, worst, losses };
  }, [byDay]);

  // Build calendar grid (Sun-start)
  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = first.getDay(); // 0=Sun
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: { date: Date | null; iso: string | null }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ date: null, iso: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      cells.push({ date: dt, iso: toIso(dt) });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, iso: null });
    return cells;
  }, [cursor]);

  const dayEntries = useMemo(
    () => (selectedDate ? entries.filter((e) => e.trade_date === selectedDate) : []),
    [entries, selectedDate]
  );

  const openDay = (iso: string) => {
    setSelectedDate(iso);
    setDayOpen(true);
  };

  const today = toIso(new Date());

  return (
    <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => navigate("/dashboard")} className="text-white/70 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Trade Journal</h1>
      </div>

      {/* Month nav */}
      <div className="px-5 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-base font-semibold">{monthName(cursor)}</p>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 pt-4 grid grid-cols-3 gap-2">
        <div className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl p-3">
          <p className="text-[10px] text-white/40 uppercase tracking-wide">Net P&amp;L</p>
          <p className={`text-base font-bold mt-1 ${stats.pnl > 0 ? "text-emerald-300" : stats.pnl < 0 ? "text-red-300" : "text-white"}`}>
            {fmtMoney(stats.pnl)}
          </p>
        </div>
        <div className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl p-3">
          <p className="text-[10px] text-white/40 uppercase tracking-wide">Win Rate</p>
          <p className="text-base font-bold mt-1 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-amber-300" />
            {stats.winRate.toFixed(0)}%
          </p>
        </div>
        <div className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl p-3">
          <p className="text-[10px] text-white/40 uppercase tracking-wide">Trades</p>
          <p className="text-base font-bold mt-1">{stats.count}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-5 pt-5">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="text-[10px] text-white/40 text-center font-medium">{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-white/40" /></div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, idx) => {
              if (!cell.date || !cell.iso) {
                return <div key={idx} className="aspect-square" />;
              }
              const day = byDay.get(cell.iso);
              const isToday = cell.iso === today;
              const dayNum = cell.date.getDate();
              let cellCls = "bg-white/[0.03] border-white/5 hover:bg-white/5";
              let pnlCls = "text-white/40";
              if (day) {
                if (day.pnl > 0) {
                  cellCls = "bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25";
                  pnlCls = "text-emerald-300";
                } else if (day.pnl < 0) {
                  cellCls = "bg-red-500/15 border-red-500/30 hover:bg-red-500/25";
                  pnlCls = "text-red-300";
                } else {
                  cellCls = "bg-white/10 border-white/20 hover:bg-white/15";
                  pnlCls = "text-white/70";
                }
              }
              return (
                <button
                  key={idx}
                  onClick={() => openDay(cell.iso!)}
                  className={`aspect-square rounded-lg border ${cellCls} flex flex-col items-center justify-center p-1 transition-colors relative ${isToday ? "ring-1 ring-amber-400" : ""}`}
                >
                  <span className="text-[11px] font-semibold leading-none">{dayNum}</span>
                  {day && (
                    <>
                      <span className={`text-[9px] font-bold mt-1 leading-none ${pnlCls}`}>
                        {day.pnl >= 0 ? "+" : "-"}${Math.abs(day.pnl).toFixed(0)}
                      </span>
                      <span className="text-[8px] text-white/40 mt-0.5 leading-none">{day.count}t</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Highlights */}
      {(stats.best || stats.worst) && stats.count > 0 && (
        <div className="px-5 pt-5 grid grid-cols-2 gap-2">
          {stats.best && stats.best.pnl > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
              <p className="text-[10px] text-emerald-300/70 uppercase tracking-wide flex items-center gap-1"><TrendingUp className="w-3 h-3" />Best Day</p>
              <p className="text-sm font-bold text-emerald-300 mt-1">{fmtMoney(stats.best.pnl)}</p>
              <p className="text-[10px] text-white/40">{new Date(stats.best.date + "T00:00:00").toLocaleDateString()}</p>
            </div>
          )}
          {stats.worst && stats.worst.pnl < 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
              <p className="text-[10px] text-red-300/70 uppercase tracking-wide flex items-center gap-1"><TrendingDown className="w-3 h-3" />Worst Day</p>
              <p className="text-sm font-bold text-red-300 mt-1">{fmtMoney(stats.worst.pnl)}</p>
              <p className="text-[10px] text-white/40">{new Date(stats.worst.date + "T00:00:00").toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )}

      {/* Floating Add */}
      <button
        onClick={() => { setSelectedDate(today); setEditing(null); setEntryOpen(true); }}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-amber-400 text-black shadow-lg shadow-amber-500/30 flex items-center justify-center hover:bg-amber-300"
        aria-label="Log new trade"
      >
        <Plus className="w-6 h-6" />
      </button>

      <div className="flex-1 pb-6" />
      <BottomNav />

      {/* Day modal */}
      <Dialog open={dayOpen} onOpenChange={setDayOpen}>
        <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : ""}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {dayEntries.length === 0 ? "No trades logged." : `${dayEntries.length} trade${dayEntries.length > 1 ? "s" : ""}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {dayEntries.map((e) => (
              <button
                key={e.id}
                onClick={() => { setEditing(e); setDayOpen(false); setEntryOpen(true); }}
                className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-3 py-2.5 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{e.instrument}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${e.direction === "buy" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                      {e.direction.toUpperCase()}
                    </span>
                  </div>
                  {e.strategy && <p className="text-[10px] text-white/40 mt-0.5">{e.strategy}</p>}
                </div>
                <p className={`text-sm font-bold shrink-0 ${e.pnl_amount > 0 ? "text-emerald-300" : e.pnl_amount < 0 ? "text-red-300" : "text-white/70"}`}>
                  {fmtMoney(Number(e.pnl_amount))}
                </p>
              </button>
            ))}
            <Button
              onClick={() => { setEditing(null); setDayOpen(false); setEntryOpen(true); }}
              className="w-full bg-amber-400 text-black hover:bg-amber-300 mt-2"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Trade
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Entry modal */}
      {selectedDate && (
        <TradeEntryModal
          open={entryOpen}
          onOpenChange={setEntryOpen}
          date={selectedDate}
          entry={editing}
          onSaved={reload}
        />
      )}
    </div>
  );
};

export default Journal;
