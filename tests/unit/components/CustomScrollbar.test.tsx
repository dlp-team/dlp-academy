// tests/unit/components/CustomScrollbar.test.jsx
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import CustomScrollbar from '../../../src/components/ui/CustomScrollbar';

describe('CustomScrollbar', () => {
  it('always applies stable mode classes and removes them on unmount', () => {
    const { unmount } = render(<CustomScrollbar />);

    expect(document.documentElement.classList.contains('custom-scrollbar-active')).toBe(true);
    expect(document.documentElement.classList.contains('custom-scrollbar-stable')).toBe(true);
    expect(document.documentElement.classList.contains('custom-scrollbar-overlay')).toBe(false);
    expect(document.body.classList.contains('custom-scrollbar-active')).toBe(true);
    expect(document.body.classList.contains('custom-scrollbar-stable')).toBe(true);
    expect(document.body.classList.contains('custom-scrollbar-overlay')).toBe(false);

    unmount();

    expect(document.documentElement.classList.contains('custom-scrollbar-active')).toBe(false);
    expect(document.documentElement.classList.contains('custom-scrollbar-stable')).toBe(false);
    expect(document.body.classList.contains('custom-scrollbar-active')).toBe(false);
    expect(document.body.classList.contains('custom-scrollbar-stable')).toBe(false);
  });
});
