import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="w-full px-6 py-20 bg-background">
      <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-elevated to-surface border border-primary/20 p-10 md:p-14">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-glow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight tracking-tight">
              Start smarter trading today
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Fund, manage and grow your trading from one powerful platform.
            </p>
          </div>
          <Link to="/signup" className="shrink-0">
            <Button
              size="lg"
              className="px-10 py-6 text-base font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow gap-2"
            >
              Sign up for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
