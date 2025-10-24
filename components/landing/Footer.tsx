'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-blue text-concrete-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-steel-gray) 1px, transparent 1px), linear-gradient(90deg, var(--color-steel-gray) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        {/* Main Footer Content */}
        <div className="py-12 px-4 md:px-8 grid md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10">
                <svg
                  viewBox="0 0 1500 1500"
                  className="w-full h-full"
                  fill="currentColor"
                >
                  <path
                    className="text-everbuild-orange"
                    d="M1340.5,1244.6H251.1v-123.4h689.6c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7H251.1v-129.7h313.6c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7H251.1v-33.7l482.3-294,558.1,323.6c46.7,27.1,106.4,11.2,133.5-35.5,27.1-46.7,11.2-106.4-35.5-133.5L781.2,75.2c-31-18-69.3-17.5-99.8,1.1L102.6,429c-29.1,17.7-46.8,49.3-46.8,83.4v829.9c0,53.9,43.7,97.7,97.7,97.7h1187c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7Z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold">EverBuild</span>
            </div>
            <p className="text-concrete-white/80 mb-6 max-w-md">
              Construction coordination software designed specifically for
              spec-home builders. Stop chasing. Start building.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:hello@everbuild.app"
                className="w-10 h-10 rounded-full bg-steel-gray/20 hover:bg-everbuild-orange transition-colors flex items-center justify-center group"
              >
                <Mail className="w-5 h-5 text-concrete-white group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-bold text-lg mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-concrete-white/70 hover:text-blueprint-teal transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-concrete-white/70 hover:text-blueprint-teal transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-concrete-white/70 hover:text-blueprint-teal transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-concrete-white/70 hover:text-blueprint-teal transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-concrete-white/70 hover:text-blueprint-teal transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@everbuild.app"
                  className="text-concrete-white/70 hover:text-blueprint-teal transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-concrete-white/70 hover:text-blueprint-teal transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-concrete-white/70 hover:text-blueprint-teal transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-steel-gray/20 py-8 px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-concrete-white/60 text-sm">
              © {currentYear} EverBuild. All rights reserved.
            </p>
            <p className="text-concrete-white/70 text-sm italic">
              Stop chasing. Start building.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
