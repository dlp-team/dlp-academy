// tests/unit/hooks/useIdleTimeout.test.js
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIdleTimeout } from '../../../src/hooks/useIdleTimeout';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  navigate: vi.fn(),
  auth: { currentUser: { uid: 'u-1' } },
}));

vi.mock('firebase/auth', () => ({
  signOut: mocks.signOut,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('../../../src/firebase/config', () => ({
  auth: mocks.auth,
}));

describe('useIdleTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.auth.currentUser = { uid: 'u-1' };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('signs out and navigates to /login after inactivity timeout', async () => {
    mocks.signOut.mockResolvedValue(undefined);

    renderHook(() => useIdleTimeout(0.001));

    await act(async () => {
      vi.advanceTimersByTime(80);
    });

    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('resets timer on activity events and avoids premature logout', async () => {
    mocks.signOut.mockResolvedValue(undefined);

    renderHook(() => useIdleTimeout(0.001));

    await act(async () => {
      vi.advanceTimersByTime(30);
      window.dispatchEvent(new Event('mousemove'));
      vi.advanceTimersByTime(30);
    });

    expect(mocks.signOut).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(40);
    });

    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });

  it('cleans up listeners/timer on unmount', async () => {
    mocks.signOut.mockResolvedValue(undefined);

    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useIdleTimeout(0.001));
    unmount();

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(addSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
