import { useState } from "react";
import { z } from "zod";
import { Loader2, Copy, Check } from "lucide-react";
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

const BANK_DETAILS = {
  bank: "Providus Bank",
  accountName: "PremiumX Technologies Ltd",
  accountNumber: "1234567890",
};

const fundSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than zero")
    .max(50_000_000, "Amount too large"),
});

interface FundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  ngnWalletId?: string;
  onCreated?: () => void;
}

const FundModal = ({ open, onOpenChange, userId, ngnWalletId, onCreated }: FundModalProps) => {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setAmount("");
    setSubmitting(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmit = async () => {
    const parsed = fundSchema.safeParse({ amount: Number(amount) });
    if (!parsed.success) {
      toast({
        title: "Invalid amount",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const reference = `FUND-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase.from("transactions").insert({
      user_id: userId,
      wallet_id: ngnWalletId ?? null,
      type: "deposit",
      currency: "NGN",
      amount: parsed.data.amount,
      status: "pending",
      reference,
      description: `NGN bank deposit (${BANK_DETAILS.bank})`,
      metadata: {
        method: "bank_transfer",
        bank: BANK_DETAILS.bank,
        account_number: BANK_DETAILS.accountNumber,
      },
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Couldn't create deposit", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Deposit created",
      description: `Transfer ₦${parsed.data.amount.toLocaleString()} using reference ${reference}.`,
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
          <DialogTitle className="text-white">Fund NGN Wallet</DialogTitle>
          <DialogDescription className="text-white/60">
            Transfer to the account below, then log the deposit so we can confirm it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="rounded-xl border border-white/10 bg-[hsl(220,40%,8%)] p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Bank</span>
              <span className="font-medium">{BANK_DETAILS.bank}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Account name</span>
              <span className="font-medium">{BANK_DETAILS.accountName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/50">Account number</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 font-mono font-semibold hover:text-amber-400 transition-colors"
              >
                {BANK_DETAILS.accountNumber}
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white/80">
              Amount (NGN)
            </Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="10,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[hsl(220,40%,8%)] border-white/10 text-white"
            />
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging deposit…
              </>
            ) : (
              "I've made the transfer"
            )}
          </Button>
          <p className="text-xs text-white/40 text-center">
            Your wallet will be credited once we confirm the transfer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FundModal;
