/**
 * App Layout
 *
 * Main application layout with responsive navigation.
 * Desktop: Left sidebar navigation
 * Mobile: Hamburger menu with drawer
 */

import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Toaster } from '@/components/ui/toaster';
import { auth } from '@clerk/nextjs/server';
import { isUserAdmin } from '@/lib/services/admin.service';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is admin
  const { userId } = await auth();
  const isAdmin = userId ? await isUserAdmin(userId) : false;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <Sidebar isAdmin={isAdmin} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header with Hamburger Menu */}
        <div className="sticky top-0 z-40 flex items-center gap-4 border-b bg-white px-4 py-3 md:hidden">
          <MobileNav isAdmin={isAdmin} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6">
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
            <span className="text-lg font-bold text-charcoal-blue">EverBuild</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
