import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    referral: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!form.email || !form.password || !form.username) {
      toast({
        title: "Missing information",
        description: "Username, email and password are required.",
        variant: "destructive",
      });
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
          phone: form.phone,
          referral_code: form.referral,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Account created", description: "Welcome to PremiumX!" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="PremiumX" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold text-foreground tracking-tight">PremiumX</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-6 pb-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2">Get started ✌️</h1>
          <p className="text-muted-foreground mb-8">Fill out your information to get started</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              placeholder="Username"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="h-14 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground/60 px-4"
            />

            <Input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-14 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground/60 px-4"
            />

            <div className="flex items-center h-14 rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 pl-4 pr-3 border-r border-border shrink-0">
                <span className="text-base">🇳🇬</span>
                <span className="text-sm text-foreground font-medium">+234</span>
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
                placeholder="Create Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="h-14 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground/60 px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Input
              placeholder="Referral Code (Optional)"
              value={form.referral}
              onChange={(e) => handleChange("referral", e.target.value)}
              className="h-14 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground/60 px-4"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl text-base font-semibold mt-4"
              size="lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Next"}
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
