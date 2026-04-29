import { useEffect, useMemo, useState } from "react";
import { Loader2, ArrowDownUp, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Currency = "NGN" | "USD" | "USDT";
const CURRENCIES: Currency[] = ["NGN", "USD", "USDT"];

interface WalletLite {
  id: string;
  currency: Currency | string;
  available_balance: number;
}

interface ConvertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  wallets: WalletLite[];
  onCreated?: () => void;
}

const fmt = (v: number, max = 4) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: max }).format(v);

const ConvertModal = ({ open, onOpenChange, wallets, onCreated }: ConvertModalProps) => {
  const [from, setFrom] = useState<Currency>("NGN");
  const [to, setTo] = useState<Currency>("USD");
  const [amount, setAmount] = useState("");
  const [rates, setRates] = useState<{ NGN: number; USD: number; USDT: number } | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fromWallet = wallets.find((w) => w.currency === from);
  const max = fromWallet?.available_balance ?? 0;

  // Rates expressed as: 1 USD = X CURRENCY. USDT pegged 1:1 to USD.
  const fetchRates = async () => {
    setLoadingRates(true);
    try {
      const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=NGN");
      const json = await res.json();
      const ngn = Number(json?.rates?.NGN);
      if (!ngn || !isFinite(ngn)) throw new Error("Bad rate");
      setRates({ USD: 1, USDT: 1, NGN: ngn });
      setUpdatedAt(new Date());
    } catch {
      // Fallback so the modal stays usable
      setRates({ USD: 1, USDT: 1, NGN: 1600 });
      setUpdatedAt(new Date());
      toast({ title: "Using fallback rate", description: "Live FX unavailable, using approximate rate.", variant: "destructive" });
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchRates();
    const id = setInterval(fetchRates, 30_000);
    return () => clearInterval(id);
  }, [open]);

  const rate = useMemo(() => {
    if (!rates) return 0;
    // 1 unit of `from` in USD divided into 1 unit of `to` in USD
    const fromInUsd = 1 / rates[from];
    const toPerUsd = rates[to];
    return fromInUsd * toPerUsd;
  }, [rates, from, to]);

  const fromAmount = Number(amount) || 0;
  const toAmount = useMemo(() => (fromAmount > 0 && rate > 0 ? fromAmount * rate : 0), [fromAmount, rate]);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setAmount("");
  };

  const reset = () => {
    setAmount("");
    setSubmitting(false);
  };

  const handleSubmit = async () => {
    if (from === to) {
      toast({ title: "Pick different currencies", variant: "destructive" });
      return;
    }
    if (fromAmount <= 0) {
      toast({ title: "Enter an amount", variant: "destructive" });
      return;
    }
    if (fromAmount > max) {
      toast({ title: "Insufficient balance", description: `Available: ${fmt(max)} ${from}`, variant: "destructive" });
      return;
    }
    if (rate <= 0) {
      toast({ title: "No live rate", description: "Please wait for rates to load.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.rpc("convert_currency", {
      _from_currency: from,
      _to_currency: to,
      _from_amount: fromAmount,
      _rate: rate,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Conversion failed", description: error.message, variant: "destructive" });
      return;
    }

    const result = data as { reference?: string; to_amount?: number } | null;
    toast({
      title: "Conversion complete",
      description: `Converted ${fmt(fromAmount)} ${from} → ${fmt(result?.to_amount ?? toAmount)} ${to}`,
    });
    reset();
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Convert Currency</DialogTitle>
          <DialogDescription className="text-white/60">
            Swap between NGN, USD and USDT instantly at live rates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* From */}
          <div className="rounded-xl border border-white/10 bg-[hsl(220,40%,8%)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/60 text-xs">From</Label>
              <button
                type="button"
                onClick={() => setAmount(String(max))}
                className="text-xs text-amber-400 hover:underline"
              >
                Max: {fmt(max)} {from}
              </button>
            </div>
            <div className="flex gap-2">
              <Select value={from} onValueChange={(v) => setFrom(v as Currency)}>
                <SelectTrigger className="w-32 bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  {CURRENCIES.filter((c) => c !== to).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-[hsl(220,30%,12%)] border-white/10 text-white text-right text-lg font-semibold"
              />
            </div>
          </div>

          {/* Swap */}
          <div className="flex justify-center -my-1">
            <button
              type="button"
              onClick={swap}
              className="w-9 h-9 rounded-full bg-[hsl(220,30%,15%)] border border-white/10 flex items-center justify-center hover:bg-[hsl(220,30%,18%)] transition-colors"
            >
              <ArrowDownUp className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* To */}
          <div className="rounded-xl border border-white/10 bg-[hsl(220,40%,8%)] p-4 space-y-3">
            <Label className="text-white/60 text-xs">To (estimated)</Label>
            <div className="flex gap-2">
              <Select value={to} onValueChange={(v) => setTo(v as Currency)}>
                <SelectTrigger className="w-32 bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  {CURRENCIES.filter((c) => c !== from).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 flex items-center justify-end px-3 rounded-md bg-[hsl(220,30%,12%)] border border-white/10 text-lg font-semibold text-white/90">
                {toAmount > 0 ? fmt(toAmount) : "0.00"}
              </div>
            </div>
          </div>

          {/* Rate info */}
          <div className="flex items-center justify-between text-xs text-white/50 px-1">
            <span>
              {rate > 0 ? `1 ${from} ≈ ${fmt(rate, 6)} ${to}` : "Loading rate…"}
            </span>
            <button
              type="button"
              onClick={fetchRates}
              disabled={loadingRates}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${loadingRates ? "animate-spin" : ""}`} />
              {updatedAt ? updatedAt.toLocaleTimeString() : "Refresh"}
            </button>
          </div>

          <Button onClick={handleSubmit} disabled={submitting || rate <= 0} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting…
              </>
            ) : (
              "Convert Now"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertModal;
