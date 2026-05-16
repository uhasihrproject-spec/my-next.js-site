import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "Terms of Service — VaultX",
  description: "The terms and conditions governing your use of the VaultX platform.",
};

const SECTIONS: { h: string; p: string }[] = [
  { h: "1. Acceptance of terms", p: "By creating an account or using VaultX, you agree to these Terms of Service. If you do not agree, do not use the platform." },
  { h: "2. Eligibility", p: "You must be at least 18 years old and legally able to enter into a binding contract to use VaultX. You are responsible for ensuring that using the platform is lawful in your jurisdiction." },
  { h: "3. Account & security", p: "You are responsible for safeguarding your password, 6-digit PIN, and any device used to access your account. Notify us immediately of any unauthorised access. VaultX will never ask for your password or PIN." },
  { h: "4. Identity verification", p: "We may require identity verification (KYC), phone verification, and a liveness check. Providing false information may result in account suspension." },
  { h: "5. Deposits & withdrawals", p: "Crypto deposits are credited after on-chain confirmation and review. Withdrawals may be subject to a lock-up period and are processed within 24–48 hours. Always send the correct asset to the correct address — on-chain transactions are irreversible." },
  { h: "6. Risk disclosure", p: "Crypto assets are volatile. Past performance does not guarantee future results. Never invest more than you can afford to lose. VaultX does not provide financial advice." },
  { h: "7. Prohibited use", p: "You may not use VaultX for money laundering, fraud, or any unlawful activity, or attempt to disrupt or gain unauthorised access to the platform." },
  { h: "8. Limitation of liability", p: "VaultX is provided “as is”. To the maximum extent permitted by law, we are not liable for indirect or consequential losses arising from your use of the platform." },
  { h: "9. Changes to these terms", p: "We may update these terms from time to time. Continued use of VaultX after changes take effect constitutes acceptance of the revised terms." },
  { h: "10. Contact", p: "Questions about these terms can be sent to support@vaultx.com." },
];

export default function TermsPage() {
  return (
    <main className="bg-[#161618] min-h-screen text-white">
      <Navbar />
      <div className="pt-14">
        <div className="max-w-3xl mx-auto px-5 pt-20 pb-6">
          <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">Terms of Service</h1>
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
