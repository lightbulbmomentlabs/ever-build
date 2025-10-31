/**
 * Contact Avatar Component
 *
 * Displays a contact's image or initials fallback with colored background
 */

import Image from 'next/image';
import { getInitials, getAvatarColor } from '@/lib/utils/avatar';

interface ContactAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',      // 40px - for table
  md: 'h-20 w-20 text-lg',      // 80px - for forms
  lg: 'h-32 w-32 text-2xl',     // 128px - for detail views
};

export function ContactAvatar({ name, imageUrl, size = 'md', className = '' }: ContactAvatarProps) {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);

  if (imageUrl) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 ${className}`}>
        <Image
          src={imageUrl}
          alt={`${name}'s avatar`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Fallback to initials with colored background
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white ${className}`}
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  );
}
