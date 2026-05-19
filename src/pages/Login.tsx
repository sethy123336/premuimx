import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const REMEMBER_KEY = "premiumx_remember_email";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setForm((p) => ({ ...p, email: saved }));
      setRemember(true);
    }
  }, []);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!form.email || !form.password) {
      toast({ title: "Missing information", description: "Email and password are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }

    if (remember) localStorage.setItem(REMEMBER_KEY, form.email);
    else localStorage.removeItem(REMEMBER_KEY);

    toast({ title: "Welcome back" });
    navigate("/dashboard");
  };

  const handleForgot = async () => {
    if (!forgotEmail) {
      toast({ title: "Enter your email", variant: "destructive" });
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) {
      toast({ title: "Couldn't send email", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Check your email",
      description: "We sent you a link to reset your password.",
    });
    setForgotOpen(false);
    setForgotEmail("");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Log in to your PremiumX account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              placeholder="Email or Username"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-14 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60 px-4"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="h-14 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60 px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(form.email);
                  setForgotOpen(true);
                }}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow"
              size="lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="bg-surface-elevated border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter the email tied to your account and we'll send you a reset link.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="h-12 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setForgotOpen(false)}
              className="border-border bg-transparent hover:bg-surface text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgot}
              disabled={forgotLoading}
              className="bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
