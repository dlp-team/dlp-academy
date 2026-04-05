// tests/unit/components/CustomScrollbar.test.jsx
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import CustomScrollbar from '../../../src/components/ui/CustomScrollbar';

const originalCssApi = globalThis.CSS;

const mockCssSupports = (supportsOverlay) => {
  Object.defineProperty(globalThis, 'CSS', {
    configurable: true,
    writable: true,
    value: {
      supports: vi.fn((value) => {
        if (value === 'overflow-y: overlay' || value === 'overflow: overlay') {
          return supportsOverlay;
        }
        return false;
      }),
    },
  });
};

afterEach(() => {
  Object.defineProperty(globalThis, 'CSS', {
    configurable: true,
    writable: true,
    value: originalCssApi,
  });
});

describe('CustomScrollbar', () => {
  it('applies overlay mode classes when overlay scrollbars are supported', () => {
    mockCssSupports(true);

    const { unmount } = render(<CustomScrollbar />);

    expect(document.documentElement.classList.contains('custom-scrollbar-active')).toBe(true);
    expect(document.documentElement.classList.contains('custom-scrollbar-overlay')).toBe(true);
    expect(document.body.classList.contains('custom-scrollbar-active')).toBe(true);
    expect(document.body.classList.contains('custom-scrollbar-overlay')).toBe(true);

    unmount();

    expect(document.documentElement.classList.contains('custom-scrollbar-active')).toBe(false);
    expect(document.documentElement.classList.contains('custom-scrollbar-overlay')).toBe(false);
    expect(document.body.classList.contains('custom-scrollbar-active')).toBe(false);
    expect(document.body.classList.contains('custom-scrollbar-overlay')).toBe(false);
  });

  it('applies stable fallback classes when overlay scrollbars are not supported', () => {
    mockCssSupports(false);

    const { unmount } = render(<CustomScrollbar />);

    expect(document.documentElement.classList.contains('custom-scrollbar-active')).toBe(true);
    expect(document.documentElement.classList.contains('custom-scrollbar-stable')).toBe(true);
    expect(document.body.classList.contains('custom-scrollbar-active')).toBe(true);
    expect(document.body.classList.contains('custom-scrollbar-stable')).toBe(true);

    unmount();

    expect(document.documentElement.classList.contains('custom-scrollbar-active')).toBe(false);
    expect(document.documentElement.classList.contains('custom-scrollbar-stable')).toBe(false);
    expect(document.body.classList.contains('custom-scrollbar-active')).toBe(false);
    expect(document.body.classList.contains('custom-scrollbar-stable')).toBe(false);
  });
});
