// src/utils/animationConfig.ts
import type { Variants, Transition } from 'framer-motion';

// ---------------------------------------------------------------------------
// Durations (seconds) — aligned with existing 260 ms theme-transition baseline
// ---------------------------------------------------------------------------
export const DURATION = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

// ---------------------------------------------------------------------------
// Easings — cubic-bezier values for framer-motion
// ---------------------------------------------------------------------------
export const EASING = {
  easeOut: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0.0, 1, 1] as [number, number, number, number],
  easeInOut: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
} as const;

// ---------------------------------------------------------------------------
// Shared transition presets
// ---------------------------------------------------------------------------
export const transitionNormal: Transition = {
  duration: DURATION.normal,
  ease: EASING.easeInOut,
};

export const transitionFast: Transition = {
  duration: DURATION.fast,
  ease: EASING.easeOut,
};

export const transitionSlow: Transition = {
  duration: DURATION.slow,
  ease: EASING.easeInOut,
};

// ---------------------------------------------------------------------------
// Variant library
// ---------------------------------------------------------------------------

/** Simple fade in / out */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitionNormal },
  exit: { opacity: 0, transition: transitionFast },
};

/** Slide up from below + fade */
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: transitionNormal },
  exit: { opacity: 0, y: 16, transition: transitionFast },
};

/** Slide down from above + fade */
export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: transitionNormal },
  exit: { opacity: 0, y: -16, transition: transitionFast },
};

/** Slide in from right + fade (overlays, filters) */
export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: transitionNormal },
  exit: { opacity: 0, x: 24, transition: transitionFast },
};

/** Slide in from left + fade */
export const slideLeftVariants: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: transitionNormal },
  exit: { opacity: 0, x: -24, transition: transitionFast },
};

/** Scale up from 95 % + fade (modals, popovers) */
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: transitionNormal },
  exit: { opacity: 0, scale: 0.95, transition: transitionFast },
};

/** Backdrop overlay fade */
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.normal } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

// ---------------------------------------------------------------------------
// Stagger helpers
// ---------------------------------------------------------------------------
const STAGGER_CAP = 20; // cap to prevent long delays on large lists

export const staggerContainerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: transitionFast },
};

/** Returns a capped stagger delay for item index — items beyond cap appear instantly */
export function cappedStaggerDelay(index: number): number {
  if (index >= STAGGER_CAP) return 0;
  return index * 0.04 + 0.05;
}

// ---------------------------------------------------------------------------
// Collapse / expand (height auto)
// ---------------------------------------------------------------------------
export const collapseVariants: Variants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeInOut },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: DURATION.normal, ease: EASING.easeInOut },
  },
};

// ---------------------------------------------------------------------------
// Page-level transitions
// ---------------------------------------------------------------------------

/** Page transition preset — slightly slower crossfade with subtle y-shift */
export const transitionPage: Transition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

/** Route crossfade: subtle opacity + micro y-shift for spatial context */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: transitionPage },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: EASING.easeIn } },
};

/** Skeleton pulse animation (for loading placeholders) */
export const skeletonPulseVariants: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Tab active indicator — designed for Framer Motion layoutId */
export const tabIndicatorTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
};
