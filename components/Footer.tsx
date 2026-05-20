import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111113] border-t border-white/[0.05] px-6 pt-14 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.5" fill="white"/>
                  <rect x="7" y="0.5" width="4.5" height="4.5" rx="0.5" fill="white" opacity="0.5"/>
                  <rect x="0.5" y="7" width="4.5" height="4.5" rx="0.5" fill="white" opacity="0.5"/>
                  <rect x="7" y="7" width="4.5" height="4.5" rx="0.5" fill="white" opacity="0.25"/>
                </svg>
              </div>
              <span className="text-white font-normal text-[14px] tracking-wide">VaultX</span>
            </Link>
            <p className="text-[12px] font-light text-zinc-600 leading-relaxed max-w-[180px]">
              Professional crypto asset management.
            </p>
          </div>

          {[
            {
              head: "Platform",
              links: [
                { href: "/#features", label: "Features" },
                { href: "/#pricing",  label: "Pricing" },
                { href: "/signup",    label: "Open Account" },
                { href: "/login",     label: "Log In" },
              ],
            },
            {
              head: "Support",
              links: [
                { href: "/#faq",               label: "FAQ" },
                { href: "mailto:admin@vaultx.io", label: "Email us" },
              ],
            },
            {
              head: "Legal",
              links: [
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ],
            },
          ].map((col) => (
            <div key={col.head}>
              <p className="text-[10px] font-normal tracking-widest text-zinc-700 uppercase mb-4">{col.head}</p>
              <ul className="space-y-2.5">
                {col.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-[12px] font-light text-zinc-600 hover:text-zinc-300 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.04] pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-light text-zinc-700">
          <p>&copy; {new Date().getFullYear()} VaultX. All rights reserved.</p>
          <p>Not financial advice · Crypto carries risk</p>
        </div>
      </div>
    </footer>
  );
}
