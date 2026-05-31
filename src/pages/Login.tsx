import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) { setForm((p) => ({ ...p, email: saved })); setRemember(true); }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!form.email || !form.password) {
      toast({ title: "Missing information", description: "Email and password are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (error) { toast({ title: "Login failed", description: error.message, variant: "destructive" }); return; }
    if (remember) localStorage.setItem(REMEMBER_KEY, form.email); else localStorage.removeItem(REMEMBER_KEY);
    toast({ title: "Welcome back" });
    navigate("/dashboard");
  };

  const handleForgot = async () => {
    if (!forgotEmail) { toast({ title: "Enter your email", variant: "destructive" }); return; }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: `${window.location.origin}/reset-password` });
    setForgotLoading(false);
    if (error) { toast({ title: "Couldn't send email", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Check your email", description: "We sent you a link to reset your password." });
    setForgotOpen(false); setForgotEmail("");
  };

  const oauthSoon = (provider: string) =>
    toast({ title: `${provider} sign-in coming soon`, description: "Your backend developer will wire this up." });

  return (
    <div className="min-h-[100dvh] bg-[hsl(220,40%,7%)] text-white flex flex-col px-5 py-8">
      <div className="flex flex-col items-center mb-6">
        <img src={logo} alt="PremiumX" className="w-16 h-16 rounded-2xl" />
        <p className="text-sm text-white/60 mt-2">Welcome back</p>
      </div>

      <div className="w-full max-w-md mx-auto bg-[hsl(220,30%,10%)] border border-white/5 rounded-2xl p-5">
        {/* Tabs */}
        <div className="grid grid-cols-2 bg-[hsl(220,30%,7%)] rounded-xl p-1 mb-5 border border-white/5">
          <button className="py-2.5 rounded-lg text-sm font-semibold bg-[hsl(220,30%,16%)] text-white">Login</button>
          <button onClick={() => navigate("/signup")} className="py-2.5 rounded-lg text-sm font-medium text-white/50">Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/70 mb-1.5 block">Email or Username</label>
            <Input
              type="email"
              placeholder="daniel@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 mb-1.5 block">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white pr-12"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setRemember((v) => !v)} className="flex items-center gap-2">
              <span className={`relative w-10 h-5 rounded-full transition-colors ${remember ? "bg-amber-500" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${remember ? "translate-x-5" : "translate-x-0.5"}`} />
              </span>
              <span className="text-xs text-white/70">Remember me</span>
            </button>
            <button type="button" onClick={() => { setForgotEmail(form.email); setForgotOpen(true); }} className="text-xs font-medium text-amber-400 hover:underline">
              Forgot password?
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[hsl(220,30%,14%)] hover:bg-[hsl(220,30%,18%)] border border-white/10 text-white font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>Login <ArrowRight className="w-4 h-4 ml-1.5" /></>)}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-white/50">or continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => oauthSoon("Google")} className="h-11 rounded-xl bg-[hsl(220,30%,14%)] border border-white/10 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[hsl(220,30%,18%)]">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Google
          </button>
          <button onClick={() => oauthSoon("Apple")} className="h-11 rounded-xl bg-[hsl(220,30%,14%)] border border-white/10 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[hsl(220,30%,18%)]">
            <svg width="16" height="18" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.6 84.4c30.3-36 27.6-68.8 26.7-80.4-26.8 1.6-57.8 18.3-75.5 38.9-19.4 22-30.8 49.2-28.4 79.8 29.0 2.2 55.5-12.7 77.2-38.3z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-white/60 mt-5">
        Don't have an account? <Link to="/signup" className="text-amber-400 font-medium hover:underline">Sign up free</Link>
      </p>

      <div className="flex justify-center mt-4">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(220,30%,12%)] border border-white/10 text-sm text-white/80 hover:bg-[hsl(220,30%,16%)]">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Reset your password</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter your email and we'll send you a reset link.
            </DialogDescription>
          </DialogHeader>
          <Input type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)} className="bg-transparent border-white/15 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={handleForgot} disabled={forgotLoading} className="bg-amber-500 hover:bg-amber-400 text-black">
              {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
