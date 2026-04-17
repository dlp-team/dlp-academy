// tests/unit/hooks/useKeyShortcuts.test.js

import { renderHook } from '@testing-library/react';
import { useKeyShortcuts } from '../../../src/hooks/useKeyShortcuts';
import { vi, describe, it, expect } from 'vitest';

describe('useKeyShortcuts', () => {
  it('should call custom copy handler on Ctrl+C', () => {
    const onCopy = vi.fn();
    renderHook(() => useKeyShortcuts({ onCopy }));
    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true });
    window.dispatchEvent(event);
    expect(onCopy).toHaveBeenCalled();
  });

  it('should call custom cut handler on Ctrl+X', () => {
    const onCut = vi.fn();
    renderHook(() => useKeyShortcuts({ onCut }));
    const event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true });
    window.dispatchEvent(event);
    expect(onCut).toHaveBeenCalled();
  });

  it('should call custom paste handler on Ctrl+V', () => {
    const onPaste = vi.fn();
    renderHook(() => useKeyShortcuts({ onPaste }));
    const event = new KeyboardEvent('keydown', { key: 'v', ctrlKey: true });
    window.dispatchEvent(event);
    expect(onPaste).toHaveBeenCalled();
  });

  it('should call custom undo handler on Ctrl+Z', () => {
    const onUndo = vi.fn();
    renderHook(() => useKeyShortcuts({ onUndo }));
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
    window.dispatchEvent(event);
    expect(onUndo).toHaveBeenCalled();
  });
});
