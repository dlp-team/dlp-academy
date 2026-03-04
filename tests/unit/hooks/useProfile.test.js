import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfile } from '../../../src/pages/Profile/hooks/useProfile';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  collection: vi.fn((db, name) => ({ db, name })),
  query: vi.fn((...parts) => ({ parts })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  getDocs: vi.fn(),
  doc: vi.fn((db, name, id) => ({ db, name, id })),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  auth: { __auth: 'mock-auth' },
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    signOut: (...args) => mocks.signOut(...args),
  };
});

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => mocks.collection(...args),
    query: (...args) => mocks.query(...args),
    where: (...args) => mocks.where(...args),
    getDocs: (...args) => mocks.getDocs(...args),
    doc: (...args) => mocks.doc(...args),
    getDoc: (...args) => mocks.getDoc(...args),
    updateDoc: (...args) => mocks.updateDoc(...args),
  };
});

describe('useProfile', () => {
  const user = { uid: 'user-1', email: 'user@test.dev' };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        displayName: 'User One',
        role: 'teacher',
      }),
    });

    mocks.getDocs.mockResolvedValue({
      docs: [
        { id: 'subject-1', data: () => ({ name: 'Math', ownerId: 'user-1' }) },
        { id: 'subject-2', data: () => ({ name: 'Physics', ownerId: 'user-1' }) },
      ],
    });
  });

  it('loads user profile and owned subjects', async () => {
    const { result } = renderHook(() => useProfile(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.userProfile).toEqual(
      expect.objectContaining({
        displayName: 'User One',
        role: 'teacher',
      })
    );
    expect(result.current.subjects).toHaveLength(2);
    expect(mocks.where).toHaveBeenCalledWith('ownerId', '==', 'user-1');
  });

  it('updates profile in firestore and local state', async () => {
    const { result } = renderHook(() => useProfile(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateUserProfile({ displayName: 'Updated Name' });
    });

    expect(mocks.updateDoc).toHaveBeenCalled();
    expect(result.current.userProfile?.displayName).toBe('Updated Name');
  });

  it('calls firebase signOut on logout', async () => {
    const { result } = renderHook(() => useProfile(user));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mocks.signOut).toHaveBeenCalled();
  });
});
