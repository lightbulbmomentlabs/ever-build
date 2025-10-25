'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle hash changes when navigating to home page with hash
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname]);

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);

    // If we're on the homepage, scroll to section
    if (pathname === '/') {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If we're on another page, navigate to home with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-charcoal-blue/95 backdrop-blur-sm shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('features')}
              className={`hover:text-everbuild-orange transition-colors font-medium ${
                isScrolled ? 'text-concrete-white/90' : 'text-charcoal-blue/90'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className={`hover:text-everbuild-orange transition-colors font-medium ${
                isScrolled ? 'text-concrete-white/90' : 'text-charcoal-blue/90'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className={`hover:text-everbuild-orange transition-colors font-medium ${
                isScrolled ? 'text-concrete-white/90' : 'text-charcoal-blue/90'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('signup')}
              className="px-6 py-2 bg-everbuild-orange text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal-blue/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-steel-gray/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8">
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
                  <span className="text-xl font-bold text-charcoal-blue">EverBuild</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-concrete-white rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-charcoal-blue" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-6">
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavClick('features')}
                    className="w-full text-left px-4 py-3 text-lg font-medium text-charcoal-blue hover:bg-concrete-white hover:text-everbuild-orange rounded-lg transition-colors"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => handleNavClick('pricing')}
                    className="w-full text-left px-4 py-3 text-lg font-medium text-charcoal-blue hover:bg-concrete-white hover:text-everbuild-orange rounded-lg transition-colors"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={() => handleNavClick('faq')}
                    className="w-full text-left px-4 py-3 text-lg font-medium text-charcoal-blue hover:bg-concrete-white hover:text-everbuild-orange rounded-lg transition-colors"
                  >
                    FAQ
                  </button>
                  <div className="pt-4 border-t border-steel-gray/20 mt-4">
                    <Link
                      href="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-left px-4 py-3 text-lg font-medium text-charcoal-blue hover:bg-concrete-white hover:text-everbuild-orange rounded-lg transition-colors"
                    >
                      About Us
                    </Link>
                  </div>
                </div>
              </nav>

              {/* CTA Button */}
              <div className="p-6 border-t border-steel-gray/20">
                <button
                  onClick={() => handleNavClick('signup')}
                  className="w-full px-6 py-4 bg-everbuild-orange text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
