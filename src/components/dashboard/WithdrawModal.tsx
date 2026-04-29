import { useMemo, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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

interface WalletLite {
  id: string;
  currency: Currency;
  balance: number;
  available_balance: number;
}

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  wallets: WalletLite[];
  onCreated?: () => void;
}

const baseSchema = z.object({
  currency: z.enum(["NGN", "USD", "USDT"]),
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than zero"),
  destination: z
    .string()
    .trim()
    .min(4, "Destination is required")
    .max(120, "Destination too long"),
  accountName: z.string().trim().max(120).optional(),
  network: z.string().trim().max(40).optional(),
});

const formatBal = (c: Currency, v: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: c === "USDT" ? 2 : 2,
  }).format(v);

const WithdrawModal = ({ open, onOpenChange, userId, wallets, onCreated }: WithdrawModalProps) => {
  const available = useMemo(
    () => wallets.filter((w) => ["NGN", "USD", "USDT"].includes(w.currency)),
    [wallets],
  );
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [accountName, setAccountName] = useState("");
  const [network, setNetwork] = useState("TRC20");
  const [submitting, setSubmitting] = useState(false);

  const wallet = available.find((w) => w.currency === currency);
  const max = wallet?.available_balance ?? 0;

  const reset = () => {
    setAmount("");
    setDestination("");
    setAccountName("");
    setNetwork("TRC20");
    setCurrency("NGN");
    setSubmitting(false);
  };

  const destLabel = currency === "NGN" ? "Bank account number" : currency === "USD" ? "Bank / routing details" : "USDT wallet address";
  const destPlaceholder = currency === "NGN" ? "0123456789" : currency === "USD" ? "IBAN / routing + account" : "T... wallet address";

  const handleSubmit = async () => {
    const parsed = baseSchema.safeParse({
      currency,
      amount: Number(amount),
      destination,
      accountName: accountName || undefined,
      network: currency === "USDT" ? network : undefined,
    });
    if (!parsed.success) {
      toast({ title: "Check the form", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    if (!wallet) {
      toast({ title: "Wallet missing", description: `No ${currency} wallet found.`, variant: "destructive" });
      return;
    }
    if (parsed.data.amount > max) {
      toast({
        title: "Insufficient balance",
        description: `Available: ${formatBal(currency, max)} ${currency}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const reference = `WTH-${Date.now().toString(36).toUpperCase()}`;

    const newAvailable = Number((max - parsed.data.amount).toFixed(8));
    const { error: walletErr } = await supabase
      .from("wallets")
      .update({ available_balance: newAvailable })
      .eq("id", wallet.id)
      .eq("user_id", userId);

    if (walletErr) {
      setSubmitting(false);
      toast({ title: "Couldn't hold funds", description: walletErr.message, variant: "destructive" });
      return;
    }

    const { error: txErr } = await supabase.from("transactions").insert({
      user_id: userId,
      wallet_id: wallet.id,
      type: "withdrawal",
      currency,
      amount: parsed.data.amount,
      status: "pending",
      reference,
      description: `${currency} withdrawal to ${parsed.data.destination.slice(0, 6)}…`,
      metadata: {
        destination: parsed.data.destination,
        account_name: parsed.data.accountName ?? null,
        network: parsed.data.network ?? null,
      },
    });

    setSubmitting(false);

    if (txErr) {
      await supabase
        .from("wallets")
        .update({ available_balance: max })
        .eq("id", wallet.id)
        .eq("user_id", userId);
      toast({ title: "Couldn't create withdrawal", description: txErr.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Withdrawal requested",
      description: `${formatBal(currency, parsed.data.amount)} ${currency} held. Ref ${reference}.`,
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
          <DialogTitle className="text-white">Withdraw Funds</DialogTitle>
          <DialogDescription className="text-white/60">
            Funds are held immediately and released to your destination after review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-white/80">Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="bg-[hsl(220,40%,8%)] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                {(["NGN", "USD", "USDT"] as Currency[]).map((c) => {
                  const w = available.find((x) => x.currency === c);
                  return (
                    <SelectItem key={c} value={c}>
                      {c} — {formatBal(c, w?.available_balance ?? 0)} available
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="wamount" className="text-white/80">Amount</Label>
              <button
                type="button"
                onClick={() => setAmount(String(max))}
                className="text-xs text-amber-400 hover:underline"
              >
                Max: {formatBal(currency, max)}
              </button>
            </div>
            <Input
              id="wamount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[hsl(220,40%,8%)] border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dest" className="text-white/80">{destLabel}</Label>
            <Input
              id="dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={destPlaceholder}
              maxLength={120}
              className="bg-[hsl(220,40%,8%)] border-white/10 text-white font-mono text-sm"
            />
          </div>

          {currency !== "USDT" && (
            <div className="space-y-2">
              <Label htmlFor="acct" className="text-white/80">Account name</Label>
              <Input
                id="acct"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="John Doe"
                maxLength={120}
                className="bg-[hsl(220,40%,8%)] border-white/10 text-white"
              />
            </div>
          )}

          {currency === "USDT" && (
            <div className="space-y-2">
              <Label className="text-white/80">Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger className="bg-[hsl(220,40%,8%)] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  <SelectItem value="TRC20">TRC20 (Tron)</SelectItem>
                  <SelectItem value="ERC20">ERC20 (Ethereum)</SelectItem>
                  <SelectItem value="BEP20">BEP20 (BNB Smart Chain)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…
              </>
            ) : (
              "Request Withdrawal"
            )}
          </Button>
          <p className="text-xs text-white/40 text-center">
            You'll see a pending transaction. Funds release once approved.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
