import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import CTABanner from "@/components/CTABanner";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "Pricing — VaultX",
  description: "Simple, transparent pricing. See how VaultX plans and fees work — no hidden costs.",
};

export default function PricingPage() {
  return (
    <main className="bg-[#161618] min-h-screen text-white">
      <Navbar />
      <div className="pt-14">
        {/* Page header */}
        <div className="max-w-5xl mx-auto px-5 pt-20 pb-8 text-center">
          <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Plans &amp; Fees</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Simple, transparent<br />
            <span className="text-blue-500">pricing</span>
          </h1>
          <p className="text-zinc-500 text-base max-w-lg mx-auto leading-relaxed">
            No hidden fees, no surprises. Pick the plan that matches how you want to grow your crypto.
          </p>
        </div>

        <Pricing />
        <CTABanner />
        <FAQ />
      </div>
      <Footer />
      <ChatWidget />
    </main>
  );
}
