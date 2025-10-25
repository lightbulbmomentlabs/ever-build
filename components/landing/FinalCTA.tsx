'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function FinalCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectCount: '',
    phone: '',
    interestedInCall: false,
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setIsSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          company: '',
          projectCount: '',
          phone: '',
          interestedInCall: false,
        });
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <section
      id="signup"
      ref={sectionRef}
      className="section bg-gradient-to-br from-charcoal-blue via-charcoal-blue to-blueprint-teal/20 relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-everbuild-orange opacity-20 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blueprint-teal opacity-20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Build Faster?
            </h2>
            <p className="text-xl text-concrete-white/90 mb-8">
              Join 200+ builders who are tired of coordination chaos.
            </p>

            {/* What Happens Next */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-4 text-white">What Happens Next:</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Instant Access to Updates',
                    description: 'Get exclusive previews of the product as we build it.',
                  },
                  {
                    title: 'Priority Beta Access',
                    description: 'Be first in line when we launch the beta program.',
                  },
                  {
                    title: 'Founding Member Pricing',
                    description: 'Lock in 20% off for life as a thank-you for early support.',
                  },
                  {
                    title: 'Help Shape the Product',
                    description:
                      'Your feedback influences what we build and how we build it.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success-green flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{item.title}</p>
                      <p className="text-concrete-white/80 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[var(--color-card-bg)] rounded-2xl p-8 shadow-2xl"
          >
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-success-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal-blue mb-3">
                  You're on the list!
                </h3>
                <p className="text-steel-gray mb-6">
                  Check your email for confirmation and next steps.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-blueprint-teal font-semibold hover:underline"
                >
                  Add another person →
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-charcoal-blue mb-2">
                    Get Early Access
                  </h3>
                  <p className="text-steel-gray">
                    Join the waitlist and be first to try EverBuild
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-error-red/10 border-2 border-error-red rounded-lg p-4">
                    <p className="text-error-red text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-charcoal-blue mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-border)] focus:border-blueprint-teal focus:outline-none transition-colors"
                    placeholder="John Smith"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-charcoal-blue mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-border)] focus:border-blueprint-teal focus:outline-none transition-colors"
                    placeholder="john@builders.com"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-charcoal-blue mb-2"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-border)] focus:border-blueprint-teal focus:outline-none transition-colors"
                    placeholder="ABC Builders (optional)"
                  />
                </div>

                {/* Project Count */}
                <div>
                  <label
                    htmlFor="projectCount"
                    className="block text-sm font-medium text-charcoal-blue mb-2"
                  >
                    Current # of Active Projects
                  </label>
                  <select
                    id="projectCount"
                    name="projectCount"
                    value={formData.projectCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-border)] focus:border-blueprint-teal focus:outline-none transition-colors"
                  >
                    <option value="">Select range</option>
                    <option value="1-5">1-5</option>
                    <option value="6-10">6-10</option>
                    <option value="11-15">11-15</option>
                    <option value="16-20">16-20</option>
                    <option value="20+">20+</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-charcoal-blue mb-2"
                  >
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-border)] focus:border-blueprint-teal focus:outline-none transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Discovery Call Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="interestedInCall"
                    name="interestedInCall"
                    checked={formData.interestedInCall}
                    onChange={handleChange}
                    className="w-5 h-5 mt-0.5 rounded border-2 border-[var(--color-border)] text-blueprint-teal focus:ring-blueprint-teal cursor-pointer"
                  />
                  <label
                    htmlFor="interestedInCall"
                    className="text-sm text-steel-gray cursor-pointer"
                  >
                    I'm interested in a customer discovery call to help shape
                    the product
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2',
                    isSubmitting
                      ? 'bg-steel-gray cursor-not-allowed'
                      : 'bg-everbuild-orange text-white hover:opacity-90'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining Waitlist...
                    </>
                  ) : (
                    <>
                      Get Early Access
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Privacy Note */}
                <p className="text-xs text-steel-gray text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
