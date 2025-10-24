'use client';

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Starter',
    price: 49,
    period: 'month',
    description: 'Best for: Solo builders',
    features: [
      'Up to 5 active projects',
      '500 SMS/month',
      '1 user',
      'Email support',
      'Document storage: 5GB',
    ],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: 99,
    period: 'month',
    description: 'Best for: Small teams',
    badge: 'Most Popular',
    features: [
      'Up to 15 active projects',
      '2,000 SMS/month',
      '3 users',
      'Priority support',
      'Document storage: 25GB',
      'Custom templates',
      'Advanced reporting',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Business',
    price: 199,
    period: 'month',
    description: 'Best for: Growing operations',
    features: [
      'Unlimited projects',
      '5,000 SMS/month',
      '10 users',
      'Phone + email support',
      'Document storage: 100GB',
      'Custom branding',
      'API access',
      'Dedicated onboarding',
    ],
    highlighted: false,
    cta: 'Start Free Trial',
  },
];

export function Pricing() {
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
      id="pricing"
      ref={sectionRef}
      className="section bg-gradient-to-b from-[var(--color-bg)] to-concrete-white relative overflow-hidden"
    >
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

      <div className="container-custom relative z-10 px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
            Simple Pricing That Pays for Itself
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto mb-8">
            Choose the plan that fits your build volume. All plans include a 14-day free trial.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-green/10 rounded-full">
            <Check className="w-5 h-5 text-success-green" />
            <span className="text-sm font-semibold text-success-green">
              Save 10+ hours per project
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={cn(
                'relative rounded-2xl p-8 border-2 transition-all duration-300',
                tier.highlighted
                  ? 'border-everbuild-orange shadow-2xl scale-105 bg-[var(--color-card-bg)]'
                  : 'border-[var(--color-border)] shadow-lg bg-[var(--color-card-bg)] hover:border-blueprint-teal hover:shadow-xl'
              )}
            >
              {/* Popular Badge */}
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-everbuild-orange text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    {tier.badge}
                  </div>
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-charcoal-blue mb-2">{tier.name}</h3>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-charcoal-blue">${tier.price}</span>
                  <span className="text-steel-gray">/{tier.period}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-steel-gray mb-6">{tier.description}</p>

              {/* CTA Button */}
              <button
                onClick={() => {
                  const element = document.getElementById('signup');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={cn(
                  'w-full py-3 px-6 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg mb-8',
                  tier.highlighted
                    ? 'bg-everbuild-orange text-white hover:opacity-90'
                    : 'bg-blueprint-teal text-white hover:opacity-90'
                )}
              >
                {tier.cta}
              </button>

              {/* Features List */}
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        'w-5 h-5 flex-shrink-0 mt-0.5',
                        tier.highlighted ? 'text-everbuild-orange' : 'text-success-green'
                      )}
                    />
                    <span className="text-steel-gray text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Decorative Element for Highlighted */}
              {tier.highlighted && (
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-everbuild-orange/5 to-transparent rounded-2xl" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-blueprint-teal/10 to-everbuild-orange/10 rounded-2xl p-8 border-2 border-blueprint-teal/20">
            <p className="text-xl font-semibold text-charcoal-blue mb-2">
              Save 10+ hours per project
            </p>
            <p className="text-steel-gray">
              If you're building 10 homes a year, that's <span className="font-semibold text-charcoal-blue">100+ hours back</span>.
              Worth way more than $99/month.
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-steel-gray">
            All plans include: SSL security, automatic backups, and mobile access. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
