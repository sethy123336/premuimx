import { Mail, MapPin, Phone, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="PremiumX" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold text-foreground tracking-tight">PremiumX</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              PremiumX is a unified platform for traders to fund Deriv accounts, manage crypto assets, access AI insights, and track performance in one place.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-foreground font-semibold text-base mb-4">Resources</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Link to="/privacy-policy" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Terms & Conditions</Link>
              
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-foreground font-semibold text-base mb-5">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">support@premiumx.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">Abuja, Nigeria</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">+234 800 000 0000</span>
              </div>
              <div className="pt-4 mt-2 border-t border-border flex items-center gap-3">
                <span className="text-muted-foreground text-sm">Follow</span>
                <a href="#" aria-label="X" className="w-9 h-9 rounded-lg border border-border bg-background/40 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-colors text-sm">𝕏</a>
                <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg border border-border bg-background/40 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center">
          <p className="text-muted-foreground text-sm">Copyright © 2026 PremiumX</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
