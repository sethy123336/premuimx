import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", href: "#top" },
  { label: "Wallets", href: "#wallets" },
  { label: "Brokerage Funding", href: "#funding" },
  { label: "PremiumX AI", href: "#ai" },
  { label: "Support", href: "#support" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="PremiumX" className="w-9 h-9 rounded-xl" />
          <span className="text-lg font-bold text-foreground tracking-tight">PremiumX</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-2"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-glow transition-colors shadow-glow"
          >
            Get Started
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-surface border-t border-border px-6 py-5 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-foreground/80 font-medium"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-3 border-t border-border">
            <Link
              to="/login"
              className="flex-1 text-center border border-border text-foreground px-4 py-2.5 rounded-full font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center bg-primary text-primary-foreground px-4 py-2.5 rounded-full font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
