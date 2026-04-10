import { Button } from "@/components/ui/button";
import phoneMockup from "@/assets/phone-mockup.png";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="w-full px-6 pt-8 pb-16" style={{ background: "var(--hero-gradient)" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start md:justify-between gap-10 md:gap-16">
        
        {/* Left: Text & CTA */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:pt-16 lg:pt-24 md:max-w-lg">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            The Smart Way to Move Value
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
            Buy, sell, trade, and pay across crypto, cash, and digital assets all in one platform.
          </p>
          <Link to="/signup">
            <Button variant="hero" size="lg" className="px-10 py-6 text-lg">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Right: Phone Mockup */}
        <div className="relative w-full max-w-sm md:max-w-md flex-shrink-0">
          <img
            src={phoneMockup}
            alt="PremiumX app dashboard"
            width={1024}
            height={1024}
            fetchPriority="high"
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
