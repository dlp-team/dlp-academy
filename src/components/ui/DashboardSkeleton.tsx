// src/components/ui/DashboardSkeleton.tsx
import React from 'react';
import {
  SkeletonBox,
  SkeletonText,
  SkeletonStatRow,
  SkeletonList,
} from './Skeleton';

interface DashboardSkeletonProps {
  /** Number of stat cards in the header row */
  statCards?: number;
  /** Number of content rows below */
  rows?: number;
  className?: string;
}

/**
 * Generic dashboard loading skeleton — works for Admin, Institution Admin,
 * Teacher, and Student dashboards. Shows a header placeholder, stat card row,
 * tab bar placeholder, and content rows.
 */
const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  statCards = 4,
  rows = 5,
  className = '',
}) => (
  <div className={`space-y-8 ${className}`} aria-hidden="true">
    {/* Page header */}
    <div className="space-y-2">
      <SkeletonBox width="w-72" height="h-7" />
      <SkeletonBox width="w-48" height="h-4" />
    </div>

    {/* Stat cards row */}
    <SkeletonStatRow count={statCards} />

    {/* Tab bar placeholder */}
    <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700/50 pb-px">
      <SkeletonBox width="w-24" height="h-9" rounded="rounded-t-lg" />
      <SkeletonBox width="w-28" height="h-9" rounded="rounded-t-lg" />
      <SkeletonBox width="w-20" height="h-9" rounded="rounded-t-lg" />
    </div>

    {/* Content rows */}
    <SkeletonList count={rows} />
  </div>
);

export default DashboardSkeleton;
