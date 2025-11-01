'use client';

/**
 * Mobile Navigation Component
 *
 * Hamburger menu that slides in from the left as a Sheet drawer
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Shield,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const baseNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Shield,
    adminOnly: true,
  },
];

interface MobileNavProps {
  isAdmin: boolean;
}

export function MobileNav({ isAdmin }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Filter navigation based on admin status
  const navigation = baseNavigation.filter(item => !item.adminOnly || isAdmin);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex h-12 w-12 items-center justify-center rounded-lg border bg-white text-charcoal-blue hover:bg-concrete-white transition-colors md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-full flex-col">
          {/* Header with Logo */}
          <SheetHeader className="border-b p-6">
            <SheetTitle>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 group"
                onClick={() => setOpen(false)}
              >
                <div className="w-8 h-8 transition-transform group-hover:scale-110">
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
                <span className="text-xl font-bold text-charcoal-blue">EverBuild</span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              const isAdminLink = item.adminOnly;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3.5 text-base font-medium transition-colors min-h-[48px]',
                    isAdminLink && isActive && 'bg-purple-50 text-purple-700',
                    isAdminLink && !isActive && 'text-purple-600 hover:bg-purple-50 hover:text-purple-700',
                    !isAdminLink && isActive && 'bg-everbuild-orange/10 text-everbuild-orange',
                    !isAdminLink && !isActive && 'text-charcoal-blue/80 hover:bg-concrete-white hover:text-everbuild-orange'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10',
                  },
                }}
                afterSignOutUrl="/"
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-charcoal-blue">Account</p>
                <p className="truncate text-xs text-steel-gray">Manage your profile</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
