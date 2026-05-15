import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PriceTicker from "@/components/PriceTicker";
import PlatformStats from "@/components/PlatformStats";
import HowItWorks from "@/components/HowItWorks";
import FeatureShowcase from "@/components/FeatureShowcase";
import SupportedCoins from "@/components/SupportedCoins";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTABanner from "@/components/CTABanner";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="bg-[#161618] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <PriceTicker />
      <PlatformStats />
      <HowItWorks />
      <FeatureShowcase />
      <SupportedCoins />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <FAQ />
      <Footer />
      <ChatWidget />
    </main>
  );
}
