// tests/unit/utils/keyShortcutsHandler.test.js
import { describe, it, expect, vi } from 'vitest';
import { handleKeyShortcut } from '../../../src/utils/keyShortcutsHandler';

describe('keyShortcutsHandler', () => {
  it('prevents default when custom handler consumes event', () => {
    const event = {
      preventDefault: vi.fn(),
    };

    const customHandler = vi.fn(() => true);
    handleKeyShortcut('copy', event, customHandler);

    expect(customHandler).toHaveBeenCalledWith(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('keeps native behavior when custom handler returns false', () => {
    const event = {
      preventDefault: vi.fn(),
    };

    const customHandler = vi.fn(() => false);
    handleKeyShortcut('paste', event, customHandler);

    expect(customHandler).toHaveBeenCalledWith(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
