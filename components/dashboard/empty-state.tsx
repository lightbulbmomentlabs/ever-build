'use client';

/**
 * Dashboard Empty State Component
 *
 * Welcoming empty state for new users with no projects yet.
 * Explains what a project is and encourages creating the first one.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { HowItWorksModal } from './how-it-works-modal';

export function DashboardEmptyState() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* EverBuild Logo Icon */}
      <div className="mb-6 w-20 h-20 md:w-24 md:h-24">
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

      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-bold text-charcoal-blue mb-3">
        Welcome to EverBuild!
      </h2>

      {/* Description */}
      <div className="max-w-2xl space-y-4 mb-8">
        <p className="text-base md:text-lg text-steel-gray leading-relaxed">
          You're all set to start building smarter. Let's create your first{' '}
          <span className="font-semibold text-charcoal-blue">project</span>.
        </p>

        <p className="text-sm md:text-base text-steel-gray leading-relaxed">
          A project in EverBuild represents each spec home or custom build you're managing.
          Think of it as your command center for tracking everything from lot acquisition to
          final walkthrough—timelines, phases, tasks, contacts, and documents all in one place.
        </p>

        <p className="text-sm md:text-base text-steel-gray leading-relaxed">
          Whether you're building your first home or your fiftieth, each project gets the
          organization and clarity it deserves. Ready to break ground?
        </p>
      </div>

      {/* Call to Action */}
      <Link href="/projects/new">
        <Button size="lg" className="min-h-[48px] px-8 text-base md:text-lg font-semibold">
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Project
        </Button>
      </Link>

      {/* Secondary Help Text */}
      <p className="mt-6 text-xs md:text-sm text-steel-gray max-w-md">
        Need help getting started?{' '}
        <button
          onClick={() => setShowHowItWorks(true)}
          className="text-blueprint-teal hover:underline font-medium"
        >
          Learn how EverBuild works
        </button>
        {' '}and you'll be up and running in no time.
      </p>

      {/* How It Works Modal */}
      <HowItWorksModal open={showHowItWorks} onOpenChange={setShowHowItWorks} />
    </div>
  );
}
