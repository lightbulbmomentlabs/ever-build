'use client';

import { motion } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const comparisonData = [
  {
    feature: 'Price',
    everbuild: '$149-299/mo',
    spreadsheets: 'Free*',
    competitors: '$500+/mo',
  },
  {
    feature: 'Setup Time',
    everbuild: '10 minutes',
    spreadsheets: 'Hours per project',
    competitors: 'Days of training',
  },
  {
    feature: 'Automates Notifications',
    everbuild: true,
    spreadsheets: false,
    competitors: 'complex',
  },
  {
    feature: 'No Sub Login Required',
    everbuild: true,
    spreadsheets: true,
    competitors: false,
  },
  {
    feature: 'Made for Spec Homes',
    everbuild: true,
    spreadsheets: false,
    competitors: false,
  },
  {
    feature: 'Real-Time Updates',
    everbuild: true,
    spreadsheets: false,
    competitors: true,
  },
  {
    feature: 'Mobile First',
    everbuild: true,
    spreadsheets: 'complex',
    competitors: 'complex',
  },
];

export function Comparison() {
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

  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-6 h-6 text-success-green mx-auto" />
      ) : (
        <X className="w-6 h-6 text-error-red mx-auto" />
      );
    }
    if (value === 'complex') {
      return (
        <div className="flex items-center justify-center gap-1">
          <AlertCircle className="w-5 h-5 text-warning-amber" />
          <span className="text-sm text-steel-gray">Complex</span>
        </div>
      );
    }
    return <span className="text-sm text-charcoal-blue font-medium">{value}</span>;
  };

  return (
    <section
      id="comparison"
      ref={sectionRef}
      className="section bg-gradient-to-b from-concrete-white to-[var(--color-bg)] relative overflow-hidden"
    >
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
            Why Builders Choose EverBuild Over...
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto">
            See how we stack up against the alternatives
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto overflow-x-auto"
        >
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blueprint-teal/10 to-everbuild-orange/10">
                  <th className="p-4 text-left text-charcoal-blue font-bold border-b-2 border-[var(--color-border)]">
                    Feature
                  </th>
                  <th className="p-4 text-center border-b-2 border-everbuild-orange bg-everbuild-orange/5">
                    <div className="font-bold text-everbuild-orange text-lg">EverBuild</div>
                    <div className="text-xs text-steel-gray mt-1">That's us! 👋</div>
                  </th>
                  <th className="p-4 text-center text-charcoal-blue font-bold border-b-2 border-[var(--color-border)]">
                    <div>Spreadsheets</div>
                    <div className="text-xs text-steel-gray mt-1">+ Phone</div>
                  </th>
                  <th className="p-4 text-center text-charcoal-blue font-bold border-b-2 border-[var(--color-border)]">
                    <div>Procore /</div>
                    <div>BuilderTrend</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
                  >
                    <td className="p-4 font-medium text-charcoal-blue">{row.feature}</td>
                    <td className="p-4 text-center bg-everbuild-orange/5">
                      {renderCell(row.everbuild)}
                    </td>
                    <td className="p-4 text-center">{renderCell(row.spreadsheets)}</td>
                    <td className="p-4 text-center">{renderCell(row.competitors)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footnote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center text-sm text-steel-gray mt-4 italic"
          >
            *Spreadsheets are free, but your time isn't.
          </motion.p>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col items-center gap-4">
            <p className="text-lg text-steel-gray">
              Ready to make the switch?
            </p>
            <button
              onClick={() => {
                const element = document.getElementById('signup');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary text-lg"
            >
              Start Your Free Trial
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
