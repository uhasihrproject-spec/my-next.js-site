import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeTransition from "@/components/ThemeTransition";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VaultX — Earn on Your Crypto",
  description: "Deposit your crypto, earn consistent returns through expert trading, and withdraw when your lock-up period ends.",
};

// Runs before paint to set data-theme — prevents the flash of wrong theme.
const themeInit = `(function(){try{
  var k=localStorage.getItem('vaultx_theme')||'system';
  var r=k==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):k;
  document.documentElement.setAttribute('data-theme',r);
  document.documentElement.style.colorScheme=r;
}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <ThemeTransition />
        </ThemeProvider>
      </body>
    </html>
  );
}
