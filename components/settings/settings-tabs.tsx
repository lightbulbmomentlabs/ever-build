'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, CreditCard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Settings Navigation Component
 *
 * URL-based navigation for organization settings:
 * - /settings/profile - Company info, address, logo
 * - /settings/billing - Subscription and payment (placeholder)
 * - /settings/team - Team management (placeholder)
 */

export function SettingsNav() {
  const pathname = usePathname();

  const tabs = [
    {
      value: 'profile',
      href: '/settings/profile',
      icon: Building2,
      label: 'Profile',
    },
    {
      value: 'billing',
      href: '/settings/billing',
      icon: CreditCard,
      label: 'Billing',
    },
    {
      value: 'team',
      href: '/settings/team',
      icon: Users,
      label: 'Team',
    },
  ];

  return (
    <div className="mb-6">
      <div className="border-b">
        <nav className="flex gap-2" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (pathname === '/settings' && tab.value === 'profile');

            return (
              <Link
                key={tab.value}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-sky-blue text-sky-blue'
                    : 'border-transparent text-steel-gray hover:text-charcoal-blue hover:border-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
