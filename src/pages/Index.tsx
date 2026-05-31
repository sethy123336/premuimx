import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RatesStrip from "@/components/RatesStrip";
import AboutSection from "@/components/AboutSection";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import Reveal from "@/components/Reveal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <Reveal variant="fade" duration={600}><RatesStrip /></Reveal>
      <Reveal variant="fade-up"><AboutSection /></Reveal>
      <Reveal variant="blur-up" delay={80}><WhatWeDoSection /></Reveal>
      <Reveal variant="fade-up"><WhyChooseSection /></Reveal>
      <Reveal variant="scale"><FAQSection /></Reveal>
      <Reveal variant="fade-up"><CTABanner /></Reveal>
      <Reveal variant="fade"><Footer /></Reveal>
    </div>
  );
};

export default Index;
