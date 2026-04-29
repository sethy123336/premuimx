import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Star, StarOff, Loader2, Trash2, Monitor, Clock, CheckCircle2, XCircle } from "lucide-react";
import { z } from "zod";
import BottomNav from "@/components/dashboard/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatWithSymbol, type Currency } from "@/lib/currency";

interface DerivAccount {
  id: string;
  cr_number: string;
  nickname: string | null;
  is_default: boolean;
}

interface WalletRow {
  id: string;
  currency: Currency;
  available_balance: number;
}

interface FundingRequest {
  id: string;
  amount: number;
  currency: Currency;
  cr_number: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  notes: string | null;
  created_at: string;
}

const FUNDABLE: Currency[] = ["USD", "USDT"];

const accountSchema = z.object({
  cr_number: z
    .string()
    .trim()
    .regex(/^CR\d{5,12}$/i, { message: "CR number must look like CR1234567" }),
  nickname: z.string().trim().max(40, "Nickname too long").optional(),
});

const fundSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").max(1_000_000, "Amount too large"),
  notes: z.string().trim().max(200, "Notes too long").optional(),
});

const StatusPill = ({ status }: { status: FundingRequest["status"] }) => {
  const map = {
    pending: { Icon: Clock, cls: "text-amber-300 bg-amber-500/10" },
    completed: { Icon: CheckCircle2, cls: "text-emerald-300 bg-emerald-500/10" },
    failed: { Icon: XCircle, cls: "text-red-300 bg-red-500/10" },
    cancelled: { Icon: XCircle, cls: "text-white/40 bg-white/5" },
  } as const;
  const { Icon, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
};

const FundDeriv = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<DerivAccount[]>([]);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [crInput, setCrInput] = useState("");
  const [nickInput, setNickInput] = useState("");
  const [savingAcct, setSavingAcct] = useState(false);

  const [fundOpen, setFundOpen] = useState(false);
  const [fundAccountId, setFundAccountId] = useState<string>("");
  const [fundCurrency, setFundCurrency] = useState<Currency>("USD");
  const [fundAmount, setFundAmount] = useState("");
  const [fundNotes, setFundNotes] = useState("");
  const [submittingFund, setSubmittingFund] = useState(false);

  const reload = async () => {
    if (!user) return;
    const [accRes, wRes, rRes] = await Promise.all([
      supabase.from("deriv_accounts").select("id,cr_number,nickname,is_default").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: true }),
      supabase.from("wallets").select("id,currency,available_balance").eq("user_id", user.id).in("currency", FUNDABLE),
      supabase.from("deriv_funding_requests").select("id,amount,currency,cr_number,status,notes,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    if (accRes.data) setAccounts(accRes.data as DerivAccount[]);
    if (wRes.data) setWallets(wRes.data as WalletRow[]);
    if (rRes.data) setRequests(rRes.data as FundingRequest[]);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      await reload();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const defaultAccount = useMemo(() => accounts.find((a) => a.is_default) ?? accounts[0], [accounts]);
  const sourceWallet = useMemo(() => wallets.find((w) => w.currency === fundCurrency), [wallets, fundCurrency]);

  const handleAddAccount = async () => {
    if (!user) return;
    const parsed = accountSchema.safeParse({ cr_number: crInput, nickname: nickInput || undefined });
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSavingAcct(true);
    const isFirst = accounts.length === 0;
    const { error } = await supabase.from("deriv_accounts").insert({
      user_id: user.id,
      cr_number: parsed.data.cr_number.toUpperCase(),
      nickname: parsed.data.nickname ?? null,
      is_default: isFirst,
    });
    setSavingAcct(false);
    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Account added" });
    setCrInput(""); setNickInput(""); setAddOpen(false);
    await reload();
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    // Clear all then set one
    await supabase.from("deriv_accounts").update({ is_default: false }).eq("user_id", user.id);
    const { error } = await supabase.from("deriv_accounts").update({ is_default: true }).eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    await reload();
  };

  const openFundModal = (accountId?: string) => {
    if (accounts.length === 0) {
      toast({ title: "Add a Deriv account first" });
      setAddOpen(true);
      return;
    }
    setFundAccountId(accountId ?? defaultAccount?.id ?? "");
    setFundCurrency("USD");
    setFundAmount("");
    setFundNotes("");
    setFundOpen(true);
  };

  const handleSubmitFunding = async () => {
    if (!user) return;
    const acct = accounts.find((a) => a.id === fundAccountId);
    if (!acct) { toast({ title: "Pick an account", variant: "destructive" }); return; }
    const wallet = wallets.find((w) => w.currency === fundCurrency);
    if (!wallet) { toast({ title: "Wallet not found", variant: "destructive" }); return; }

    const amt = Number(fundAmount);
    const parsed = fundSchema.safeParse({ amount: amt, notes: fundNotes || undefined });
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    if (amt > Number(wallet.available_balance)) {
      toast({ title: "Insufficient balance", description: `Available: ${formatWithSymbol(fundCurrency, Number(wallet.available_balance))}`, variant: "destructive" });
      return;
    }

    setSubmittingFund(true);
    // Debit wallet (available + balance) and create request + transaction
    const newAvail = Number(wallet.available_balance) - amt;
    const { error: wErr } = await supabase
      .from("wallets")
      .update({ available_balance: newAvail })
      .eq("id", wallet.id);
    if (wErr) {
      setSubmittingFund(false);
      toast({ title: "Failed to debit wallet", description: wErr.message, variant: "destructive" });
      return;
    }

    const { error: rErr } = await supabase.from("deriv_funding_requests").insert({
      user_id: user.id,
      deriv_account_id: acct.id,
      cr_number: acct.cr_number,
      source_wallet_id: wallet.id,
      currency: fundCurrency,
      amount: amt,
      notes: parsed.data.notes ?? null,
      status: "pending",
    });

    if (rErr) {
      // Rollback debit
      await supabase.from("wallets").update({ available_balance: Number(wallet.available_balance) }).eq("id", wallet.id);
      setSubmittingFund(false);
      toast({ title: "Failed", description: rErr.message, variant: "destructive" });
      return;
    }

    await supabase.from("transactions").insert({
      user_id: user.id,
      wallet_id: wallet.id,
      type: "deriv_funding",
      currency: fundCurrency,
      amount: amt,
      status: "pending",
      description: `Fund Deriv ${acct.cr_number}`,
      metadata: { cr_number: acct.cr_number, deriv_account_id: acct.id, notes: parsed.data.notes ?? null },
    });

    setSubmittingFund(false);
    setFundOpen(false);
    toast({ title: "Funding request submitted", description: "We'll process it shortly." });
    await reload();
  };

  return (
    <div className="min-h-screen bg-[hsl(220,40%,7%)] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => navigate("/dashboard")} className="text-white/70 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Fund Deriv</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-white/40" />
        </div>
      ) : (
        <>
          {/* Hero CTA */}
          <div className="px-5">
            <div className="bg-gradient-to-br from-amber-500/15 to-purple-500/10 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Fund a Deriv account</p>
                  <p className="text-xs text-white/50">Move USD or USDT to your CR account</p>
                </div>
              </div>
              <Button onClick={() => openFundModal()} className="w-full bg-amber-400 text-black hover:bg-amber-300">
                New Funding Request
              </Button>
            </div>
          </div>

          {/* Saved Accounts */}
          <div className="px-5 pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-semibold">Saved Deriv Accounts</p>
              <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-sm text-white/60">No Deriv accounts saved yet.</p>
                <Button variant="outline" size="sm" className="mt-3 border-white/20 text-white hover:bg-white/10" onClick={() => setAddOpen(true)}>
                  Add your first
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((a) => (
                  <div key={a.id} className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{a.cr_number}</p>
                        {a.is_default && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      {a.nickname && <p className="text-xs text-white/50 truncate">{a.nickname}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleSetDefault(a.id)} className="text-white/50 hover:text-amber-300" aria-label="Set default">
                        {a.is_default ? <Star className="w-4 h-4 fill-amber-300 text-amber-300" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-white/5 h-8" onClick={() => openFundModal(a.id)}>
                        Fund
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="px-5 pt-6 pb-4">
            <p className="text-base font-semibold mb-3">Recent Funding Requests</p>
            {requests.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-6">No requests yet.</p>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div key={r.id} className="bg-[hsl(220,30%,12%)] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{r.cr_number}</p>
                        <StatusPill status={r.status} />
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">{formatWithSymbol(r.currency, Number(r.amount))}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex-1" />
      <BottomNav />

      {/* Add account modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add Deriv Account</DialogTitle>
            <DialogDescription className="text-white/60">Save a CR account for quick funding.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs text-white/60">CR Number</Label>
              <Input value={crInput} onChange={(e) => setCrInput(e.target.value)} placeholder="CR1234567" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Nickname (optional)</Label>
              <Input value={nickInput} onChange={(e) => setNickInput(e.target.value)} placeholder="My main account" className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button onClick={handleAddAccount} disabled={savingAcct} className="w-full bg-amber-400 text-black hover:bg-amber-300">
              {savingAcct ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fund modal */}
      <Dialog open={fundOpen} onOpenChange={setFundOpen}>
        <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">New Funding Request</DialogTitle>
            <DialogDescription className="text-white/60">Move funds from your wallet to a Deriv CR account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs text-white/60">Deriv Account</Label>
              <Select value={fundAccountId} onValueChange={setFundAccountId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.cr_number}{a.nickname ? ` — ${a.nickname}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-white/60">Source Wallet</Label>
              <Select value={fundCurrency} onValueChange={(v) => setFundCurrency(v as Currency)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
                  {FUNDABLE.map((c) => {
                    const w = wallets.find((x) => x.currency === c);
                    return (
                      <SelectItem key={c} value={c}>
                        {c} — {formatWithSymbol(c, Number(w?.available_balance ?? 0))}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {sourceWallet && (
                <p className="text-[11px] text-white/40 mt-1">Available: {formatWithSymbol(fundCurrency, Number(sourceWallet.available_balance))}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-white/60">Amount</Label>
              <Input type="number" step="0.01" min="0" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Notes (optional)</Label>
              <Input value={fundNotes} onChange={(e) => setFundNotes(e.target.value)} maxLength={200} placeholder="e.g. trading capital" className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button onClick={handleSubmitFunding} disabled={submittingFund} className="w-full bg-amber-400 text-black hover:bg-amber-300">
              {submittingFund ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FundDeriv;
