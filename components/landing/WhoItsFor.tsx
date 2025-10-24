'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const personas = [
  {
    name: 'Mike T.',
    company: 'Custom Homes LLC',
    portfolio: '8-12 homes/year',
    quote: "I was spending 15 hours a week just coordinating schedules. Now I spend 2.",
    image: '/images/builders/mike-t.jpg',
    role: 'Solo Builder',
  },
  {
    name: 'Sarah M.',
    company: 'Precision Builders',
    portfolio: '15-20 homes/year',
    quote: "We went from managing 10 homes to 20 without hiring another coordinator.",
    image: '/images/builders/sarah-m.jpg',
    role: 'Growing Operation',
  },
  {
    name: 'James G.',
    company: 'Heritage Construction',
    portfolio: '5-10 homes/year',
    quote: "After 25 years, this is the tool I wish I'd had from day one. Game-changer.",
    image: '/images/builders/james-g.jpg',
    role: 'Veteran Builder',
  },
];

export function WhoItsFor() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id="who-its-for"
      ref={sectionRef}
      className="section bg-sandstone-tan/10 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-sandstone-tan opacity-20 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-olive-green opacity-10 rounded-full filter blur-3xl" />

      <div className="container-custom relative z-10 px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
            Built for Spec-Home Builders Like You
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto">
            Whether you're building 5 or 50 homes a year, EverBuild scales with your operation
          </p>
        </motion.div>

        {/* Persona Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-[var(--color-card-bg)] rounded-2xl p-8 shadow-xl border-2 border-[var(--color-border)] hover:border-sandstone-tan transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full overflow-hidden mb-6 shadow-lg border-2 border-sandstone-tan">
                <Image
                  src={persona.image}
                  alt={persona.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-sandstone-tan opacity-30" />
                <p className="text-lg text-charcoal-blue font-medium italic pl-6 leading-relaxed">
                  "{persona.quote}"
                </p>
              </div>

              {/* Info */}
              <div className="border-t border-[var(--color-border)] pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-charcoal-blue text-lg">{persona.name}</p>
                    <p className="text-sm text-steel-gray">{persona.company}</p>
                  </div>
                  <div className="px-3 py-1 bg-sandstone-tan/20 rounded-full">
                    <p className="text-xs font-semibold text-olive-green">{persona.role}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blueprint-teal rounded-full" />
                  <p className="text-sm text-steel-gray">{persona.portfolio}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-steel-gray text-lg mb-6">
            <span className="font-semibold text-charcoal-blue">Note:</span> These are example testimonials.
            Join our waitlist to become an early adopter and share your success story!
          </p>
          <button
            onClick={() => {
              const element = document.getElementById('signup');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-secondary text-lg"
          >
            Join 200+ Builders
          </button>
        </motion.div>
      </div>
    </section>
  );
}
