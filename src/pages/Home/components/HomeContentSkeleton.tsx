// src/pages/Home/components/HomeContentSkeleton.tsx
import React from 'react';
import {
  SkeletonBox,
  SkeletonGrid,
  SkeletonList,
} from '../../../components/ui/Skeleton';

interface HomeContentSkeletonProps {
  /** Current view mode to match skeleton layout to real content */
  viewMode?: 'grid' | 'list' | 'shared';
}

/**
 * Skeleton placeholder that mirrors the HomeContent layout.
 * Shows a controls bar skeleton + content skeletons matching the view mode.
 */
const HomeContentSkeleton: React.FC<HomeContentSkeletonProps> = ({ viewMode = 'grid' }) => (
  <div className="space-y-6" aria-hidden="true">
    {/* Controls bar skeleton */}
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <SkeletonBox width="w-8" height="h-8" rounded="rounded-lg" />
        <SkeletonBox width="w-8" height="h-8" rounded="rounded-lg" />
        <SkeletonBox width="w-8" height="h-8" rounded="rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBox width="w-48" height="h-9" rounded="rounded-xl" />
        <SkeletonBox width="w-9" height="h-9" rounded="rounded-lg" />
      </div>
    </div>

    {/* Content area matching view mode */}
    {viewMode === 'list' ? (
      <SkeletonList count={6} />
    ) : (
      <SkeletonGrid count={6} />
    )}
  </div>
);

export default HomeContentSkeleton;
