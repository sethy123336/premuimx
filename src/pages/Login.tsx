import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic will be added when Lovable Cloud is enabled
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">PremiumX</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-6 pb-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back 👋</h1>
          <p className="text-muted-foreground mb-8">Log in to your PremiumX account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-14 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground/60 px-4"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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

            <div className="text-right">
              <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-base font-semibold"
              size="lg"
            >
              Log In
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
    </div>
  );
};

export default Login;
