import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface TradeEntry {
  id: string;
  trade_date: string;
  instrument: string;
  direction: "buy" | "sell";
  entry_price: number | null;
  exit_price: number | null;
  position_size: number | null;
  pnl_amount: number;
  pnl_currency: string;
  outcome: "win" | "loss" | "breakeven";
  strategy: string | null;
  emotion_rating: number | null;
  notes: string | null;
  screenshot_url: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: string; // YYYY-MM-DD
  entry?: TradeEntry | null;
  onSaved: () => void;
}

const schema = z.object({
  instrument: z.string().trim().min(1, "Instrument is required").max(40),
  direction: z.enum(["buy", "sell"]),
  entry_price: z.number().nullable(),
  exit_price: z.number().nullable(),
  position_size: z.number().nullable(),
  pnl_amount: z.number(),
  pnl_currency: z.string().trim().min(1).max(8),
  strategy: z.string().trim().max(40).optional(),
  emotion_rating: z.number().int().min(1).max(5).nullable(),
  notes: z.string().trim().max(1000).optional(),
  screenshot_url: z.string().trim().url("Must be a valid URL").max(500).optional().or(z.literal("")),
});

const num = (v: string): number | null => {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const TradeEntryModal = ({ open, onOpenChange, date, entry, onSaved }: Props) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [instrument, setInstrument] = useState("");
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [size, setSize] = useState("");
  const [pnl, setPnl] = useState("");
  const [pnlCurrency, setPnlCurrency] = useState("USD");
  const [strategy, setStrategy] = useState("");
  const [emotion, setEmotion] = useState<string>("3");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState("");

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setInstrument(entry.instrument);
      setDirection(entry.direction);
      setEntryPrice(entry.entry_price?.toString() ?? "");
      setExitPrice(entry.exit_price?.toString() ?? "");
      setSize(entry.position_size?.toString() ?? "");
      setPnl(entry.pnl_amount.toString());
      setPnlCurrency(entry.pnl_currency);
      setStrategy(entry.strategy ?? "");
      setEmotion((entry.emotion_rating ?? 3).toString());
      setNotes(entry.notes ?? "");
      setScreenshot(entry.screenshot_url ?? "");
    } else {
      setInstrument(""); setDirection("buy"); setEntryPrice(""); setExitPrice("");
      setSize(""); setPnl(""); setPnlCurrency("USD"); setStrategy("");
      setEmotion("3"); setNotes(""); setScreenshot("");
    }
  }, [open, entry]);

  const handleSave = async () => {
    if (!user) return;
    const pnlNum = Number(pnl);
    if (!Number.isFinite(pnlNum)) { toast({ title: "P&L must be a number", variant: "destructive" }); return; }

    const parsed = schema.safeParse({
      instrument,
      direction,
      entry_price: num(entryPrice),
      exit_price: num(exitPrice),
      position_size: num(size),
      pnl_amount: pnlNum,
      pnl_currency: pnlCurrency,
      strategy: strategy || undefined,
      emotion_rating: emotion ? parseInt(emotion) : null,
      notes: notes || undefined,
      screenshot_url: screenshot || "",
    });
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }

    const outcome: "win" | "loss" | "breakeven" =
      pnlNum > 0 ? "win" : pnlNum < 0 ? "loss" : "breakeven";

    setSaving(true);
    const payload = {
      user_id: user.id,
      trade_date: date,
      instrument: parsed.data.instrument,
      direction: parsed.data.direction,
      entry_price: parsed.data.entry_price,
      exit_price: parsed.data.exit_price,
      position_size: parsed.data.position_size,
      pnl_amount: parsed.data.pnl_amount,
      pnl_currency: parsed.data.pnl_currency.toUpperCase(),
      outcome,
      strategy: parsed.data.strategy ?? null,
      emotion_rating: parsed.data.emotion_rating,
      notes: parsed.data.notes ?? null,
      screenshot_url: parsed.data.screenshot_url || null,
    };

    const res = entry
      ? await supabase.from("trade_journal_entries").update(payload).eq("id", entry.id)
      : await supabase.from("trade_journal_entries").insert(payload);

    setSaving(false);
    if (res.error) {
      toast({ title: "Failed", description: res.error.message, variant: "destructive" });
      return;
    }
    toast({ title: entry ? "Trade updated" : "Trade logged" });
    onSaved();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!entry) return;
    setDeleting(true);
    const { error } = await supabase.from("trade_journal_entries").delete().eq("id", entry.id);
    setDeleting(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Trade deleted" });
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{entry ? "Edit Trade" : "Log Trade"}</DialogTitle>
          <DialogDescription className="text-white/60">{new Date(date + "T00:00:00").toDateString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-white/60">Instrument</Label>
              <Input value={instrument} onChange={(e) => setInstrument(e.target.value)} placeholder="EUR/USD" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Direction</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as "buy" | "sell")}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-white/60">Entry</Label>
              <Input type="number" step="any" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Exit</Label>
              <Input type="number" step="any" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Size</Label>
              <Input type="number" step="any" value={size} onChange={(e) => setSize(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-white/60">P&amp;L</Label>
              <Input type="number" step="any" value={pnl} onChange={(e) => setPnl(e.target.value)} placeholder="e.g. 120 or -45" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Currency</Label>
              <Select value={pnlCurrency} onValueChange={setPnlCurrency}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  {["USD","USDT","NGN","EUR","GBP"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-white/60">Strategy / Setup</Label>
              <Input value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="Breakout" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Discipline (1-5)</Label>
              <Select value={emotion} onValueChange={setEmotion}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  {[1,2,3,4,5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-white/60">Screenshot URL (optional)</Label>
            <Input value={screenshot} onChange={(e) => setScreenshot(e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10 text-white" />
          </div>

          <div>
            <Label className="text-xs text-white/60">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={3} placeholder="What went right or wrong?" className="bg-white/5 border-white/10 text-white" />
          </div>

          <div className="flex gap-2 pt-1">
            {entry && (
              <Button variant="outline" onClick={handleDelete} disabled={deleting} className="border-red-500/30 text-red-300 hover:bg-red-500/10">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-amber-400 text-black hover:bg-amber-300">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : entry ? "Save Changes" : "Log Trade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeEntryModal;
