'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-charcoal-blue/95 backdrop-blur-sm shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20 px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* SVG Logo */}
            <div className="w-10 h-10 transition-transform group-hover:scale-110">
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

            {/* Brand Name */}
            <span className={`text-2xl font-bold transition-colors ${
              isScrolled ? 'text-white' : 'text-charcoal-blue'
            }`}>
              EverBuild
            </span>
          </Link>

          {/* Navigation - Optional for future */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className={`hover:text-everbuild-orange transition-colors font-medium ${
                isScrolled ? 'text-concrete-white/90' : 'text-charcoal-blue/90'
              }`}
            >
              Features
            </a>
            <a
              href="#pricing"
              className={`hover:text-everbuild-orange transition-colors font-medium ${
                isScrolled ? 'text-concrete-white/90' : 'text-charcoal-blue/90'
              }`}
            >
              Pricing
            </a>
            <a
              href="#faq"
              className={`hover:text-everbuild-orange transition-colors font-medium ${
                isScrolled ? 'text-concrete-white/90' : 'text-charcoal-blue/90'
              }`}
            >
              FAQ
            </a>
            <a
              href="#signup"
              className="px-6 py-2 bg-everbuild-orange text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Get Started
            </a>
          </nav>

          {/* Mobile Menu Button - Optional for future */}
          <button
            className={`md:hidden p-2 transition-colors ${
              isScrolled ? 'text-white' : 'text-charcoal-blue'
            }`}
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
