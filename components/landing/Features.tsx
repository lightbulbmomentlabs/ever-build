'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  RefreshCw,
  CheckCircle,
  FileText,
  BarChart3,
  Clock,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MessageSquare,
    title: 'Automated SMS Notifications',
    description: 'Subs get text reminders before their phase starts. 98% open rate means they actually see it.',
    color: 'text-blueprint-teal',
    bgColor: 'bg-blueprint-teal/10',
    size: 'large',
  },
  {
    icon: RefreshCw,
    title: 'Smart Schedule Adjustments',
    description: 'Delays in one phase automatically shift dependent phases. Everyone stays in sync.',
    color: 'text-everbuild-orange',
    bgColor: 'bg-everbuild-orange/10',
    size: 'large',
  },
  {
    icon: CheckCircle,
    title: 'No-Login Status Updates',
    description: 'Subs tap a link to report "done" or "delayed". No app download or login required.',
    color: 'text-success-green',
    bgColor: 'bg-success-green/10',
    size: 'medium',
  },
  {
    icon: FileText,
    title: 'Document Storage',
    description: 'Upload plans, permits, and photos. Everyone accesses the latest version from their phone.',
    color: 'text-blueprint-teal',
    bgColor: 'bg-blueprint-teal/10',
    size: 'medium',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Dashboard',
    description: 'See all your active projects at a glance. Know which ones need attention today.',
    color: 'text-everbuild-orange',
    bgColor: 'bg-everbuild-orange/10',
    size: 'medium',
  },
  {
    icon: Clock,
    title: 'Communication Log',
    description: 'Every notification, status update, and change is logged. Proof when you need it.',
    color: 'text-steel-gray',
    bgColor: 'bg-steel-gray/10',
    size: 'medium',
  },
];

export function Features() {
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
      id="features"
      ref={sectionRef}
      className="section bg-[var(--color-bg)] relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blueprint-teal opacity-5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-everbuild-orange opacity-5 rounded-full filter blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
            Everything You Need, Nothing You Don't
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto">
            Powerful features designed specifically for spec-home builders
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={cn(
                'card-hover group relative overflow-hidden',
                feature.size === 'large' && 'md:col-span-1 lg:col-span-1'
              )}
            >
              {/* Hover Gradient Effect */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                'bg-gradient-to-br',
                feature.color === 'text-blueprint-teal' && 'from-blueprint-teal/5 to-transparent',
                feature.color === 'text-everbuild-orange' && 'from-everbuild-orange/5 to-transparent',
                feature.color === 'text-success-green' && 'from-success-green/5 to-transparent',
                feature.color === 'text-steel-gray' && 'from-steel-gray/5 to-transparent'
              )} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center mb-6',
                  'group-hover:scale-110 transition-transform duration-300',
                  feature.bgColor
                )}>
                  <feature.icon className={cn('w-7 h-7', feature.color)} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-charcoal-blue mb-3 group-hover:text-everbuild-orange transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-steel-gray leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <div className={cn(
                  'absolute top-4 right-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500',
                  feature.bgColor.replace('/10', '')
                )} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-steel-gray mb-6">
            Ready to streamline your construction coordination?
          </p>
          <button
            onClick={() => {
              const element = document.getElementById('signup');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary text-lg"
          >
            Get Early Access
          </button>
        </motion.div>
      </div>
    </section>
  );
}
