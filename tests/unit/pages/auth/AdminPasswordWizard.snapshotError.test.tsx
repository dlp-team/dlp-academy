// tests/unit/pages/auth/AdminPasswordWizard.snapshotError.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminPasswordWizard from '../../../../src/pages/Auth/components/AdminPasswordWizard';

const firebaseConfigMock = vi.hoisted(() => ({
  db: { __db: 'mock-db' },
  auth: {
    currentUser: {
      providerData: [{ providerId: 'google.com' }],
    },
  },
}));

const firestoreMocks = vi.hoisted(() => ({
  doc: vi.fn((database, collectionName, id) => ({ __kind: 'doc', database, collectionName, id })),
  onSnapshot: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  updatePassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: firebaseConfigMock.db,
  auth: firebaseConfigMock.auth,
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: (...args) => firestoreMocks.doc(...args),
    onSnapshot: (...args) => firestoreMocks.onSnapshot(...args),
  };
});

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    updatePassword: (...args) => authMocks.updatePassword(...args),
    signOut: (...args) => authMocks.signOut(...args),
  };
});

describe('AdminPasswordWizard snapshot reliability', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    firebaseConfigMock.auth.currentUser = {
      providerData: [{ providerId: 'google.com' }],
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows wizard when institution admin without password provider is detected', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_ref, onNext) => {
      onNext({
        exists: () => true,
        data: () => ({ role: 'institutionadmin' }),
      });
      return vi.fn();
    });

    render(<AdminPasswordWizard user={{ uid: 'user-1' }} />);

    await waitFor(() => {
      expect(screen.getByText('Seguridad de Administrador')).toBeTruthy();
    });
  });

  it('hides wizard and logs when user snapshot listener fails', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_ref, _onNext, onError) => {
      onError(new Error('permission-denied'));
      return vi.fn();
    });

    render(<AdminPasswordWizard user={{ uid: 'user-1' }} />);

    await waitFor(() => {
      expect(screen.queryByText('Seguridad de Administrador')).toBeNull();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error listening to admin password wizard user:',
      expect.any(Error)
    );
  });
});
