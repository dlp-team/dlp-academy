// src/components/ui/StaggerChildren.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface StaggerChildrenProps {
  children: React.ReactNode;
  /** Stagger delay between children in seconds. Default 0.06 */
  stagger?: number;
  className?: string;
}

const containerVariants = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

/**
 * Wraps children with stagger entrance animation.
 * Each direct child gets fadeIn + slideUp with configurable stagger delay.
 */
const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  stagger = 0.06,
  className = '',
}) => (
  <motion.div
    className={className}
    variants={containerVariants}
    custom={stagger}
    initial="hidden"
    animate="show"
  >
    {React.Children.map(children, (child) =>
      child ? (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ) : null,
    )}
  </motion.div>
);

export default StaggerChildren;
