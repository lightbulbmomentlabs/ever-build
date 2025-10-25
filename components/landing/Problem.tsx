'use client';

import { motion } from 'framer-motion';
import { Phone, TrendingDown, DollarSign } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const problems = [
  {
    icon: Phone,
    title: 'The Phone Tag Game',
    description:
      'You spend hours every day calling and texting subs to confirm schedules. One missed message and your whole timeline falls apart.',
    color: 'text-error-red',
    bgColor: 'bg-error-red/10',
  },
  {
    icon: TrendingDown,
    title: 'The Domino Effect',
    description:
      "Plumbing finishes early but inspection isn't scheduled for 5 days. Drywall crew shows up to a site that's not ready. Everyone wastes time.",
    color: 'text-warning-amber',
    bgColor: 'bg-warning-amber/10',
  },
  {
    icon: DollarSign,
    title: 'The Profit Drain',
    description:
      'Every delay day costs you money in carrying costs. Miscommunication is killing your margins on builds you should be profiting from.',
    color: 'text-everbuild-orange',
    bgColor: 'bg-everbuild-orange/10',
  },
];

export function Problem() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
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
      id="problem"
      ref={sectionRef}
      className="section bg-[var(--color-bg)] relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--color-steel-gray) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
            Sound Familiar?
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto">
            If you're a spec-home builder, you know these pain points all too well
          </p>
        </motion.div>

        {/* Problem Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="card-hover group"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl ${problem.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <problem.icon className={`w-8 h-8 ${problem.color}`} />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-charcoal-blue mb-4">{problem.title}</h3>

              {/* Description */}
              <p className="text-steel-gray leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stat Callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-error-red/10 via-warning-amber/10 to-everbuild-orange/10 rounded-2xl p-8 md:p-12 border-2 border-error-red/20 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-error-red flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  33%
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl md:text-3xl font-bold text-charcoal-blue mb-2">
                  Poor communication causes{' '}
                  <span className="text-error-red">one-third of construction projects</span> to
                  fail.
                </p>
                <p className="text-lg text-steel-gray">
                  You can't afford to be in that statistic.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transition to Solution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-xl text-steel-gray mb-4">There's a better way...</p>
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-everbuild-orange text-4xl"
            >
              ↓
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
