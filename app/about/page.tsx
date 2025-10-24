import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';
import { Clock, Heart, Lightbulb, Target } from 'lucide-react';

export const metadata = {
  title: 'About Us | EverBuild',
  description: 'Learn about the team behind EverBuild and our mission to help spec-home builders save time and build faster.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16 bg-concrete-white">
        <div className="container-custom px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-16 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
                Built by Builders, for Builders
              </h1>
              <p className="text-xl text-steel-gray max-w-2xl mx-auto">
                We understand your challenges because we&apos;ve lived them. EverBuild was born from years of firsthand experience in the spec-home building industry.
              </p>
            </div>

            {/* Story Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-charcoal-blue mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-steel-gray leading-relaxed text-lg">
                <p>
                  Growing up in a family of home builders, I watched my family navigate the daily chaos of construction coordination. Phone calls that went unanswered. Text messages buried in group threads. Schedules that fell apart when one trade ran behind. It was frustrating, time-consuming, and costly.
                </p>
                <p>
                  As a seasoned software developer specializing in intuitive, time-saving applications, I knew there had to be a better way. I&apos;ve built my career on creating clean, simple solutions to complex problems—products that people actually enjoy using and that stand the test of time.
                </p>
                <p>
                  So I did what any builder would do: I rolled up my sleeves and got to work.
                </p>
                <p>
                  Working closely with my family&apos;s home development business, we spent years refining a system that actually works. We tested every feature on real job sites, with real subcontractors, on real projects. We learned what builders truly need—not another complicated project management tool, but a simple coordination system that just works.
                </p>
                <p className="font-semibold text-charcoal-blue">
                  Today, that system is EverBuild—and we&apos;re bringing it to spec-home builders across the US and Canada.
                </p>
              </div>
            </section>

            {/* Values Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-charcoal-blue mb-8 text-center">
                What Drives Us
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Value 1 */}
                <div className="bg-white border-2 border-blueprint-teal/20 rounded-xl p-6 hover:border-blueprint-teal transition-all">
                  <div className="w-12 h-12 bg-blueprint-teal/10 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-blueprint-teal" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-blue mb-3">
                    Time is Money
                  </h3>
                  <p className="text-steel-gray">
                    Every hour spent chasing subcontractors is an hour not spent growing your business. We&apos;re obsessed with giving builders their time back.
                  </p>
                </div>

                {/* Value 2 */}
                <div className="bg-white border-2 border-everbuild-orange/20 rounded-xl p-6 hover:border-everbuild-orange transition-all">
                  <div className="w-12 h-12 bg-everbuild-orange/10 rounded-lg flex items-center justify-center mb-4">
                    <Lightbulb className="w-6 h-6 text-everbuild-orange" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-blue mb-3">
                    Simple is Better
                  </h3>
                  <p className="text-steel-gray">
                    Clean design and intuitive UX aren&apos;t just buzzwords—they&apos;re how we ensure you and your subs actually use the tool. No training required.
                  </p>
                </div>

                {/* Value 3 */}
                <div className="bg-white border-2 border-success-green/20 rounded-xl p-6 hover:border-success-green transition-all">
                  <div className="w-12 h-12 bg-success-green/10 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-success-green" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-blue mb-3">
                    Exceptional Service
                  </h3>
                  <p className="text-steel-gray">
                    We listen to our customers. Every feature request is considered. Every piece of feedback shapes the product. You&apos;re not just users—you&apos;re partners.
                  </p>
                </div>

                {/* Value 4 */}
                <div className="bg-white border-2 border-charcoal-blue/20 rounded-xl p-6 hover:border-charcoal-blue transition-all">
                  <div className="w-12 h-12 bg-charcoal-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-charcoal-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-blue mb-3">
                    Built to Last
                  </h3>
                  <p className="text-steel-gray">
                    We&apos;re building a best-in-class product that will serve builders for decades to come. No shortcuts, no gimmicks—just solid software that works.
                  </p>
                </div>
              </div>
            </section>

            {/* Mission Section */}
            <section className="mb-16 bg-gradient-to-br from-charcoal-blue to-blueprint-teal/90 rounded-2xl p-8 md:p-12 text-white">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Our Mission
              </h2>
              <p className="text-xl leading-relaxed text-concrete-white/90 mb-6">
                To save spec-home builders thousands of hours and tens of thousands of dollars by automating the coordination chaos—so they can focus on what they do best: building quality homes.
              </p>
              <p className="text-lg leading-relaxed text-concrete-white/80">
                We believe every builder deserves a reliable system that keeps projects on track without the constant phone tag and stress. We&apos;re here to make that a reality.
              </p>
            </section>

            {/* The Advantage */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-charcoal-blue mb-6">
                Why We&apos;re Different
              </h2>
              <div className="bg-sandstone-tan/10 border-2 border-sandstone-tan/30 rounded-xl p-8">
                <p className="text-lg text-steel-gray leading-relaxed mb-4">
                  Most construction software is built by people who&apos;ve never set foot on a job site. They don&apos;t understand the difference between scheduling a meeting and coordinating a build.
                </p>
                <p className="text-lg text-steel-gray leading-relaxed mb-4">
                  <strong className="text-charcoal-blue">We&apos;re different.</strong> We combine deep construction industry knowledge with world-class software development expertise. We know what it&apos;s like to wait for a framing crew that never shows up. We understand the domino effect when one phase runs behind.
                </p>
                <p className="text-lg text-steel-gray leading-relaxed">
                  That&apos;s why EverBuild isn&apos;t just another project management tool—it&apos;s a purpose-built coordination system designed specifically for the unique challenges of spec-home building.
                </p>
              </div>
            </section>

            {/* Vision */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-charcoal-blue mb-6">
                Looking Ahead
              </h2>
              <p className="text-lg text-steel-gray leading-relaxed mb-4">
                We&apos;re just getting started. Our vision is to become the standard coordination platform for spec-home builders across North America. We&apos;re building features that will transform how builders work with their trades, communicate with inspectors, and manage their projects.
              </p>
              <p className="text-lg text-steel-gray leading-relaxed">
                But we won&apos;t lose sight of what matters most: keeping it simple, keeping it intuitive, and keeping you in the loop every step of the way.
              </p>
            </section>

            {/* CTA Section */}
            <section className="bg-blueprint-teal/5 border-2 border-blueprint-teal rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-charcoal-blue mb-4">
                Join Our Growing Community
              </h2>
              <p className="text-lg text-steel-gray mb-6 max-w-2xl mx-auto">
                Over 200 builders have already joined our waitlist. They&apos;re tired of the chaos and ready for a better way. Are you?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/#signup"
                  className="px-8 py-3 bg-everbuild-orange text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Early Access
                </a>
                <a
                  href="mailto:hello@everbuild.app"
                  className="px-8 py-3 border-2 border-blueprint-teal text-blueprint-teal rounded-lg font-semibold hover:bg-blueprint-teal hover:text-white transition-all"
                >
                  Contact Us
                </a>
              </div>
            </section>

            {/* Back to Home */}
            <div className="mt-12 pt-8 border-t border-steel-gray/20">
              <Link
                href="/"
                className="inline-flex items-center text-blueprint-teal hover:text-everbuild-orange transition-colors font-semibold"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
