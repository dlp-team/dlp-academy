// src/utils/selectionVisualUtils.ts
export const SHARED_SELECTION_RING_CLASS = 'ring-4 ring-indigo-500 dark:ring-indigo-300 ring-offset-2 ring-offset-white dark:ring-offset-slate-950';

export const getHomeUnselectedDimmingClass = ({
  hasSelection,
  isSelected,
}: any = {}) => {
  if (!hasSelection || isSelected) return '';
  return 'brightness-[0.92] saturate-[0.72]';
};

export const getBinUnselectedDimmingClass = ({
  hasSelection,
  isSelected,
  isFolderLike = false,
}: any = {}) => {
  if (!hasSelection || isSelected) return '';
  return isFolderLike
    ? 'brightness-[0.93] saturate-[0.76]'
    : 'brightness-[0.88] saturate-[0.58]';
};
