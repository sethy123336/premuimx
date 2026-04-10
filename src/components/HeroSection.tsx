import { Button } from "@/components/ui/button";
import phoneMockup from "@/assets/phone-mockup.png";
import { Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="w-full flex flex-col items-center px-6 pt-8 pb-16" style={{ background: "var(--hero-gradient)" }}>
      {/* Badge */}
      <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 mb-8 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center">
            <span className="text-background text-[10px] font-bold">A</span>
          </div>
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
            <span className="text-accent-foreground text-[10px] font-bold">▶</span>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium">4.6</span>
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm text-muted-foreground font-medium">and 2.2M+ downloads</span>
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center leading-tight max-w-3xl mb-6">
        PremiumX — The Smart Way to Move Value
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-muted-foreground text-center max-w-xl mb-10 leading-relaxed">
        Buy, sell, trade, and pay across crypto, cash, and digital assets all in one platform.
      </p>

      {/* CTA */}
      <Button variant="hero" size="lg" className="px-10 py-6 text-lg mb-16">
        Get Started
      </Button>

      {/* Phone Mockup */}
      <div className="relative w-full max-w-xs mx-auto">
        <img
          src={phoneMockup}
          alt="PremiumX app dashboard"
          width={512}
          height={800}
          className="w-full h-auto drop-shadow-2xl"
        />
      </div>
    </section>
  );
};

export default HeroSection;
