import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTABanner = () => {
  return (
    <section className="w-full px-6 py-16 bg-secondary">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-3 leading-tight">
            Start Smarter Trading
          </h2>
          <p className="text-secondary-foreground/70 text-base md:text-lg leading-relaxed">
            Everything you need to fund, manage, and grow your trading in one powerful platform.
          </p>
        </div>
        <Link to="/signup" className="shrink-0">
          <Button
            size="lg"
            className="px-10 py-6 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
          >
            Sign up for free
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTABanner;
