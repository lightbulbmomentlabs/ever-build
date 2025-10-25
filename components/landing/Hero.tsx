'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Hero() {
  const [waitlistCount, setWaitlistCount] = useState(200);

  // Animate waitlist counter on mount
  useEffect(() => {
    const start = 180;
    const end = waitlistCount;
    const duration = 2000;
    const steps = 60;
    const increment = (end - start) / steps;
    let current = start;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setWaitlistCount(end);
        clearInterval(timer);
      } else {
        setWaitlistCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-concrete-white">
      {/* Background Pattern - subtle grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(var(--color-steel-gray) 1px, transparent 1px), linear-gradient(90deg, var(--color-steel-gray) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blueprint-teal opacity-10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-everbuild-orange opacity-10 rounded-full filter blur-3xl" />

      <div className="container-custom section relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Waitlist Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-card-bg)] border-2 border-blueprint-teal rounded-full mb-6 shadow-md"
            >
              <span className="w-2 h-2 bg-success-green rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-steel-gray">
                Join {waitlistCount.toLocaleString()}+ builders on the waitlist
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal-blue mb-6 leading-tight"
            >
              Stop Chasing{' '}
              <span className="text-everbuild-orange">Subcontractors</span>.
              <br />
              Start Building{' '}
              <span className="text-blueprint-teal">Faster</span>.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl md:text-2xl text-steel-gray mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              EverBuild automates your construction coordination so you can finish spec homes{' '}
              <span className="font-semibold text-charcoal-blue">on time, every time</span>—without
              the endless calls and texts.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={() => scrollToSection('signup')}
                className="btn-primary text-lg flex items-center justify-center gap-2 group"
              >
                Get Early Access
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="btn-secondary text-lg flex items-center justify-center gap-2 group"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                See How It Works
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-steel-gray"
            >
              <div className="flex -space-x-2">
                {[
                  { src: '/images/builders/james-g.jpg', alt: 'Builder James G.' },
                  { src: '/images/builders/tom-r.jpg', alt: 'Builder Tom R.' },
                  { src: '/images/builders/sarah-m.jpg', alt: 'Builder Sarah M.' },
                  { src: '/images/builders/mike-t.jpg', alt: 'Builder Mike T.' },
                ].map((builder, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                  >
                    <Image
                      src={builder.src}
                      alt={builder.alt}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p>
                <span className="font-semibold text-charcoal-blue">Loved by builders</span> across
                the US and Canada
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            {/* Mockup Container */}
            <div className="relative z-10">
              {/* Dashboard Mockup Placeholder */}
              <div className="card p-0 overflow-hidden shadow-2xl">
                <div className="bg-charcoal-blue p-4 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-error-red" />
                    <div className="w-3 h-3 rounded-full bg-warning-amber" />
                    <div className="w-3 h-3 rounded-full bg-success-green" />
                  </div>
                  <div className="flex-1 text-center text-concrete-white text-sm font-medium">
                    EverBuild Dashboard
                  </div>
                </div>
                <div className="bg-[var(--color-card-bg)] p-6 space-y-4">
                  {/* Project Cards */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="p-4 bg-concrete-white rounded-lg border border-[var(--color-border)] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-charcoal-blue text-sm">
                          123 Oak Street
                        </div>
                        <div
                          className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            i === 1 && 'bg-success-green/10 text-success-green',
                            i === 2 && 'bg-warning-amber/10 text-warning-amber',
                            i === 3 && 'bg-blueprint-teal/10 text-blueprint-teal'
                          )}
                        >
                          {i === 1 && 'On Track'}
                          {i === 2 && '1 Day Behind'}
                          {i === 3 && 'In Progress'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-steel-gray/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${i * 25}%` }}
                            transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
                            className={cn(
                              'h-full rounded-full',
                              i === 1 && 'bg-success-green',
                              i === 2 && 'bg-warning-amber',
                              i === 3 && 'bg-blueprint-teal'
                            )}
                          />
                        </div>
                        <span className="text-xs text-steel-gray font-medium">{i * 25}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Notification */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute -bottom-4 -left-4 bg-[var(--color-card-bg)] p-4 rounded-xl shadow-xl border-2 border-blueprint-teal max-w-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blueprint-teal flex items-center justify-center text-white font-bold">
                    📱
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal-blue">SMS Sent</p>
                    <p className="text-xs text-steel-gray">
                      Framing crew notified - starts Mon 9AM
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-everbuild-orange opacity-20 rounded-full filter blur-2xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blueprint-teal opacity-20 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => scrollToSection('problem')}
        >
          <span className="text-xs text-steel-gray font-medium">Scroll to learn more</span>
          <div className="w-6 h-10 border-2 border-steel-gray rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-steel-gray rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
