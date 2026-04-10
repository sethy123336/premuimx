import phoneMockup from "@/assets/phone-mockup.png";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const WhyChooseSection = () => {
  return (
    <section className="w-full px-6 py-20 bg-secondary/30 relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left: Phone Mockups */}
        <div className="relative w-full max-w-lg flex-shrink-0 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
          {/* Back-left phone */}
          <div className="absolute left-0 top-8 w-[55%] z-0 opacity-90">
            <div className="rounded-[2rem] border-[6px] border-foreground/80 overflow-hidden shadow-xl bg-background">
              <img
                src={phoneMockup}
                alt="PremiumX crypto trading screen"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
          {/* Center phone (main) */}
          <div className="relative w-[60%] z-10">
            <div className="rounded-[2.5rem] border-[7px] border-foreground/90 overflow-hidden shadow-2xl bg-background">
              <img
                src={phoneMockup}
                alt="PremiumX app dashboard"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
          {/* Back-right phone */}
          <div className="absolute right-0 top-8 w-[55%] z-0 opacity-90">
            <div className="rounded-[2rem] border-[6px] border-foreground/80 overflow-hidden shadow-xl bg-background">
              <img
                src={phoneMockup}
                alt="PremiumX virtual cards screen"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Right: Text Content */}
        <div className="flex flex-col items-start max-w-xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-8 leading-tight">
            Why Choose<br />PremiumX?
          </h2>

          <div className="border-l-4 border-primary pl-6 space-y-4 mb-10">
            <div>
              <h3 className="font-semibold text-foreground text-lg">All-in-One Platform</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage funding, crypto, AI insights, and trade tracking in one place.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Fast & Seamless</h3>
              <p className="text-muted-foreground leading-relaxed">
                Execute transactions and manage assets without delays.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Smart Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Make better decisions with built-in AI guidance and analytics.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Full Control</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track performance, manage funds, and stay in control at all times.
              </p>
            </div>
          </div>

          <Link to="/signup">
            <Button variant="hero" size="lg" className="px-8 py-6 text-base gap-2 bg-primary">
              TRADE NOW <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-amber-400/40 via-amber-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default WhyChooseSection;
