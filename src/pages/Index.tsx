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
      <RatesStrip />
      <Reveal><AboutSection /></Reveal>
      <Reveal><WhatWeDoSection /></Reveal>
      <Reveal><WhyChooseSection /></Reveal>
      <Reveal><FAQSection /></Reveal>
      <Reveal><CTABanner /></Reveal>
      <Footer />
    </div>
  );
};

export default Index;
