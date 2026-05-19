import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });

  // Supabase puts the recovery token in the URL hash. The client picks it up
  // automatically and fires a PASSWORD_RECOVERY event — we just wait for it.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery") && !hash.includes("access_token")) {
      // Allow direct visit anyway — they may already have an active session
      setReady(true);
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Fallback in case the event already fired
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (form.password.length < 8) {
      toast({ title: "Weak password", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: form.password });
    setLoading(false);

    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Password updated", description: "You're all set — log in to continue." });
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="PremiumX" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold text-foreground tracking-tight">PremiumX</span>
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2">Set a new password</h1>
          <p className="text-muted-foreground mb-8">
            Choose a strong password you haven't used before.
          </p>

          {!ready ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying reset link…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="New password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="h-14 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60 px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Input
                type={showPw ? "text" : "password"}
                placeholder="Confirm new password"
                value={form.confirm}
                onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                className="h-14 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60 px-4"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow"
                size="lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
