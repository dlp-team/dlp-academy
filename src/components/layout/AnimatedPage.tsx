// src/components/layout/AnimatedPage.tsx
import PageTransition from './PageTransition';

interface AnimatedPageProps {
  children: React.ReactNode;
  /** Extra Tailwind / CSS classes applied to the transition wrapper */
  className?: string;
}

/**
 * Standard page-level layout wrapper that provides:
 *  - Route-level entrance / exit crossfade (via PageTransition)
 *  - Consistent min-height so short pages don't collapse during exit
 *
 * Usage: wrap the outermost JSX return of any page component.
 */
const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className }) => (
  <PageTransition className={`min-h-screen ${className ?? ''}`}>
    {children}
  </PageTransition>
);

export default AnimatedPage;
