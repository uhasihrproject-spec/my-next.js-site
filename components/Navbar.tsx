"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // get current route

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo with gradient */}
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            CryptoSite
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 text-white font-medium">
            <Link
              href="/features"
              className={`transition-colors ${
                pathname === "/features" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
              }`}
            >
              Features
            </Link>
            <Link
              href="/stats"
              className={`transition-colors ${
                pathname === "/stats" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
              }`}
            >
              Stats
            </Link>
            <Link
              href="/about"
              className={`transition-colors ${
                pathname === "/about" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
              }`}
            >
              About
            </Link>
            <Link
              href="/faq"
              className={`transition-colors ${
                pathname === "/faq" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
              }`}
            >
              FAQ
            </Link>
            <Link
              href="/login"
              className={`transition-colors ${
                pathname === "/login" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
              }`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:scale-105 transition-transform"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none font-semibold"
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 bg-black/30 backdrop-blur-md rounded-b-lg text-white space-y-3 transition-all duration-300">
          <Link
            href="/features"
            className={`block transition-colors ${
              pathname === "/features" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
            }`}
          >
            Features
          </Link>
          <Link
            href="/stats"
            className={`block transition-colors ${
              pathname === "/stats" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
            }`}
          >
            Stats
          </Link>
          <Link
            href="/about"
            className={`block transition-colors ${
              pathname === "/about" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
            }`}
          >
            About
          </Link>
          <Link
            href="/faq"
            className={`block transition-colors ${
              pathname === "/faq" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
            }`}
          >
            FAQ
          </Link>
          <Link
            href="/login"
            className={`block transition-colors ${
              pathname === "/login" ? "text-yellow-400 font-semibold" : "hover:text-yellow-400"
            }`}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="block px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
