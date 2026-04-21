// src/components/layout/PageTransition.tsx
import { motion } from 'framer-motion';
import { pageTransitionVariants } from '../../utils/animationConfig';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content with a crossfade + subtle y-shift animation.
 * Used inside AnimatePresence at the routing level (App.tsx).
 * Respects MotionConfig reducedMotion="user" already set at the app root.
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => (
  <motion.div
    variants={pageTransitionVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
);

export default PageTransition;
