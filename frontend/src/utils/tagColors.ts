import { UNCONFIGURED_TAG } from '@/lib/constants';
import type { TerminalStatus } from '@/types/models.types';

const TAG_COLOR_CLASSES = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-cyan-100 text-cyan-800',
  'bg-indigo-100 text-indigo-800',
  'bg-pink-100 text-pink-800',
  'bg-orange-100 text-orange-800',
  'bg-teal-100 text-teal-800',
] as const;

const TAG_HEX_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#6366f1', '#ec4899', '#f97316', '#14b8a6'] as const;

export const getTagColorClass = (name: string): string => {
  if (name === UNCONFIGURED_TAG) return 'bg-yellow-100 text-yellow-800';
  return TAG_COLOR_CLASSES[name.charCodeAt(0) % TAG_COLOR_CLASSES.length];
};

export const getTagHexColor = (name: string): string => {
  if (name === UNCONFIGURED_TAG) return '#f59e0b';
  return TAG_HEX_COLORS[name.charCodeAt(0) % TAG_HEX_COLORS.length];
};

export const TERMINAL_STATUS_BADGE_VARIANT = {
  online: 'success',
  offline: 'destructive',
  unknown: 'secondary',
} as const satisfies Record<TerminalStatus, string>;

export const TERMINAL_STATUS_HEX: Record<TerminalStatus, string> = {
  online: '#22c55e',
  offline: '#ef4444',
  unknown: '#94a3b8',
};
