import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <img src={logo} alt="PremiumX" className="w-8 h-8 rounded-lg" />
        <span className="text-xl font-bold text-foreground tracking-tight">premiumX</span>
      </div>

      <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Products</a>
        <a href="#" className="hover:text-foreground transition-colors">Company</a>
        <a href="#" className="hover:text-foreground transition-colors">Support</a>
        <Link to="/signup" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors">Get Started</Link>
      </div>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 md:hidden z-50">
          <a href="#" className="text-foreground font-medium">Products</a>
          <a href="#" className="text-foreground font-medium">Company</a>
          <a href="#" className="text-foreground font-medium">Support</a>
          <Link to="/signup" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-center font-medium">Get Started</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
