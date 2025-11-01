'use client';

/**
 * Contacts Empty State Component
 *
 * Mini version of dashboard empty state for the contacts page.
 * Friendly messaging with CTA and link to How It Works modal.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { HowItWorksModal } from '@/components/dashboard/how-it-works-modal';

export function ContactsEmptyState() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="rounded-lg border bg-white p-8 md:p-12 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        {/* EverBuild Logo Icon - Smaller version */}
        <div className="mb-4 w-16 h-16 md:w-20 md:h-20">
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
        <h2 className="text-xl md:text-2xl font-bold text-charcoal-blue mb-2">
          No Contacts Yet
        </h2>

        {/* Description */}
        <p className="text-sm md:text-base text-steel-gray leading-relaxed mb-6">
          Build your network! Add subcontractors, vendors, and team members to keep
          everyone's contact information organized in one place. Assign them to phases
          and tasks so you always know who to call when you need them.
        </p>

        {/* Call to Action */}
        <Link href="/contacts/new">
          <Button size="lg" className="min-h-[44px] px-6 text-base font-semibold">
            <Plus className="mr-2 h-5 w-5" />
            Add Your First Contact
          </Button>
        </Link>

        {/* Help Link */}
        <p className="mt-4 text-xs md:text-sm text-steel-gray">
          New to EverBuild?{' '}
          <button
            onClick={() => setShowHowItWorks(true)}
            className="text-blueprint-teal hover:underline font-medium"
          >
            Learn how it works
          </button>
        </p>

        {/* How It Works Modal */}
        <HowItWorksModal open={showHowItWorks} onOpenChange={setShowHowItWorks} />
      </div>
    </div>
  );
}
