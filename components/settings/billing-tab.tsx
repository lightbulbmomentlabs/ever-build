'use client';

import { CreditCard, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Billing Tab Component (Placeholder)
 *
 * Subscription and billing management - to be implemented with Stripe
 */

interface BillingTabProps {
  subscriptionStatus: 'free' | 'active' | 'past_due' | 'cancelled';
  subscriptionTier: 'free' | 'pro' | 'enterprise' | null;
}

export function BillingTab({ subscriptionStatus, subscriptionTier }: BillingTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-charcoal-blue">Billing & Subscription</h2>
        <p className="text-sm text-steel-gray">
          Manage your subscription plan and payment methods
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {/* Current Plan */}
        <div className="mb-6 flex items-start justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5 text-steel-gray" />
              <h3 className="text-base font-semibold text-charcoal-blue">Current Plan</h3>
            </div>
            <div className="ml-8">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={subscriptionTier === 'free' ? 'secondary' : 'default'}>
                  {subscriptionTier?.toUpperCase() || 'FREE'}
                </Badge>
                <Badge
                  variant={
                    subscriptionStatus === 'active' ? 'default' :
                    subscriptionStatus === 'past_due' ? 'destructive' :
                    'secondary'
                  }
                >
                  {(subscriptionStatus || 'free').replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-steel-gray">
                {subscriptionTier === 'free'
                  ? 'Get started with essential features'
                  : `Access to ${subscriptionTier} plan features`}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Upgrade Plan
          </Button>
        </div>

        {/* Payment Method */}
        <div className="mb-6 border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-steel-gray" />
            <h3 className="text-base font-semibold text-charcoal-blue">Payment Method</h3>
          </div>
          <div className="ml-8">
            <p className="text-sm text-steel-gray mb-4">
              No payment method on file
            </p>
            <Button variant="outline" size="sm" disabled>
              Add Payment Method
            </Button>
          </div>
        </div>

        {/* Billing History */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-steel-gray" />
            <h3 className="text-base font-semibold text-charcoal-blue">Billing History</h3>
          </div>
          <div className="ml-8">
            <p className="text-sm text-steel-gray mb-4">
              No billing history yet
            </p>
            <Button variant="outline" size="sm" disabled>
              View Invoices
            </Button>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 rounded-lg bg-sky-blue/10 border border-sky-blue/20 p-4">
          <p className="text-sm text-charcoal-blue">
            <strong>Coming Soon:</strong> Full billing and subscription management with Stripe integration will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
