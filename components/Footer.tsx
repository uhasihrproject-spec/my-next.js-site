"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useAuthUser } from "./useAuthUser";

interface FooterLink { href: string; label: string }

export default function Footer() {
  const { user, loaded } = useAuthUser();
  const signedIn = loaded && !!user;
  const homeHref = signedIn ? (user!.role === "admin" ? "/admin" : "/dashboard") : "/";

  // Platform column — switches out the signed-out CTAs for in-app links.
  const platformLinks: FooterLink[] = [
    { href: "/#features", label: "Features" },
    { href: "/#assets",   label: "Assets" },
    { href: "/#pricing",  label: "Pricing" },
    ...(signedIn
      ? user!.role === "admin"
        ? [{ href: "/admin",     label: "Admin panel" }]
        : [
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard#deposit",  label: "Deposit" },
            { href: "/dashboard#withdraw", label: "Withdraw" },
          ]
      : [
          { href: "/signup", label: "Open account" },
          { href: "/login",  label: "Log in" },
        ]),
  ];

  const columns: { head: string; links: FooterLink[] }[] = [
    { head: "Platform", links: platformLinks },
    { head: "Support", links: [
      { href: "/#faq",                 label: "FAQ" },
      { href: "mailto:admin@vaultx.io", label: "Email us" },
    ] },
    { head: "Legal", links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms",   label: "Terms" },
    ] },
  ];

  return (
    <footer className="bg-[#111113] border-t border-white/[0.05] px-6 pt-14 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          <div className="lg:col-span-1">
            <Link href={homeHref} className="inline-flex items-center mb-4">
              <Logo size={24} withWord wordSize={14} wordClassName="text-white" gap={10} />
            </Link>
            <p className="text-[12px] font-light text-zinc-600 leading-relaxed max-w-[180px]">
              {signedIn
                ? `Welcome back, ${user!.name.split(" ")[0]}. Your vault is live.`
                : "Professional crypto asset management."}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.head}>
              <p className="text-[10px] font-normal tracking-widest text-zinc-700 uppercase mb-4">{col.head}</p>
              <ul className="space-y-2.5">
                {col.links.map(({ href, label }) => (
                  <li key={href + label}>
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
          <p>&copy; 2015 - {new Date().getFullYear()} VaultX. All rights reserved.</p>
          <p>Not financial advice · Crypto carries risk</p>
        </div>
      </div>
    </footer>
  );
}
