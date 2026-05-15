import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/HowItWorks";
import FeatureShowcase from "@/components/FeatureShowcase";
import SecuritySection from "@/components/SecuritySection";
import Pricing from "@/components/Pricing";
import CTABanner from "@/components/CTABanner";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "Features — VaultX",
  description: "Discover how VaultX grows your crypto portfolio with professional trading, transparent tracking, and secure withdrawals.",
};

export default function FeaturesPage() {
  return (
    <main className="bg-[#161618] min-h-screen text-white">
      <Navbar />
      <div className="pt-14">
        {/* Page header */}
        <div className="max-w-5xl mx-auto px-5 pt-20 pb-8 text-center">
          <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Platform</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Everything you need<br />
            <span className="text-blue-500">to grow your crypto</span>
          </h1>
          <p className="text-zinc-500 text-base max-w-lg mx-auto leading-relaxed">
            From deposit to withdrawal, VaultX is built for investors who want results — not complexity.
          </p>
        </div>

        <HowItWorks />
        <FeatureShowcase />
        <SecuritySection />
        <Pricing />
        <CTABanner />
        <FAQ />
      </div>
      <Footer />
      <ChatWidget />
    </main>
  );
}
