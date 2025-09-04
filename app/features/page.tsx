"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Instagram, Twitter, Linkedin, Github, MessageCircle, X, Send } from "lucide-react";

// Chat Widget
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    alert(`Message sent to owner: ${message}`);
    setMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <MessageCircle size={28} />
        </motion.button>
      )}
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-80 rounded-2xl border border-white/10 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-lg font-semibold text-white">Live Chat</h4>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="mt-3 h-40 overflow-y-auto rounded-lg bg-gray-800/50 p-3 text-sm text-gray-300">
            <p className="italic text-gray-500">You’re chatting with the site owner...</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg bg-gray-800/70 px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 text-white hover:opacity-90"
            >
              <Send size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Features data with PNG icons
const features = [
  { title: "Real-Time Market Data", description: "Track crypto prices live from multiple exchanges.", icon: "/icons/market.png" },
  { title: "Secure Wallet Integration", description: "Encrypted wallets, cold storage, and 2FA.", icon: "/icons/wallet.png" },
  { title: "Fast & Easy Transactions", description: "Send and receive crypto instantly.", icon: "/icons/transaction.png" },
  { title: "Portfolio Management", description: "Track investments with real-time P/L.", icon: "/icons/portfolio.png" },
  { title: "Advanced Trading Tools", description: "Professional trading tools and charts.", icon: "/icons/trading.png" },
  { title: "News & Insights", description: "Stay updated with crypto news and analysis.", icon: "/icons/news.png" },
];

// Testimonials
const testimonials = [
  { name: "Alice", feedback: "CryptoSite made trading so much easier.", avatar: "/avatars/alice.png" },
  { name: "Mark", feedback: "I trust CryptoSite for secure transactions.", avatar: "/avatars/mark.png" },
  { name: "Sara", feedback: "The live market data is top-notch!", avatar: "/avatars/sara.png" },
];

// FAQ
const faqs = [
  { q: "How secure is my wallet?", a: "Your wallet is encrypted, with optional 2FA." },
  { q: "Can I trade multiple cryptocurrencies?", a: "Yes, we support all major coins." },
  { q: "Are there fees for transactions?", a: "We offer low fees for all transactions." },
  { q: "Do you provide portfolio tracking?", a: "Yes, track your investments in real-time." },
];

export default function FeaturesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef });
  const yBlob1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const yBlob2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotateBlob = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <div className="bg-gray-950 text-white overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">CryptoSite</Link>
            <div className="hidden md:flex items-center space-x-8 text-white font-medium">
              {["Features","Stats","About","FAQ","Login"].map(link => (
                <Link key={link} href={`/${link.toLowerCase()}`} className={`transition-colors ${link==="Features" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"}`}>{link}</Link>
              ))}
              <Link href="/signup" className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:scale-105 transition-transform">Sign Up</Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none font-semibold">{isOpen ? "✕" : "☰"}</button>
            </div>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden px-6 pb-4 bg-black/30 backdrop-blur-md rounded-b-lg text-white space-y-3 transition-all duration-300">
            {["Features","Stats","About","FAQ","Login"].map(link => (
              <Link key={link} href={`/${link.toLowerCase()}`} className={`block ${link==="Features" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"}`}>{link}</Link>
            ))}
            <Link href="/signup" className="block px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:scale-105 transition-transform">Sign Up</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden px-6">
        <motion.div style={{ y: yBlob1, rotate: rotateBlob }} className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-screen opacity-20 blur-3xl animate-spin-slow" />
        <motion.div style={{ y: yBlob2, rotate: rotateBlob }} className="absolute w-72 h-72 bg-pink-500 rounded-full mix-blend-screen opacity-15 blur-2xl animate-spin-reverse" />
        <motion.h1 initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }} transition={{duration:1}} className="text-5xl md:text-6xl font-bold mb-6">Discover Powerful Crypto Features</motion.h1>
        <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{duration:1, delay:0.5}} className="text-gray-300 max-w-xl">Manage, track, and trade your crypto assets with ease. Our tools are secure, fast, and designed for every trader.</motion.p>
        <motion.a initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }} transition={{duration:0.8, delay:1}} href="/signup" className="mt-8 inline-block px-8 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:scale-105 animate-pulse">Get Started</motion.a>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Platform Features</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((f,i) => (
            <motion.div key={i} className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl cursor-pointer hover:scale-105 hover:shadow-xl"
              initial={{ opacity:0, y:50, scale:0.95 }}
              whileInView={{ opacity:1, y:0, scale:1 }}
              viewport={{ once:true }}
              transition={{ delay:i*0.2 }}
            >
              <motion.div whileHover={{ scale:1.2, rotate:5 }} className="w-12 h-12 mb-4">
                <Image src={f.icon} alt={f.title} width={48} height={48} />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 bg-gray-950 overflow-hidden">
        <motion.div className="absolute w-60 h-60 bg-blue-500 rounded-full mix-blend-screen opacity-10 blur-3xl top-0 left-0 animate-spin-slow"/>
        <motion.div className="absolute w-48 h-48 bg-pink-500 rounded-full mix-blend-screen opacity-10 blur-2xl bottom-0 right-0 animate-spin-reverse"/>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t,i)=>(
            <motion.div key={i} className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl hover:scale-105 hover:shadow-xl"
              initial={{ opacity:0, y:30 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ delay:i*0.2 }}
            >
              <div className="flex items-center mb-4 gap-3">
                <Image src={t.avatar} alt={t.name} width={40} height={40} className="rounded-full"/>
                <h4 className="font-semibold">{t.name}</h4>
              </div>
              <p className="text-gray-300 italic">"{t.feedback}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2 initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</motion.h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((f,i)=>(
            <motion.div key={i} className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl"
              initial={{ opacity:0, y:20 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ delay:i*0.2 }}
            >
              <h3 className="font-semibold mb-2">{f.q}</h3>
              <p className="text-gray-400">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mobile App Coming Soon */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.h2 initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:1 }}>📱 Mobile App Coming Soon!</motion.h2>
        <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:1, delay:0.3 }} className="text-gray-400 mt-4">
          Stay tuned for our upcoming mobile app to manage your crypto on the go.
        </motion.p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Subscribe to our Newsletter</h3>
            <p className="text-gray-400 mb-4">Get the latest updates, news, and crypto insights.</p>
            <form className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="flex-1 p-3 rounded-l-2xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <button className="bg-blue-500 hover:bg-blue-600 px-6 rounded-r-2xl transition-colors">Subscribe</button>
            </form>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
              <li className="hover:text-white transition-colors cursor-pointer">Features</li>
              <li className="hover:text-white transition-colors cursor-pointer">Live Stats</li>
              <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
              <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact & Social</h3>
            <p className="text-gray-400 mb-4">Email: <span className="text-white">support@crypto-site.com</span></p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-400 transition-colors"><Twitter /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Instagram /></a>
              <a href="#" className="hover:text-blue-600 transition-colors"><Linkedin /></a>
              <a href="#" className="hover:text-gray-400 transition-colors"><Github /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-500 text-sm">&copy; {new Date().getFullYear()} CryptoSite. All rights reserved.</div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />

    </div>
  );
}
