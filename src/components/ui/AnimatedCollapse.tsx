// src/components/ui/AnimatedCollapse.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DURATION, EASING } from '../../utils/animationConfig';

type AnimatedCollapseProps = {
    isOpen: boolean;
    children: React.ReactNode;
    duration?: number;
    className?: string;
};

const AnimatedCollapse = ({
    isOpen,
    children,
    duration = DURATION.normal,
    className,
}: AnimatedCollapseProps) => (
    <AnimatePresence initial={false}>
        {isOpen && (
            <motion.div
                initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                animate={{
                    height: 'auto',
                    opacity: 1,
                    overflow: 'visible',
                    transition: {
                        duration,
                        ease: EASING.easeInOut,
                        overflow: { delay: duration },
                    },
                }}
                exit={{
                    height: 0,
                    opacity: 0,
                    overflow: 'hidden',
                    transition: { duration, ease: EASING.easeInOut },
                }}
                className={className}
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

export default AnimatedCollapse;
