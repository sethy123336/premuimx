import { Button } from "@/components/ui/button";
import phoneMockup from "@/assets/phone-mockup.png";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="top" className="relative w-full px-6 pt-12 pb-20 bg-hero-gradient overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-glow pointer-events-none opacity-60" />

      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start md:justify-between gap-12 md:gap-16">
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:pt-16 lg:pt-24 md:max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] mb-6 tracking-tight">
            Fund, Convert, Trade <span className="text-primary">& Grow with AI</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
            One platform for NGN, USD and crypto wallets, brokerage funding, and AI-powered market insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full px-8 py-6 text-base font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary-glow gap-2 shadow-glow">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full px-8 py-6 text-base font-semibold rounded-full border-border bg-surface text-foreground hover:bg-surface-elevated"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-sm md:max-w-md flex-shrink-0">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <img
            src={phoneMockup}
            alt="PremiumX dashboard preview"
            width={1024}
            height={1024}
            fetchPriority="high"
            className="relative w-full h-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
