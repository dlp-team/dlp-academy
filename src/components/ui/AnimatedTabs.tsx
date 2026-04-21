// src/components/ui/AnimatedTabs.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TabDef {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface AnimatedTabsProps {
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (key: string) => void;
  /** Accent colour class applied to the active indicator & text.
   *  Defaults to indigo-600. Pass e.g. "purple" for purple-600. */
  accent?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Drop-in replacement for the dashboard tab bars.
 * Adds a Framer Motion layoutId-based sliding indicator and
 * keeps the exact same visual structure (border-b, -mb-px pattern).
 */
const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  accent = 'indigo',
  className = '',
}) => {
  const accentBorder = `bg-${accent}-600`;
  const accentText = `text-${accent}-600 dark:text-${accent}-400`;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-px relative ${className}`}
    >
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`relative px-4 py-2 font-medium text-sm flex items-center gap-2 -mb-[2px] transition-colors ${
              isActive
                ? accentText
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {label}

            {/* Sliding active indicator */}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${accentBorder}`}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AnimatedTabs;

// ---------------------------------------------------------------------------
// Animated tab content wrapper
// ---------------------------------------------------------------------------

interface AnimatedTabContentProps {
  tabKey: string;
  children: React.ReactNode;
}

/**
 * Wraps tab panel content with a crossfade animation on tab switch.
 */
export const AnimatedTabContent: React.FC<AnimatedTabContentProps> = ({
  tabKey,
  children,
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);
