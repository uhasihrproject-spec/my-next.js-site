import Navbar from "@/components/Navbar";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "FAQ — VaultX",
  description: "Answers to common questions about how VaultX works, deposits, withdrawals, and more.",
};

export default function FAQPage() {
  return (
    <main className="bg-[#050510] min-h-screen text-white">
      <Navbar />
      <div className="pt-24">
        <div className="text-center py-16 px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            Help Center
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Everything you need to know about depositing, earning, and withdrawing on VaultX.
          </p>
        </div>
        <FAQ />
      </div>
      <Footer />
      <ChatWidget />
    </main>
  );
}
