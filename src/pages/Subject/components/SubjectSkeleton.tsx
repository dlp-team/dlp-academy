// src/pages/Subject/components/SubjectSkeleton.tsx
import { SkeletonBox, SkeletonText } from '../../../components/ui/Skeleton';

/**
 * Skeleton preview shown while Subject page data is loading.
 * Mimics: back button, subject header, search bar, and topic cards grid.
 */
const SubjectSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
    <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back button */}
      <SkeletonBox className="w-32 h-5 mb-6 rounded" />

      {/* Subject header area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <SkeletonBox className="w-56 h-8 rounded-lg" />
          <SkeletonBox className="w-40 h-4 rounded" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="w-10 h-10 rounded-lg" />
          <SkeletonBox className="w-10 h-10 rounded-lg" />
        </div>
      </div>

      {/* Search bar */}
      <SkeletonBox className="w-full h-10 rounded-xl mb-8" />

      {/* Topic cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonBox className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBox className="w-3/4 h-5 rounded" />
                <SkeletonBox className="w-1/2 h-3 rounded" />
              </div>
            </div>
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default SubjectSkeleton;
