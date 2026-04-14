import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSettingsPageState from '../../../src/pages/Settings/hooks/useSettingsPageState';

const mocks = vi.hoisted(() => ({
  doc: vi.fn((db, name, id) => ({ db, name, id })),
  updateDoc: vi.fn(),
  onSnapshot: vi.fn(),
  applyThemeToDom: vi.fn(),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: (...args) => mocks.doc(...args),
    updateDoc: (...args) => mocks.updateDoc(...args),
    onSnapshot: (...args) => mocks.onSnapshot(...args),
  };
});

vi.mock('../../../src/utils/themeMode', () => ({
  applyThemeToDom: (...args) => mocks.applyThemeToDom(...args),
}));

describe('useSettingsPageState', () => {
  const user = { uid: 'user-1' };
  const db = { __db: 'mock-db' };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.onSnapshot.mockImplementation((_ref, onNext) => {
      onNext({
        exists: () => true,
        data: () => ({
          theme: 'system',
          headerThemeSliderEnabled: true,
          language: 'es',
          viewMode: 'grid',
          rememberSort: true,
          notifications: { email: true, push: false, newContent: true, newFeatures: true },
        }),
      });
      return vi.fn();
    });

    mocks.updateDoc.mockResolvedValue(undefined);
  });

  it('loads settings from snapshot and applies theme', async () => {
    const { result } = renderHook(() => useSettingsPageState({ user, db }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings.theme).toBe('system');
    expect(result.current.settings.headerThemeSliderEnabled).toBe(true);
    expect(result.current.settings.notifications.newContent).toBe(true);
    expect(mocks.applyThemeToDom).toHaveBeenCalledWith('system');
  });

  it('updates theme with optimistic state and persists change', async () => {
    const { result } = renderHook(() => useSettingsPageState({ user, db }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateSetting('theme', 'dark');
    });

    expect(result.current.settings.theme).toBe('dark');
    expect(mocks.applyThemeToDom).toHaveBeenCalledWith('dark', { animate: true, persist: true });
    expect(mocks.updateDoc).toHaveBeenCalledWith(expect.any(Object), { theme: 'dark' });
    expect(result.current.savingStatus).toBe('success');
  });

  it('updates nested notification setting and handles write error', async () => {
    mocks.updateDoc.mockRejectedValueOnce(new Error('write failed'));

    const { result } = renderHook(() => useSettingsPageState({ user, db }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateSetting('notifications.email', false);
    });

    expect(result.current.settings.notifications.email).toBe(false);
    expect(mocks.updateDoc).toHaveBeenCalledWith(expect.any(Object), { 'notifications.email': false });
    expect(result.current.savingStatus).toBe('error');
  });

  it('updates header theme slider setting and persists change', async () => {
    const { result } = renderHook(() => useSettingsPageState({ user, db }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateSetting('headerThemeSliderEnabled', false);
    });

    expect(result.current.settings.headerThemeSliderEnabled).toBe(false);
    expect(mocks.updateDoc).toHaveBeenCalledWith(expect.any(Object), { headerThemeSliderEnabled: false });
  });
});
