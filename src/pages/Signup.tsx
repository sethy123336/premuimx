import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { COUNTRIES, Country, DEFAULT_COUNTRY, detectCountry } from "@/lib/countries";

type Step = 1 | 2 | 3;

const passwordStrength = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s; // 0..4
};

const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["bg-white/10", "bg-red-500", "bg-amber-500", "bg-amber-400", "bg-emerald-500"];

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "", confirm: "" });

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendIn, setResendIn] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { detectCountry().then((c) => c && setCountry(c)); }, []);

  useEffect(() => {
    if (step !== 3) return;
    setResendIn(60);
    const id = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  const goStep1 = () => {
    if (!form.username.trim()) return toast({ title: "Enter a username", variant: "destructive" });
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast({ title: "Enter a valid email", variant: "destructive" });
    if (!form.phone.trim()) return toast({ title: "Enter your phone number", variant: "destructive" });
    setStep(2);
  };

  const goStep2 = () => {
    if (form.password.length < 8) return toast({ title: "Password too short", description: "Min 8 characters.", variant: "destructive" });
    if (form.password !== form.confirm) return toast({ title: "Passwords don't match", variant: "destructive" });
    setStep(3);
  };

  const handleOtpChange = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    setOtp((arr) => { const next = [...arr]; next[i] = ch; return next; });
    if (ch && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleCreate = async () => {
    if (otp.join("").length !== 6) return toast({ title: "Enter the 6-digit OTP", variant: "destructive" });
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          username: form.username,
          phone: `${country.dialCode}${form.phone.replace(/^0+/, "")}`,
          country: country.name,
          country_code: country.code,
          currency: country.currency,
        },
      },
    });
    setLoading(false);
    if (error) return toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    toast({ title: "Account created", description: "Welcome to PremiumX!" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] bg-[hsl(220,40%,7%)] text-white flex flex-col px-5 py-8">
      <div className="text-center mb-5">
        <h1 className="text-3xl font-extrabold text-amber-400 tracking-tight">PremiumX</h1>
        <p className="text-sm text-white/60 mt-1">Create your account</p>
        <div className="flex justify-center gap-1.5 mt-3">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-1 w-10 rounded-full ${n <= step ? "bg-amber-500" : "bg-white/15"}`} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md mx-auto bg-[hsl(220,30%,10%)] border border-white/5 rounded-2xl p-5">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold">Personal info</h2>

            <div>
              <label className="text-xs text-white/70 mb-1.5 block">Username</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="daniel_fx" maxLength={30} className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white" />
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1.5 block">Email Address</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="daniel@example.com" className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white" />
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1.5 block">Country</label>
              <Select value={country.code} onValueChange={(code) => setCountry(COUNTRIES.find((c) => c.code === code) ?? country)}>
                <SelectTrigger className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">{country.code}</span>
                      <span>{country.name} — {country.currency} auto-set</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[hsl(220,30%,12%)] border-white/10 text-white max-h-72">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag ?? c.code} {c.name} ({c.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1.5 block">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 h-12 rounded-xl bg-[hsl(220,30%,14%)] border border-white/10 text-sm font-medium">
                  {country.dialCode}
                </div>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} placeholder="0801 234 5678" inputMode="numeric" maxLength={15} className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white flex-1" />
              </div>
            </div>

            <Button onClick={goStep1} className="w-full h-12 rounded-xl bg-[hsl(220,30%,14%)] hover:bg-[hsl(220,30%,18%)] border border-white/10 text-white font-semibold">
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold">Set your password</h2>

            <div>
              <label className="text-xs text-white/70 mb-1.5 block">Password</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white" />
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1.5 block">Confirm Password</label>
              <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Re-enter password" className="h-12 rounded-xl bg-[hsl(220,30%,14%)] border-white/10 text-white" />
            </div>

            <div className="rounded-xl bg-[hsl(220,30%,14%)] border border-white/5 p-3">
              <p className="text-xs text-white/70 mb-2">Password strength</p>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full ${strengthColor[strength]} transition-all`} style={{ width: `${(strength / 4) * 100}%` }} />
              </div>
              <p className={`text-xs mt-1.5 font-semibold ${strength >= 3 ? "text-emerald-400" : strength === 2 ? "text-amber-400" : "text-red-400"}`}>
                {form.password ? strengthLabel[strength] : ""}
              </p>
            </div>

            <Button onClick={goStep2} className="w-full h-12 rounded-xl bg-[hsl(220,30%,14%)] hover:bg-[hsl(220,30%,18%)] border border-white/10 text-white font-semibold">
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button onClick={() => setStep(1)} variant="outline" className="w-full h-12 rounded-xl bg-transparent hover:bg-white/5 border-white/10 text-white font-semibold">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <h2 className="text-base font-bold">Verify your email</h2>
            <p className="text-xs text-white/60">A 6-digit OTP was sent to {form.email}</p>

            <div className="flex justify-center gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-11 h-12 rounded-xl bg-[hsl(220,30%,14%)] border border-white/10 text-center text-lg font-bold text-white outline-none focus:border-amber-500"
                />
              ))}
            </div>

            <Button onClick={handleCreate} disabled={loading} className="w-full h-12 rounded-xl bg-[hsl(220,30%,14%)] hover:bg-[hsl(220,30%,18%)] border border-white/10 text-white font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Check className="w-4 h-4 mr-1.5" /> Create Account</>)}
            </Button>

            <p className="text-xs text-white/60">
              {resendIn > 0 ? (
                <>Resend OTP in <span className="text-amber-400 font-semibold">0:{String(resendIn).padStart(2, "0")}</span></>
              ) : (
                <button onClick={() => { setResendIn(60); toast({ title: "OTP resent" }); }} className="text-amber-400 font-semibold hover:underline">Resend OTP</button>
              )}
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-white/60 mt-5">
        Already have an account? <Link to="/login" className="text-amber-400 font-medium hover:underline">Log in</Link>
      </p>

      <div className="flex justify-center mt-4">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(220,30%,12%)] border border-white/10 text-sm text-white/80 hover:bg-[hsl(220,30%,16%)]">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    </div>
  );
};

export default Signup;
