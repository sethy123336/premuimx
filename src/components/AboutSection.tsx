const AboutSection = () => {
  return (
    <section id="about" className="w-full px-6 py-20 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          About PremiumX
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
          PremiumX is a unified platform built for traders to manage everything in one place — funding trading accounts, handling crypto assets, accessing AI insights and tracking performance.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          It removes the need for multiple tools by combining trading operations, payments and analysis into a single dashboard.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
