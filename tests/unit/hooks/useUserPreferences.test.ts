// tests/unit/hooks/useUserPreferences.test.js
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserPreferences } from '../../../src/hooks/useUserPreferences';

const mocks = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
}));

vi.mock('../../../src/firebase/config', () => ({
  db: {},
}));

const createDocSnap = (data) => ({
  exists: () => Boolean(data),
  data: () => data,
});

describe('useUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.doc.mockReturnValue({ path: 'users/u-1' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads defaults when user document is missing', async () => {
    mocks.getDoc.mockResolvedValue(createDocSnap(null));

    const { result } = renderHook(() => useUserPreferences({ uid: 'u-1' }, 'home'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.preferences).toEqual(
      expect.objectContaining({ viewMode: 'grid', layoutMode: 'grid' })
    );
  });

  it('debounces rapid updates into a single persisted write', async () => {
    mocks.getDoc.mockResolvedValue(createDocSnap({ preferences: { home: { viewMode: 'grid' } } }));
    mocks.setDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUserPreferences({ uid: 'u-1' }, 'home'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callbacks = new Map();
    let nextTimerId = 1;
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      const id = nextTimerId++;
      callbacks.set(id, callback);
      return id;
    });
    vi.spyOn(global, 'clearTimeout').mockImplementation((id) => {
      callbacks.delete(id);
    });

    act(() => {
      result.current.updatePreference('viewMode', 'list');
      result.current.updatePreference('cardScale', 120);
    });

    expect(callbacks.size).toBe(1);
    await act(async () => {
      const lastCallback = Array.from(callbacks.values())[0];
      await lastCallback();
    });

    expect(mocks.setDoc).toHaveBeenCalledTimes(1);
  });

  it('preserves preferences from other pages while merging current page updates', async () => {
    mocks.getDoc.mockResolvedValue(
      createDocSnap({
        preferences: {
          home: { viewMode: 'grid' },
          subject: { viewMode: 'topics' },
        },
      })
    );
    mocks.setDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUserPreferences({ uid: 'u-1' }, 'home'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.savePreferences({ cardScale: 110 });
    });

    expect(mocks.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        preferences: expect.objectContaining({
          subject: expect.objectContaining({ viewMode: 'topics' }),
          home: expect.objectContaining({ viewMode: 'grid', cardScale: 110 }),
        }),
      }),
      { merge: true }
    );
  });

  it('logs write errors and remains usable when Firestore persistence fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mocks.getDoc.mockResolvedValue(createDocSnap({ preferences: { home: { viewMode: 'grid' } } }));
    mocks.setDoc.mockRejectedValue(new Error('write-failed'));

    const { result } = renderHook(() => useUserPreferences({ uid: 'u-1' }, 'home'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callbacks = new Map();
    let nextTimerId = 1;
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      const id = nextTimerId++;
      callbacks.set(id, callback);
      return id;
    });
    vi.spyOn(global, 'clearTimeout').mockImplementation((id) => {
      callbacks.delete(id);
    });

    act(() => {
      result.current.updatePreference('viewMode', 'list');
    });
    expect(result.current.preferences.viewMode).toBe('list');

    expect(callbacks.size).toBe(1);
    await act(async () => {
      const lastCallback = Array.from(callbacks.values())[0];
      await lastCallback();
    });

    expect(result.current.preferences).toBeTruthy();
    expect(consoleSpy).toHaveBeenCalled();

    expect(() => result.current.updatePreference('cardScale', 130)).not.toThrow();
  });
});
