import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Board Results Portal",
  description: "Search and analyze board examination results with advanced analytics and insights",
  keywords: "board results, exam results, student rankings, academic performance, education analytics",
};

function Header() {
  return (
    <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-semibold text-primary-300">Board Results</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-slate-300 hover:text-primary-300 transition">
            Home
          </Link>
          <Link href="/analytics" className="text-slate-300 hover:text-primary-300 transition">
            Analytics
          </Link>
          <Link href="/about" className="text-slate-300 hover:text-primary-300 transition">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

function Footer() {
  return (
    <footer className="border-t border-slate-700/50 py-8 mt-auto bg-slate-900/70 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4 text-slate-100">Board Results Portal</h3>
            <p className="text-sm text-slate-400">
              Empowering students and institutions with comprehensive board examination analytics.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-slate-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-slate-400 hover:text-primary-300 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-slate-400 hover:text-primary-300 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-400 hover:text-primary-300 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-slate-100">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-primary-300 transition p-2 rounded-full hover:bg-slate-700/50"
              >
                <FaXTwitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-primary-300 transition p-2 rounded-full hover:bg-slate-700/50"
              >
                <FaLinkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a 
                href="https://github.com/AbidMuntasir/CTG-Board-Result-Scraper" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-primary-300 transition p-2 rounded-full hover:bg-slate-700/50"
              >
                <FaGithub size={20} />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700/50 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Board Results Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-[#0f172a] text-slate-100`}>
        <Header />
        <main className="flex-1 bg-gradient-to-b from-[#0f172a] to-slate-900">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
