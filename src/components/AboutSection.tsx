const AboutSection = () => {
  return (
    <section id="about" className="w-full px-6 py-24 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">About</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
          One platform. Every move.
        </h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
          PremiumX brings funding, crypto, AI insights and trade tracking into a single dashboard built for serious traders.
        </p>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          No more juggling exchanges, brokers and bank apps — manage your trading life from one place.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
