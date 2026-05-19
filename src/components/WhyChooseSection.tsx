import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Layers, Zap, Sparkles, ShieldCheck } from "lucide-react";

const benefits = [
  { icon: Layers, title: "All-in-One", description: "Funding, crypto, AI and tracking in one dashboard." },
  { icon: Zap, title: "Fast & Seamless", description: "Execute transactions without delays." },
  { icon: Sparkles, title: "Smart Insights", description: "AI guidance and analytics for better decisions." },
  { icon: ShieldCheck, title: "Full Control", description: "Track performance and stay in control." },
];

const WhyChooseSection = () => {
  return (
    <section id="why" className="relative w-full px-6 py-24 bg-surface overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Why PremiumX</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Built for traders who want clarity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-surface-elevated border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link to="/signup">
            <Button
              size="lg"
              className="px-10 py-6 text-base font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow"
            >
              Start Trading
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
