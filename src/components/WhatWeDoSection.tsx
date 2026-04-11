import { Wallet, Bitcoin, BrainCircuit, BarChart3 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

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
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {services.map((service) => (
              <CarouselItem
                key={service.title}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/2"
              >
                <div
                  className={`rounded-2xl border ${service.border} ${service.bg} p-10 flex flex-col items-center text-center h-48 justify-center transition-all duration-300`}
                >
                  <div className={`mb-5 ${service.iconColor}`}>
                    <service.icon size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">
                    {service.title}
                  </h3>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 md:-left-12" />
          <CarouselNext className="-right-4 md:-right-12" />
        </Carousel>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
