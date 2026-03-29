// tests/unit/hooks/usePersistentState.test.js
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePersistentState } from '../../../src/hooks/usePersistentState';

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hydrates from the provided fallback when storage is empty', () => {
    const { result } = renderHook(() => usePersistentState('dlp:test:key', 'inicial'));

    expect(result.current[0]).toBe('inicial');
  });

  it('persists updates and hydrates them on a new render', () => {
    const { result, unmount } = renderHook(() => usePersistentState('dlp:test:key', 'inicial'));

    act(() => {
      result.current[1]('persistido');
    });

    expect(localStorage.getItem('dlp:test:key')).toBe(JSON.stringify('persistido'));

    unmount();

    const { result: nextResult } = renderHook(() => usePersistentState('dlp:test:key', 'otro'));
    expect(nextResult.current[0]).toBe('persistido');
  });

  it('reloads state when the storage key changes', () => {
    localStorage.setItem('dlp:test:one', JSON.stringify('uno'));
    localStorage.setItem('dlp:test:two', JSON.stringify('dos'));

    const { result, rerender } = renderHook(({ storageKey }) => usePersistentState(storageKey, 'fallback'), {
      initialProps: { storageKey: 'dlp:test:one' }
    });

    expect(result.current[0]).toBe('uno');

    rerender({ storageKey: 'dlp:test:two' });

    expect(result.current[0]).toBe('dos');
  });

  it('returns a stable object snapshot when storage has not changed', () => {
    localStorage.setItem('dlp:test:obj', JSON.stringify({ a: 1 }));

    const { result, rerender } = renderHook(() => usePersistentState('dlp:test:obj', { a: 0 }));
    const firstSnapshot = result.current[0];

    rerender();

    expect(result.current[0]).toBe(firstSnapshot);
    expect(result.current[0]).toEqual({ a: 1 });
  });
});