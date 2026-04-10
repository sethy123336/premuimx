import { Button } from "@/components/ui/button";
import phoneMockup from "@/assets/phone-mockup.png";
import { Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="w-full flex flex-col items-center px-6 pt-8 pb-16" style={{ background: "var(--hero-gradient)" }}>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center leading-tight max-w-3xl mb-6">
        The Smart Way to Move Value
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
      <div className="relative w-full max-w-sm md:max-w-md mx-auto">
        <img
          src={phoneMockup}
          alt="PremiumX app dashboard"
          width={1024}
          height={1024}
          className="w-full h-auto drop-shadow-2xl"
        />
      </div>
    </section>
  );
};

export default HeroSection;
