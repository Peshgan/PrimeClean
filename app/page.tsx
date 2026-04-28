import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import StatsSection from "@/components/sections/StatsSection";

const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"));
const FAQSection = dynamic(() => import("@/components/sections/FAQSection"));
const BookingSection = dynamic(() => import("@/components/sections/BookingSection"));
const CalculatorSection = dynamic(() => import("@/components/sections/CalculatorSection"));

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <StatsSection />
      <CalculatorSection />
      <TestimonialsSection />
      <FAQSection />
      <BookingSection />
    </>
  );
}
