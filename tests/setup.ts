import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock framer-motion to render children instantly without animation in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  const React = await import('react');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          const MotionComponent = ({ children, ...rest }: any) => {
            const {
              initial, animate, exit, variants, transition, layout,
              layoutId, whileHover, whileTap, whileFocus, whileDrag,
              whileInView, onAnimationStart, onAnimationComplete,
              ...domProps
            } = rest;
            return React.createElement(prop, domProps, children);
          };
          MotionComponent.displayName = `motion.${prop}`;
          return MotionComponent;
        },
      }
    ),
    useReducedMotion: () => false,
    MotionConfig: ({ children }: { children: React.ReactNode }) => children,
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
