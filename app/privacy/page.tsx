import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "Privacy Policy — VaultX",
  description: "How VaultX collects, uses, and protects your personal information.",
};

const SECTIONS: { h: string; p: string }[] = [
  { h: "1. Information we collect", p: "We collect the details you provide at sign-up — name, email, phone number, country, and date of birth — along with deposit and withdrawal activity needed to operate your account." },
  { h: "2. Identity & liveness data", p: "The facial liveness check runs in your browser to confirm you are a real person. Camera footage is processed on your device and is not uploaded or stored by VaultX." },
  { h: "3. How we use your data", p: "Your information is used to operate your account, verify your identity, process transactions, prevent fraud, and provide support. We do not sell your personal data." },
  { h: "4. Security", p: "Data is encrypted in transit (TLS) and at rest. Passwords and PINs are stored only as one-way hashes. The majority of client funds are held in cold storage." },
  { h: "5. Cookies & sessions", p: "We use a secure, httpOnly session cookie to keep you signed in. We do not use third-party advertising trackers." },
  { h: "6. Data sharing", p: "We share data only with service providers necessary to run VaultX (e.g. SMS delivery) and where required by law." },
  { h: "7. Your rights", p: "You may request access to, correction of, or deletion of your personal data by contacting support, subject to legal and regulatory retention requirements." },
  { h: "8. Retention", p: "We retain account data for as long as your account is active and for any period required by applicable law after closure." },
  { h: "9. Contact", p: "Privacy questions can be sent to privacy@vaultx.com." },
];

export default function PrivacyPage() {
  return (
    <main className="bg-[#161618] min-h-screen text-white">
      <Navbar />
      <div className="pt-14">
        <div className="max-w-3xl mx-auto px-5 pt-20 pb-6">
          <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="max-w-3xl mx-auto px-5 pb-20 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold text-white mb-2">{s.h}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </main>
  );
}
