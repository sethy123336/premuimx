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
              A unified platform for traders to fund Deriv accounts, manage crypto assets, access AI insights, and track performance in one place.
            </p>
          </div>

          {/* Resources */}
          <div className="md:border-l md:border-border md:pl-12">
            <h3 className="text-muted-foreground font-semibold text-xs uppercase tracking-widest mb-4">Resources</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Link to="/privacy-policy" className="text-foreground text-sm hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="text-foreground text-sm hover:text-primary transition-colors">Terms & Conditions</Link>
            </div>
          </div>

          {/* Contact Us */}
          <div className="md:border-l md:border-border md:pl-12">
            <h3 className="text-muted-foreground font-semibold text-xs uppercase tracking-widest mb-5">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@premiumx.com" className="flex items-center gap-3 group">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </span>
                  <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">support@premiumx.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </span>
                  <span className="text-muted-foreground text-sm">Abuja, Nigeria</span>
                </div>
              </li>
              <li>
                <a href="tel:+2348000000000" className="flex items-center gap-3 group">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </span>
                  <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">+234 800 000 0000</span>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Follow on X" className="flex items-center gap-3 group">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary text-sm">𝕏</span>
                  <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">Follow on X</span>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Follow on Instagram" className="flex items-center gap-3 group">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4 text-primary" />
                  </span>
                  <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">Follow on Instagram</span>
                </a>
              </li>
            </ul>
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
