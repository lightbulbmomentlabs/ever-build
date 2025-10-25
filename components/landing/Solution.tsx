'use client';

import { motion } from 'framer-motion';
import { Calendar, MessageSquare, RefreshCw, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const steps = [
  {
    number: 1,
    icon: Calendar,
    title: 'Set Your Timeline',
    description:
      'Break your spec home into phases, set dates, and assign subcontractors. Takes 10 minutes.',
    visual: 'timeline',
  },
  {
    number: 2,
    icon: MessageSquare,
    title: 'We Handle the Communication',
    description:
      'EverBuild automatically texts subs 2 days before their phase starts with the address, date, and job details.',
    visual: 'sms',
  },
  {
    number: 3,
    icon: RefreshCw,
    title: 'Schedules Adjust Automatically',
    description:
      'When a sub reports a delay, the system instantly adjusts the schedule and notifies everyone affected. No phone tag required.',
    visual: 'adjust',
  },
];

export function Solution() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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

  // Auto-advance steps
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="section bg-gradient-to-b from-concrete-white to-[var(--color-bg)] relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blueprint-teal opacity-5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-everbuild-orange opacity-5 rounded-full filter blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
            EverBuild: Your Always-On Project Coordinator
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto">
            Three simple steps to automated construction coordination
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-12 md:space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={cn(
                'grid md:grid-cols-2 gap-12 items-center',
                index % 2 === 1 && 'md:flex-row-reverse'
              )}
            >
              {/* Content */}
              <div className={cn('space-y-6', index % 2 === 1 && 'md:order-2')}>
                {/* Step Number Badge */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blueprint-teal text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blueprint-teal/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-blueprint-teal" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-bold text-charcoal-blue">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-lg text-steel-gray leading-relaxed">{step.description}</p>

                {/* Features List */}
                <ul className="space-y-3">
                  {step.number === 1 && (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">
                          Drag-and-drop phase scheduling
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">
                          Pre-built templates for common builds
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">Assign subs in seconds</span>
                      </li>
                    </>
                  )}
                  {step.number === 2 && (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">98% SMS open rate</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">Customizable lead times per sub</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">Include job details and site address</span>
                      </li>
                    </>
                  )}
                  {step.number === 3 && (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">Real-time timeline updates</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">Automatic cascade to dependent phases</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                        <span className="text-steel-gray">Instant notifications to affected parties</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Visual */}
              <div className={cn('relative', index % 2 === 1 && 'md:order-1')}>
                {step.visual === 'timeline' && <TimelineVisual isActive={activeStep === index} />}
                {step.visual === 'sms' && <SMSVisual isActive={activeStep === index} />}
                {step.visual === 'adjust' && <AdjustVisual isActive={activeStep === index} />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineVisual({ isActive }: { isActive: boolean }) {
  return (
    <div className="card p-6 shadow-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-charcoal-blue">Project Timeline</h4>
          <span className="text-xs text-steel-gray">65-Day Build</span>
        </div>
        {['Foundation', 'Framing', 'Plumbing', 'Electrical', 'Drywall'].map((phase, i) => (
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: -20 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className={cn(
              'w-3 h-3 rounded-full',
              i < 2 ? 'bg-success-green' : i === 2 ? 'bg-everbuild-orange' : 'bg-steel-gray/30'
            )} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-charcoal-blue">{phase}</span>
                <span className="text-xs text-steel-gray">Day {(i + 1) * 10}</span>
              </div>
              <div className="h-2 bg-steel-gray/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isActive ? { width: i < 2 ? '100%' : i === 2 ? '45%' : '0%' } : { width: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className={cn(
                    'h-full',
                    i < 2 ? 'bg-success-green' : 'bg-everbuild-orange'
                  )}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SMSVisual({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="w-full max-w-sm mx-auto bg-charcoal-blue rounded-[3rem] p-4 shadow-2xl">
        <div className="bg-[var(--color-bg)] rounded-[2.5rem] overflow-hidden">
          {/* Phone Header */}
          <div className="bg-charcoal-blue text-white p-4 text-center text-sm font-medium">
            Messages
          </div>
          {/* Messages */}
          <div className="p-4 space-y-4 min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-steel-gray/20 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                <p className="text-sm text-charcoal-blue font-medium mb-2">EverBuild</p>
                <p className="text-sm text-steel-gray">
                  👋 Hi Mike! Your Framing work at{' '}
                  <span className="font-semibold text-charcoal-blue">123 Oak Street</span> starts on{' '}
                  <span className="font-semibold text-charcoal-blue">Monday, Oct 28 at 9:00 AM</span>.
                </p>
                <p className="text-sm text-steel-gray mt-2">
                  📍 <span className="text-blueprint-teal underline">View on map</span>
                </p>
                <p className="text-sm text-steel-gray mt-2">
                  Tap to confirm: <span className="text-blueprint-teal underline">everbuild.app/s/abc123</span>
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end"
            >
              <div className="bg-blueprint-teal rounded-2xl rounded-tr-none p-4 max-w-[70%]">
                <p className="text-sm text-white">Got it! I'll be there 👍</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.8 }}
        className="absolute -top-4 -right-4 bg-success-green text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
      >
        98% Open Rate
      </motion.div>
    </div>
  );
}

function AdjustVisual({ isActive }: { isActive: boolean }) {
  return (
    <div className="card p-6 shadow-2xl space-y-6">
      {/* Before */}
      <div>
        <p className="text-xs text-steel-gray font-medium mb-3">BEFORE (Original Schedule)</p>
        <div className="space-y-2">
          {['Plumbing', 'Electrical', 'Drywall'].map((phase, i) => (
            <div key={phase} className="flex items-center gap-3">
              <div className="w-24 text-sm text-charcoal-blue font-medium">{phase}</div>
              <div className="flex-1 h-8 bg-blueprint-teal/20 rounded flex items-center px-3 text-xs text-steel-gray">
                Day {10 + i * 5} - {15 + i * 5}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delay Alert */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ delay: 0.3 }}
        className="bg-warning-amber/10 border-2 border-warning-amber rounded-lg p-4"
      >
        <p className="text-sm font-semibold text-warning-amber flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Plumbing reported 2-day delay
        </p>
      </motion.div>

      {/* After */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-steel-gray font-medium mb-3">AFTER (Auto-Adjusted)</p>
        <div className="space-y-2">
          {['Plumbing', 'Electrical', 'Drywall'].map((phase, i) => (
            <motion.div
              key={phase}
              initial={{ x: 0 }}
              animate={isActive && i > 0 ? { x: [0, 10, 0] } : { x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-24 text-sm text-charcoal-blue font-medium">{phase}</div>
              <div className={cn(
                'flex-1 h-8 rounded flex items-center px-3 text-xs',
                i === 0 ? 'bg-warning-amber/20 text-warning-amber font-medium' : 'bg-success-green/20 text-success-green font-medium'
              )}>
                Day {i === 0 ? 12 : 17 + (i - 1) * 5} - {i === 0 ? 17 : 22 + (i - 1) * 5}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Notification Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ delay: 1.1 }}
        className="flex items-center gap-2 text-xs text-success-green"
      >
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">All affected subs notified automatically</span>
      </motion.div>
    </div>
  );
}
