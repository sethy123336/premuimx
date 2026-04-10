import { Wallet, Bitcoin, BrainCircuit, BarChart3 } from "lucide-react";

const services = [
  {
    icon: Wallet,
    title: "Fund Trading Accounts",
    bg: "bg-rose-50",
    border: "border-rose-200",
    iconColor: "text-rose-500",
  },
  {
    icon: Bitcoin,
    title: "Manage Crypto Assets",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    iconColor: "text-cyan-600",
  },
  {
    icon: BrainCircuit,
    title: "AI Trading Insights",
    bg: "bg-violet-50",
    border: "border-violet-200",
    iconColor: "text-violet-500",
  },
  {
    icon: BarChart3,
    title: "Track Trading Performance",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-500",
  },
];

const WhatWeDoSection = () => {
  return (
    <section id="services" className="w-full px-6 py-20 bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
          What We Do
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className={`group rounded-2xl border ${service.border} ${service.bg} p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-default`}
            >
              <div className={`mb-5 ${service.iconColor}`}>
                <service.icon size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-foreground leading-snug">
                {service.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
