import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Sign Up Page
 *
 * Uses Clerk's pre-built sign-up component with EverBuild branding.
 * The [[...sign-up]] catch-all route handles OAuth callbacks.
 *
 * Note: For invite-only access, configure Clerk's allowlist:
 * 1. Go to Clerk Dashboard > User & Authentication > Restrictions
 * 2. Enable "Allowlist"
 * 3. Add email addresses or domains to the allowlist
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-everbuild-orange via-everbuild-orange to-warning-amber relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-24 left-24 w-56 h-56 border-4 border-white/30 rounded-lg rotate-6"></div>
          <div className="absolute bottom-24 right-24 w-64 h-64 border-4 border-charcoal-blue/40 rounded-lg -rotate-12"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12">
              <svg
                viewBox="0 0 1500 1500"
                className="w-full h-full"
                fill="currentColor"
              >
                <path
                  className="text-white"
                  d="M1340.5,1244.6H251.1v-123.4h689.6c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7H251.1v-129.7h313.6c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7H251.1v-33.7l482.3-294,558.1,323.6c46.7,27.1,106.4,11.2,133.5-35.5,27.1-46.7,11.2-106.4-35.5-133.5L781.2,75.2c-31-18-69.3-17.5-99.8,1.1L102.6,429c-29.1,17.7-46.8,49.3-46.8,83.4v829.9c0,53.9,43.7,97.7,97.7,97.7h1187c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7Z"
                />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">EverBuild</span>
          </Link>

          <h1 className="text-4xl font-bold mb-6">
            Start Building Better
          </h1>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join the construction project management platform built for home builders who want to deliver quality on time, every time.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <p className="text-lg font-semibold mb-4">You're in beta! This means you get:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-everbuild-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-white/90">Early access to new features</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-everbuild-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-white/90">Direct line to our team</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-everbuild-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-white/90">Influence product direction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center bg-concrete-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10">
              <svg
                viewBox="0 0 1500 1500"
                className="w-full h-full"
                fill="currentColor"
              >
                <path
                  className="text-everbuild-orange"
                  d="M1340.5,1244.6H251.1v-123.4h689.6c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7H251.1v-129.7h313.6c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7H251.1v-33.7l482.3-294,558.1,323.6c46.7,27.1,106.4,11.2,133.5-35.5,27.1-46.7,11.2-106.4-35.5-133.5L781.2,75.2c-31-18-69.3-17.5-99.8,1.1L102.6,429c-29.1,17.7-46.8,49.3-46.8,83.4v829.9c0,53.9,43.7,97.7,97.7,97.7h1187c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7Z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-charcoal-blue">EverBuild</span>
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-charcoal-blue">Join Beta</h1>
            <p className="mt-2 text-steel-gray">
              Create your account and start building
            </p>
          </div>

          {/* Beta Badge for Mobile */}
          <div className="lg:hidden mb-6 p-4 bg-everbuild-orange/10 border border-everbuild-orange/20 rounded-lg">
            <p className="text-sm text-charcoal-blue text-center">
              <span className="font-semibold">Early Beta Access!</span> Help shape the future of construction project management.
            </p>
          </div>

          <SignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-xl border-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-2 border-steel-gray/20 hover:border-everbuild-orange transition-colors',
                formButtonPrimary: 'bg-everbuild-orange hover:bg-everbuild-orange/90 text-white',
                footerActionLink: 'text-blueprint-teal hover:text-blueprint-teal/80',
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
