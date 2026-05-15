import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact — VaultX",
  description: "Get in touch with the VaultX team. Support, partnerships, or general questions — we're here to help.",
};

export default function ContactPage() {
  return (
    <main className="bg-[#161618] min-h-screen text-white">
      <Navbar />
      <div className="pt-14">
        {/* Page header */}
        <div className="max-w-5xl mx-auto px-5 pt-20 pb-8 text-center">
          <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Support</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Get in touch<br />
            <span className="text-blue-500">we&apos;re here to help</span>
          </h1>
          <p className="text-zinc-500 text-base max-w-lg mx-auto leading-relaxed">
            Questions about deposits, withdrawals, or your account? Reach the VaultX team and we&apos;ll get back to you fast.
          </p>
        </div>

        <ContactForm />
      </div>
      <Footer />
      <ChatWidget />
    </main>
  );
}
