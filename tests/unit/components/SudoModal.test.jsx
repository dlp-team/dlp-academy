// tests/unit/components/SudoModal.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SudoModal from '../../../src/components/modals/SudoModal';

const authMocks = vi.hoisted(() => ({
  reauthenticateWithCredential: vi.fn(),
  credential: vi.fn(() => ({ __credential: true })),
}));

vi.mock('../../../src/firebase/config', () => ({
  auth: {
    currentUser: {
      uid: 'institution-admin-1',
      email: 'inst.admin@test.com',
      providerData: [{ providerId: 'password' }],
    },
  },
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    EmailAuthProvider: {
      credential: (...args) => authMocks.credential(...args),
    },
    reauthenticateWithCredential: (...args) => authMocks.reauthenticateWithCredential(...args),
  };
});

describe('SudoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation error on wrong password and blocks onConfirm', async () => {
    authMocks.reauthenticateWithCredential.mockRejectedValue({ code: 'auth/wrong-password' });

    const onConfirm = vi.fn(async () => {});
    const onClose = vi.fn();

    render(
      <SudoModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        actionName="guardar políticas"
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/introduce tu contraseña/i), {
      target: { value: 'bad-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(screen.getByText(/contraseña incorrecta/i)).toBeTruthy();
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onConfirm and closes modal after successful reauth', async () => {
    authMocks.reauthenticateWithCredential.mockResolvedValue({});

    const onConfirm = vi.fn(async () => {});
    const onClose = vi.fn();

    render(
      <SudoModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        actionName="guardar políticas"
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/introduce tu contraseña/i), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
