import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Sign In Page
 *
 * Uses Clerk's pre-built sign-in component with EverBuild branding.
 * The [[...sign-in]] catch-all route handles OAuth callbacks.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-charcoal-blue via-charcoal-blue to-blueprint-teal relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-4 border-white/30 rounded-lg rotate-12"></div>
          <div className="absolute bottom-32 right-32 w-48 h-48 border-4 border-everbuild-orange/40 rounded-lg -rotate-6"></div>
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
                  className="text-everbuild-orange"
                  d="M1340.5,1244.6H251.1v-123.4h689.6c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7H251.1v-129.7h313.6c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7H251.1v-33.7l482.3-294,558.1,323.6c46.7,27.1,106.4,11.2,133.5-35.5,27.1-46.7,11.2-106.4-35.5-133.5L781.2,75.2c-31-18-69.3-17.5-99.8,1.1L102.6,429c-29.1,17.7-46.8,49.3-46.8,83.4v829.9c0,53.9,43.7,97.7,97.7,97.7h1187c53.9,0,97.7-43.7,97.7-97.7s-43.7-97.7-97.7-97.7Z"
                />
              </svg>
            </div>
            <span className="text-3xl font-bold">EverBuild</span>
          </Link>

          <h1 className="text-4xl font-bold mb-6">
            Welcome Back!
          </h1>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Sign in to manage your construction projects, track phases, and collaborate with your team.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blueprint-teal flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/80">Track every phase of your build</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blueprint-teal flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/80">Coordinate with subcontractors effortlessly</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blueprint-teal flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/80">Stay on schedule and under budget</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
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
            <h1 className="text-3xl font-bold text-charcoal-blue">Welcome Back</h1>
            <p className="mt-2 text-steel-gray">
              Sign in to continue building excellence
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-xl border-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-2 border-steel-gray/20 hover:border-blueprint-teal transition-colors',
                formButtonPrimary: 'bg-everbuild-orange hover:bg-everbuild-orange/90 text-white',
                footerActionLink: 'text-blueprint-teal hover:text-blueprint-teal/80',
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
