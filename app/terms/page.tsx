import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | EverBuild',
  description: 'Read the Terms of Service for using EverBuild construction coordination software.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16 bg-concrete-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-charcoal-blue mb-4">
                Terms of Service
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
                  1. Acceptance of Terms
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  Welcome to EverBuild (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of EverBuild&apos;s construction coordination platform, website, and related services (collectively, the &quot;Services&quot;).
                </p>
                <p className="text-steel-gray leading-relaxed mb-4">
                  By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use our Services.
                </p>
                <p className="text-steel-gray leading-relaxed">
                  You must be at least 18 years old and have the legal capacity to enter into binding contracts to use our Services. By using our Services, you represent and warrant that you meet these requirements.
                </p>
              </section>

              {/* Definitions */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  2. Definitions
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  For purposes of these Terms:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li><strong>&quot;Account&quot;</strong> means your registered account with EverBuild</li>
                  <li><strong>&quot;Content&quot;</strong> means any data, information, documents, or materials you upload to or create within the Services</li>
                  <li><strong>&quot;Services&quot;</strong> means EverBuild&apos;s construction coordination platform and all related features, tools, and services</li>
                  <li><strong>&quot;User&quot;</strong> or &quot;you&quot; means the individual or entity using the Services</li>
                  <li><strong>&quot;Subscription&quot;</strong> means your paid plan for accessing the Services</li>
                </ul>
              </section>

              {/* Account Registration */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  3. Account Registration & Security
                </h2>
                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  3.1 Account Creation
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  To use our Services, you must create an Account. You agree to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your information to keep it accurate and current</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access to your Account</li>
                </ul>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  3.2 Account Responsibility
                </h3>
                <p className="text-steel-gray leading-relaxed">
                  You are responsible for all activities that occur under your Account. We reserve the right to suspend or terminate your Account if we detect suspicious activity or violations of these Terms.
                </p>
              </section>

              {/* Description of Services */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  4. Description of Services
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  EverBuild provides a cloud-based construction coordination platform that enables spec-home builders to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Coordinate and schedule construction projects</li>
                  <li>Send automated SMS notifications to subcontractors</li>
                  <li>Track project progress and milestones</li>
                  <li>Store and share construction documents</li>
                  <li>Manage team members and subcontractor information</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time, with or without notice.
                </p>
              </section>

              {/* User Responsibilities */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  5. User Responsibilities & Acceptable Use
                </h2>
                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  5.1 Acceptable Use
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  You agree to use the Services only for lawful purposes and in accordance with these Terms. You agree NOT to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on the intellectual property rights of others</li>
                  <li>Upload viruses, malware, or other malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the Services to send spam or unsolicited messages</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Reverse engineer or attempt to extract source code from the Services</li>
                  <li>Use automated systems (bots) without our permission</li>
                </ul>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  5.2 Compliance
                </h3>
                <p className="text-steel-gray leading-relaxed">
                  You are responsible for ensuring that your use of the Services complies with all applicable construction laws, building codes, labor laws, and regulations in your jurisdiction.
                </p>
              </section>

              {/* User Content */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  6. User Content & Data
                </h2>
                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  6.1 Your Content Ownership
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  You retain all ownership rights to your Content. We do not claim ownership of any Content you upload or create through the Services.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  6.2 License to Use Your Content
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  By uploading Content to the Services, you grant us a limited, non-exclusive, royalty-free license to use, store, process, and display your Content solely for the purpose of providing and improving the Services.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  6.3 Content Responsibility
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  You are solely responsible for:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>The accuracy and legality of your Content</li>
                  <li>Maintaining backups of your Content</li>
                  <li>Ensuring you have the right to upload and share your Content</li>
                  <li>Any damages resulting from your Content</li>
                </ul>
              </section>

              {/* Payment Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  7. Payment Terms
                </h2>
                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  7.1 Subscription Fees
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  Access to certain features requires a paid Subscription. You agree to pay all fees associated with your selected plan. Fees are:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Charged in advance on a monthly or annual basis</li>
                  <li>Non-refundable except as required by law</li>
                  <li>Subject to change with 30 days&apos; notice</li>
                </ul>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  7.2 Payment Methods
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We accept payment via credit card, debit card, and other methods as displayed during checkout. By providing payment information, you authorize us to charge your payment method for all fees.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  7.3 Failed Payments
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  If payment fails, we may suspend your access to the Services until payment is received. We reserve the right to terminate your Account after repeated payment failures.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  7.4 Cancellation & Refunds
                </h3>
                <p className="text-steel-gray leading-relaxed">
                  You may cancel your Subscription at any time. Cancellations take effect at the end of your current billing period. We do not provide refunds for partial months or unused time, except as required by law.
                </p>
              </section>

              {/* SMS Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  8. SMS Communication Terms
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  Our Services include SMS notification features. By using these features, you agree that:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>You have obtained consent from all recipients before sending them SMS messages</li>
                  <li>Standard message and data rates from your carrier may apply</li>
                  <li>Recipients can opt-out by replying STOP to any message</li>
                  <li>You will comply with the Telephone Consumer Protection Act (TCPA) and all SMS regulations</li>
                  <li>You will not send unsolicited or spam messages</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  You are solely responsible for ensuring compliance with all SMS and telecommunications laws.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  9. Intellectual Property Rights
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  The Services, including all software, designs, text, graphics, logos, and other content (excluding your Content), are owned by EverBuild and protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-steel-gray leading-relaxed mb-4">
                  You are granted a limited, non-exclusive, non-transferable license to access and use the Services for your business purposes. This license does not include any right to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Reproduce, modify, or create derivative works</li>
                  <li>Sell, resell, or commercially exploit the Services</li>
                  <li>Reverse engineer or decompile the Services</li>
                  <li>Remove or modify any copyright or trademark notices</li>
                </ul>
              </section>

              {/* Service Modifications */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  10. Service Modifications & Availability
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We reserve the right to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Modify or discontinue any aspect of the Services</li>
                  <li>Perform maintenance that may temporarily interrupt service</li>
                  <li>Update features, functionality, and pricing</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  While we strive for 99.9% uptime, we do not guarantee uninterrupted or error-free service. We are not liable for any service interruptions or data loss.
                </p>
              </section>

              {/* Termination */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  11. Termination
                </h2>
                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  11.1 Termination by You
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  You may terminate your Account at any time by contacting us at{' '}
                  <a href="mailto:hello@everbuild.app" className="text-blueprint-teal hover:underline">
                    hello@everbuild.app
                  </a>
                  . Termination takes effect at the end of your current billing period.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  11.2 Termination by Us
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We may suspend or terminate your Account immediately if:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>You violate these Terms</li>
                  <li>Your payment fails</li>
                  <li>We suspect fraudulent or illegal activity</li>
                  <li>Required by law</li>
                </ul>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  11.3 Effect of Termination
                </h3>
                <p className="text-steel-gray leading-relaxed">
                  Upon termination, your access to the Services will cease. We will retain your Content for 90 days to allow you to export it, after which it will be permanently deleted. Provisions of these Terms that by their nature should survive termination will survive.
                </p>
              </section>

              {/* Disclaimers */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  12. Disclaimers of Warranties
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4 uppercase font-semibold">
                  THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                </p>
                <p className="text-steel-gray leading-relaxed mb-4">
                  To the maximum extent permitted by law, we disclaim all warranties, including but not limited to:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                  <li>Warranties that the Services will be uninterrupted, timely, secure, or error-free</li>
                  <li>Warranties regarding the accuracy or reliability of any information obtained through the Services</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  <strong>Construction Project Disclaimer:</strong> EverBuild is a coordination tool only. We are not responsible for construction quality, safety compliance, building code adherence, or project outcomes. You remain solely responsible for all construction decisions and project management.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  13. Limitation of Liability
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4 uppercase font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, EVERBUILD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
                </p>
                <p className="text-steel-gray leading-relaxed mb-4">
                  This includes damages arising from:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Use or inability to use the Services</li>
                  <li>Service interruptions or data loss</li>
                  <li>Construction project delays or failures</li>
                  <li>Errors in scheduling or notifications</li>
                  <li>Unauthorized access to your Account or Content</li>
                </ul>
                <p className="text-steel-gray leading-relaxed">
                  Our total liability for any claims arising from these Terms or the Services shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
                </p>
              </section>

              {/* Indemnification */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  14. Indemnification
                </h2>
                <p className="text-steel-gray leading-relaxed">
                  You agree to indemnify, defend, and hold harmless EverBuild, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including reasonable attorneys&apos; fees) arising from:
                </p>
                <ul className="list-disc pl-6 mb-6 text-steel-gray space-y-2">
                  <li>Your use of the Services</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any law or rights of third parties</li>
                  <li>Your Content or construction projects</li>
                  <li>Your SMS messages sent through the Services</li>
                </ul>
              </section>

              {/* Dispute Resolution */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  15. Dispute Resolution
                </h2>
                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  15.1 Governing Law
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  15.2 Dispute Resolution Process
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  Before filing any legal action, you agree to first contact us at{' '}
                  <a href="mailto:hello@everbuild.app" className="text-blueprint-teal hover:underline">
                    hello@everbuild.app
                  </a>{' '}
                  to attempt to resolve the dispute informally.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  15.3 Venue
                </h3>
                <p className="text-steel-gray leading-relaxed">
                  Any legal action or proceeding arising from these Terms shall be brought exclusively in the federal or state courts located in Delaware, and you consent to the jurisdiction of such courts.
                </p>
              </section>

              {/* General Provisions */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  16. General Provisions
                </h2>
                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  16.1 Entire Agreement
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and EverBuild regarding the Services.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  16.2 Severability
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  16.3 Waiver
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  16.4 Assignment
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  You may not assign or transfer these Terms without our written consent. We may assign these Terms at any time without notice.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  16.5 Changes to Terms
                </h3>
                <p className="text-steel-gray leading-relaxed mb-4">
                  We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on our website and updating the &quot;Last Updated&quot; date. Your continued use of the Services after changes become effective constitutes acceptance of the revised Terms.
                </p>

                <h3 className="text-2xl font-semibold text-charcoal-blue mb-3">
                  16.6 Force Majeure
                </h3>
                <p className="text-steel-gray leading-relaxed">
                  We will not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, riots, pandemics, or failures of third-party services.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-charcoal-blue mb-4">
                  17. Contact Information
                </h2>
                <p className="text-steel-gray leading-relaxed mb-4">
                  If you have questions about these Terms, please contact us:
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
