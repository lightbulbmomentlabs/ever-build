'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const faqs = [
  {
    question: 'Do my subcontractors need to download an app or create an account?',
    answer:
      "No! That's the beauty of EverBuild. Subs receive a simple text message with a link. They tap it, update their status, and they're done. No app, no login, no friction.",
  },
  {
    question: 'What if my subs ignore the notifications?',
    answer:
      "SMS has a 98% open rate compared to 20% for email. Most subs appreciate clear communication about when they're needed. Plus, you can always manually update on their behalf if needed.",
  },
  {
    question: 'How long does it take to set up a new project?',
    answer:
      'About 10 minutes. Create the project, add phases, assign contacts. You can use our templates for common build sequences or customize your own.',
  },
  {
    question: 'What happens if I exceed my SMS limit?',
    answer:
      "Additional messages cost just $0.02 each. We'll notify you before you hit your limit so you can upgrade or adjust.",
  },
  {
    question: 'Can I try it before I commit?',
    answer:
      'Yes! We offer a 14-day free trial with full access to Professional tier features. No credit card required to start.',
  },
  {
    question: 'Is my project data secure?',
    answer:
      'Absolutely. We use bank-level encryption, regular backups, and industry-standard security practices. Your data is stored securely in the cloud and is never shared.',
  },
  {
    question: 'Do you integrate with QuickBooks / other tools?',
    answer:
      'Integrations are on our roadmap for Year 2. For now, you can export data to CSV for use in other systems.',
  },
  {
    question: 'What if I build custom homes, not spec homes?',
    answer:
      'While EverBuild is optimized for spec-home workflows, many features work great for custom homes too. The main difference is we focus on builder-to-sub coordination rather than builder-to-client communication.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, absolutely. No long-term contracts. Cancel anytime from your account dashboard.',
  },
  {
    question: 'When will EverBuild be available?',
    answer:
      "We're currently in development and plan to launch our beta in Q2 2026. Join the waitlist to be among the first to try it.",
  },
];

export function FAQ() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="section bg-[var(--color-bg)] relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blueprint-teal opacity-5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-everbuild-orange opacity-5 rounded-full filter blur-3xl" />

      <div className="container-custom relative z-10 px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto">
            Got questions? We've got answers.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-start justify-between gap-4 text-left group"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-charcoal-blue group-hover:text-everbuild-orange transition-colors">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blueprint-teal/10 flex items-center justify-center group-hover:bg-everbuild-orange/10 transition-colors">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-everbuild-orange" />
                  ) : (
                    <Plus className="w-5 h-5 text-blueprint-teal" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-[var(--color-border)] mt-4">
                      <p className="text-steel-gray leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-steel-gray mb-6">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const element = document.getElementById('signup');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary text-lg"
            >
              Get Early Access
            </button>
            <a
              href="mailto:hello@everbuild.app"
              className="btn-outline text-lg inline-block"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
