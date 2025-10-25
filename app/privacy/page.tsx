import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | EverBuild',
  description: 'Learn how EverBuild collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16 bg-concrete-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
                Privacy Policy
              </h1>
              <p className="text-steel-gray text-lg">
                Last Updated: October 24, 2024
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  1. Introduction
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  Welcome to EverBuild (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and handling your personal information with care and respect. This Privacy Policy explains how we collect, use, share, and protect information when you use our construction coordination platform and services (collectively, the &quot;Services&quot;).
                </p>
                <p className="text-steel-gray leading-relaxed">
                  By accessing or using our Services, you agree to this Privacy Policy. If you do not agree with our practices, please do not use our Services.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  2.1 Information You Provide
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We collect information you directly provide when you:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Create an account (name, email address, phone number, company name)</li>
                  <li>Set up projects (property addresses, project timelines, budget information)</li>
                  <li>Add subcontractors and team members (contact information, role details)</li>
                  <li>Upload documents (plans, permits, photos, contracts)</li>
                  <li>Communicate through our platform (messages, status updates, notes)</li>
                  <li>Subscribe to our services (billing information, payment details)</li>
                  <li>Contact customer support (support requests, feedback)</li>
                </ul>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  2.2 Information We Collect Automatically
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  When you use our Services, we automatically collect:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Device information (device type, operating system, browser type)</li>
                  <li>Usage data (pages viewed, features used, time spent, click patterns)</li>
                  <li>Log data (IP address, access times, error logs)</li>
                  <li>Location data (approximate location based on IP address)</li>
                  <li>Cookies and similar tracking technologies (see Section 8)</li>
                </ul>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  2.3 Information From Third Parties
                </h3>
                <p className="text-steel-gray leading-relaxed">
                  We may receive information from third-party services you connect to EverBuild, such as calendar integrations, payment processors, or authentication providers.
                </p>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li><strong>Provide our Services:</strong> Create and manage your account, coordinate projects, send SMS notifications to subcontractors, store and share documents</li>
                  <li><strong>Process payments:</strong> Handle subscription billing and payment transactions</li>
                  <li><strong>Communicate with you:</strong> Send service updates, respond to inquiries, provide customer support</li>
                  <li><strong>Improve our Services:</strong> Analyze usage patterns, conduct research, develop new features</li>
                  <li><strong>Ensure security:</strong> Detect fraud, prevent abuse, maintain platform security</li>
                  <li><strong>Comply with legal obligations:</strong> Respond to legal requests, enforce our terms</li>
                  <li><strong>Marketing:</strong> Send promotional materials (with your consent, where required)</li>
                </ul>
              </section>

              {/* How We Share Your Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  4. How We Share Your Information
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li><strong>With your subcontractors and team members:</strong> To coordinate construction projects as necessary for the Services</li>
                  <li><strong>With service providers:</strong> Third parties who help us operate our Services (SMS providers, cloud hosting, payment processors, analytics tools)</li>
                  <li><strong>For legal reasons:</strong> When required by law, court order, or government request</li>
                  <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                </ul>
                <p className="text-steel-gray leading-relaxed font-semibold">
                  We do NOT sell your personal information to third parties.
                </p>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  5. Data Security
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Employee training on data protection</li>
                  <li>Secure data centers with physical and digital safeguards</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  6. Data Retention
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We retain your information for as long as necessary to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Provide you with our Services</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>Maintain business records</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  When you close your account, we will delete or anonymize your personal information within 90 days, except where we must retain it for legal or legitimate business purposes.
                </p>
              </section>

              {/* Your Privacy Rights */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  7. Your Privacy Rights
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restriction:</strong> Request limitation of how we use your information</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                </ul>
                <p className="text-steel-gray leading-relaxed mb-4">
                  To exercise these rights, please contact us at{' '}
                  <a href="mailto:hello@everbuild.app" className="text-blueprint-teal hover:underline">
                    hello@everbuild.app
                  </a>.
                </p>
                <p className="text-steel-gray leading-relaxed">
                  <strong>California Residents:</strong> Under the California Consumer Privacy Act (CCPA), you have specific rights regarding your personal information. Contact us to exercise your CCPA rights.
                </p>
                <p className="text-steel-gray leading-relaxed">
                  <strong>EU/UK Residents:</strong> Under GDPR, you have additional rights. You may also lodge a complaint with your local data protection authority.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  8. Cookies and Tracking Technologies
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li><strong>Essential cookies:</strong> Enable core functionality like authentication and security</li>
                  <li><strong>Analytics cookies:</strong> Understand how users interact with our Services</li>
                  <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  You can control cookies through your browser settings. Note that disabling certain cookies may limit your ability to use some features of our Services.
                </p>
              </section>

              {/* Third-Party Services */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  9. Third-Party Services
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  Our Services may integrate with third-party services:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>SMS notification providers</li>
                  <li>Payment processors (e.g., Stripe)</li>
                  <li>Cloud storage and hosting services</li>
                  <li>Analytics platforms (e.g., Google Analytics)</li>
                  <li>Customer support tools</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  These third parties have their own privacy policies. We are not responsible for their practices. We encourage you to review their policies before using their services.
                </p>
              </section>

              {/* International Data Transfers */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  10. International Data Transfers
                </h2>
                <p className="text-steel-gray leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  11. Children&apos;s Privacy
                </h2>
                <p className="text-steel-gray leading-relaxed">
                  Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately at{' '}
                  <a href="mailto:hello@everbuild.app" className="text-blueprint-teal hover:underline">
                    hello@everbuild.app
                  </a>.
                </p>
              </section>

              {/* Changes to This Policy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  12. Changes to This Privacy Policy
                </h2>
                <p className="text-steel-gray leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our website and updating the &quot;Last Updated&quot; date. Your continued use of our Services after changes become effective constitutes acceptance of the revised Privacy Policy.
                </p>
              </section>

              {/* Contact Us */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  13. Contact Us
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-concrete-white border-2 border-blueprint-teal rounded-lg p-6">
                  <p className="text-charcoal-blue font-semibold mb-2">EverBuild</p>
                  <p className="text-steel-gray mb-1">
                    Email:{' '}
                    <a href="mailto:hello@everbuild.app" className="text-blueprint-teal hover:underline">
                      hello@everbuild.app
                    </a>
                  </p>
                  <p className="text-steel-gray">
                    We will respond to your inquiry within 30 days.
                  </p>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
