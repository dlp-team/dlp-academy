// src/components/ui/Skeleton.tsx
import React from 'react';

// ---------------------------------------------------------------------------
// Base pulse class — CSS-only, respects prefers-reduced-motion
// ---------------------------------------------------------------------------
const PULSE_CLASS = 'animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

interface SkeletonBoxProps {
  className?: string;
  /** Width — Tailwind class or inline style. Defaults to w-full. */
  width?: string;
  /** Height — Tailwind class. Defaults to h-4. */
  height?: string;
  /** Border-radius override. Defaults to rounded from PULSE_CLASS. */
  rounded?: string;
}

/** Rectangular placeholder block */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded,
}) => (
  <div
    className={`${PULSE_CLASS} ${width} ${height} ${rounded ?? ''} ${className}`}
    aria-hidden="true"
  />
);

interface SkeletonTextProps {
  /** Number of text lines to render */
  lines?: number;
  /** Tailwind width classes per line. Last line is auto-shortened if not specified. */
  widths?: string[];
  className?: string;
}

/** Multi-line text placeholder */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  widths,
  className = '',
}) => (
  <div className={`space-y-2.5 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => {
      const w = widths?.[i] ?? (i === lines - 1 ? 'w-3/5' : 'w-full');
      return <div key={i} className={`${PULSE_CLASS} h-3 ${w}`} />;
    })}
  </div>
);

interface SkeletonCircleProps {
  /** Tailwind size class (e.g. w-10 h-10). Defaults to w-10 h-10. */
  size?: string;
  className?: string;
}

/** Circular placeholder (avatars, icons) */
export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  size = 'w-10 h-10',
  className = '',
}) => (
  <div
    className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded-full ${size} ${className}`}
    aria-hidden="true"
  />
);

interface SkeletonCardProps {
  className?: string;
  /** Show a circle (avatar) in the card header */
  avatar?: boolean;
}

/** Card-shaped placeholder combining a header area + text lines */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  avatar = false,
}) => (
  <div
    className={`rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/40 p-5 space-y-4 ${className}`}
    aria-hidden="true"
  >
    {/* Header row */}
    <div className="flex items-center gap-3">
      {avatar && <SkeletonCircle size="w-9 h-9" />}
      <div className="flex-1 space-y-2">
        <SkeletonBox height="h-4" width="w-2/3" />
        <SkeletonBox height="h-3" width="w-1/3" />
      </div>
    </div>
    {/* Body lines */}
    <SkeletonText lines={2} />
  </div>
);

// ---------------------------------------------------------------------------
// Grid / List skeleton layouts
// ---------------------------------------------------------------------------

interface SkeletonGridProps {
  /** Number of cards to show */
  count?: number;
  /** Grid columns class. Defaults to responsive 3-col. */
  columns?: string;
  className?: string;
}

/** Grid of skeleton cards — mimics the Home page card grid */
export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 6,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  className = '',
}) => (
  <div className={`grid ${columns} gap-4 ${className}`} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

interface SkeletonListProps {
  /** Number of rows */
  count?: number;
  className?: string;
}

/** List of skeleton rows — mimics list-mode content */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/40 px-4 py-3"
      >
        <SkeletonBox width="w-8" height="h-8" rounded="rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <SkeletonBox height="h-3.5" width="w-1/2" />
          <SkeletonBox height="h-2.5" width="w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Stat card skeleton (for dashboards)
// ---------------------------------------------------------------------------

/** Single stat card placeholder */
export const SkeletonStatCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/40 p-5 ${className}`}
    aria-hidden="true"
  >
    <div className="flex items-center justify-between mb-3">
      <SkeletonBox width="w-24" height="h-3" />
      <SkeletonCircle size="w-8 h-8" />
    </div>
    <SkeletonBox width="w-16" height="h-7" className="mb-2" />
    <SkeletonBox width="w-20" height="h-2.5" />
  </div>
);

/** Row of stat card skeletons */
export const SkeletonStatRow: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = '',
}) => (
  <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStatCard key={i} />
    ))}
  </div>
);
