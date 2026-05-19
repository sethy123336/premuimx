import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import logo from "@/assets/logo.png";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    referral: "",
  });

  // Auto-detect country on mount
  useEffect(() => {
    detectCountry().then((c) => c && setCountry(c));
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!form.username || !form.email || !form.password) {
      toast({ title: "Missing information", description: "Username, email and password are required.", variant: "destructive" });
      return;
    }
    if (form.password.length < 8) {
      toast({ title: "Weak password", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirm) {
      toast({ title: "Passwords don't match", description: "Re-enter your password to confirm.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          username: form.username,
          phone: form.phone ? `${country.dialCode}${form.phone.replace(/^0+/, "")}` : null,
          referral_code: form.referral || null,
          country: country.name,
          country_code: country.code,
          currency: country.currency,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Check your email",
      description: "We sent a confirmation link to verify your account.",
    });
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Trade, fund and grow — your currency is set automatically.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Username"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="h-14 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60 px-4"
            />

            <Input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-14 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60 px-4"
            />

            {/* Country */}
            <Select value={country.code} onValueChange={(v) => {
              const c = COUNTRIES.find((x) => x.code === v);
              if (c) setCountry(c);
            }}>
              <SelectTrigger className="h-14 rounded-xl border-border bg-surface text-foreground px-4">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="text-base">{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                    <span className="text-xs text-muted-foreground">· {country.currency}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-surface-elevated border-border max-h-72">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-foreground">
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                      <span className="text-xs text-muted-foreground">· {c.currency}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Phone with country code */}
            <div className="flex items-center h-14 rounded-xl border border-border bg-surface overflow-hidden">
              <div className="flex items-center gap-2 pl-4 pr-3 border-r border-border shrink-0">
                <span className="text-base">{country.flag}</span>
                <span className="text-sm text-foreground font-medium">{country.dialCode}</span>
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="flex-1 h-full bg-transparent px-4 text-foreground placeholder:text-muted-foreground/60 outline-none text-sm"
              />
            </div>

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

            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                className="h-14 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60 px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Input
              placeholder="Referral Code (Optional)"
              value={form.referral}
              onChange={(e) => handleChange("referral", e.target.value)}
              className="h-14 rounded-xl border-border bg-surface text-foreground placeholder:text-muted-foreground/60 px-4"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl text-base font-semibold mt-2 bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow"
              size="lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
