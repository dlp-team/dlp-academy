// src/components/layout/AnimatedPage.tsx
import PageTransition from './PageTransition';

interface AnimatedPageProps {
  children: React.ReactNode;
  /** Extra Tailwind / CSS classes applied to the transition wrapper */
  className?: string;
}

/**
 * Page-level transition wrapper.
 *
 * When used inside `AuthenticatedLayout` the Header is already rendered
 * persistently — this wrapper only crossfades the page content.
 */
const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className }) => (
  <PageTransition className={className}>
    {children}
  </PageTransition>
);

export default AnimatedPage;
