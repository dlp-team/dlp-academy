// tests/unit/utils/themeMode.test.js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyThemeToDom, resolveThemeMode } from '../../../src/utils/themeMode';

describe('themeMode utils', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    document.documentElement.classList.remove('dark', 'theme-switching');
    localStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.useRealTimers();
  });

  it('resolveThemeMode(system) respects matchMedia dark/light', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(resolveThemeMode('system')).toBe('dark');

    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(resolveThemeMode('system')).toBe('light');
  });

  it('applyThemeToDom toggles dark class and persists selected theme', () => {
    const result = applyThemeToDom('dark');

    expect(result).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('animated theme switch adds and later removes transition class', () => {
    vi.useFakeTimers();

    applyThemeToDom('dark', { animate: true, persist: false });
    expect(document.documentElement.classList.contains('theme-switching')).toBe(true);

    vi.advanceTimersByTime(400);
    expect(document.documentElement.classList.contains('theme-switching')).toBe(false);
  });
});
