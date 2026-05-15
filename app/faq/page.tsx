import Navbar from "@/components/Navbar";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export const metadata = {
  title: "FAQ — VaultX",
  description: "Common questions about VaultX deposits, withdrawals, lock-up periods and more.",
};

export default function FAQPage() {
  return (
    <main className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-3xl mx-auto px-5 pt-16 pb-4">
          <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Help Center</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a href="mailto:admin@vaultx.com" className="text-blue-500 hover:text-blue-400 transition-colors">
              Email us
            </a>
          </p>
        </div>
        <FAQ />
      </div>
      <Footer />
    </main>
  );
}
