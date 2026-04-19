// src/pages/Topic/components/TopicSkeleton.tsx
import { SkeletonBox, SkeletonText } from '../../../components/ui/Skeleton';

/**
 * Skeleton preview shown while Topic page data is loading.
 * Mimics: breadcrumb, topic header with stats, tab bar, and content grid.
 */
const TopicSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <SkeletonBox className="w-20 h-4 rounded" />
        <SkeletonBox className="w-3 h-3 rounded-full" />
        <SkeletonBox className="w-28 h-4 rounded" />
        <SkeletonBox className="w-3 h-3 rounded-full" />
        <SkeletonBox className="w-36 h-4 rounded" />
      </div>

      {/* Topic header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="space-y-2">
          <SkeletonBox className="w-64 h-8 rounded-lg" />
          <SkeletonBox className="w-48 h-4 rounded" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="w-9 h-9 rounded-lg" />
          <SkeletonBox className="w-9 h-9 rounded-lg" />
          <SkeletonBox className="w-9 h-9 rounded-lg" />
        </div>
      </div>

      {/* Stat badges row */}
      <div className="flex gap-3 mb-6">
        <SkeletonBox className="w-24 h-7 rounded-full" />
        <SkeletonBox className="w-28 h-7 rounded-full" />
        <SkeletonBox className="w-20 h-7 rounded-full" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        <SkeletonBox className="w-24 h-9 rounded-t-lg" />
        <SkeletonBox className="w-28 h-9 rounded-t-lg" />
        <SkeletonBox className="w-20 h-9 rounded-t-lg" />
      </div>

      {/* Content cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center gap-4">
            <SkeletonBox className="w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBox className="w-2/3 h-5 rounded" />
              <SkeletonBox className="w-1/3 h-3 rounded" />
            </div>
            <SkeletonBox className="w-8 h-8 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default TopicSkeleton;
