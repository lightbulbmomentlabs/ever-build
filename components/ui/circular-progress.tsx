'use client';

/**
 * Circular Progress Component
 *
 * Animated circular progress indicator for displaying completion percentage
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  percentage: number; // 0-100
  size?: number; // Size in pixels
  strokeWidth?: number; // Width of the progress ring
  className?: string;
  showPercentage?: boolean;
  color?: string; // CSS color value
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  color,
}: CircularProgressProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animate percentage on mount/update
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  // Determine color based on percentage if not explicitly provided
  const progressColor =
    color ||
    (percentage >= 80
      ? 'var(--color-success-green)'
      : percentage >= 50
      ? 'var(--color-warning-amber)'
      : 'var(--color-error-red)');

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold text-charcoal-blue"
            style={{ fontSize: size < 60 ? `${size * 0.25}px` : `${size * 0.2}px` }}
          >
            {Math.round(animatedPercentage)}%
          </span>
          {size >= 80 && (
            <span className="text-xs text-steel-gray">Complete</span>
          )}
        </div>
      )}
    </div>
  );
}
