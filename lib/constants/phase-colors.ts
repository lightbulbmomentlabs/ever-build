/**
 * Phase Color Palette
 *
 * Defines the color options for phase visualization
 */

export type PhaseColor =
  | 'gray'
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'yellow'
  | 'teal'
  | 'pink'
  | 'indigo'
  | 'lime';

export const PHASE_COLORS: Record<PhaseColor, { name: string; bg: string; text: string; hex: string }> = {
  gray: {
    name: 'Gray',
    bg: 'bg-gray-400',
    text: 'text-white',
    hex: '#9ca3af',
  },
  blue: {
    name: 'Blue',
    bg: 'bg-blue-500',
    text: 'text-white',
    hex: '#3b82f6',
  },
  green: {
    name: 'Green',
    bg: 'bg-green-500',
    text: 'text-white',
    hex: '#22c55e',
  },
  orange: {
    name: 'Orange',
    bg: 'bg-orange-500',
    text: 'text-white',
    hex: '#f97316',
  },
  purple: {
    name: 'Purple',
    bg: 'bg-purple-500',
    text: 'text-white',
    hex: '#a855f7',
  },
  red: {
    name: 'Red',
    bg: 'bg-red-500',
    text: 'text-white',
    hex: '#ef4444',
  },
  yellow: {
    name: 'Yellow',
    bg: 'bg-yellow-500',
    text: 'text-gray-900',
    hex: '#eab308',
  },
  teal: {
    name: 'Teal',
    bg: 'bg-teal-500',
    text: 'text-white',
    hex: '#14b8a6',
  },
  pink: {
    name: 'Pink',
    bg: 'bg-pink-500',
    text: 'text-white',
    hex: '#ec4899',
  },
  indigo: {
    name: 'Indigo',
    bg: 'bg-indigo-500',
    text: 'text-white',
    hex: '#6366f1',
  },
  lime: {
    name: 'Lime',
    bg: 'bg-lime-500',
    text: 'text-gray-900',
    hex: '#84cc16',
  },
};

export const DEFAULT_PHASE_COLOR: PhaseColor = 'gray';

export function getPhaseColorStyles(color?: string | null) {
  const phaseColor = (color as PhaseColor) || DEFAULT_PHASE_COLOR;
  return PHASE_COLORS[phaseColor] || PHASE_COLORS[DEFAULT_PHASE_COLOR];
}
