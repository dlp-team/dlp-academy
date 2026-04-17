// tests/unit/pages/settings/SecuritySection.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SecuritySection from '../../../../src/pages/Settings/components/SecuritySection';

const authState = vi.hoisted(() => ({
  currentUser: {
    uid: 'user-1',
    providerData: [{ providerId: 'password' }],
  },
}));

const updatePasswordMock = vi.hoisted(() => vi.fn());

vi.mock('../../../../src/firebase/config', () => ({
  auth: authState,
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    updatePassword: (...args) => updatePasswordMock(...args),
  };
});

vi.mock('../../../../src/components/modals/SudoModal', () => ({
  default: ({ isOpen, onConfirm, onClose }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="sudo-modal-mock">
        <button onClick={onConfirm}>confirmar-sudo</button>
        <button onClick={onClose}>cerrar-sudo</button>
      </div>
    );
  },
}));

describe('SecuritySection', () => {
  beforeEach(() => {
    updatePasswordMock.mockReset();
    updatePasswordMock.mockResolvedValue({});
    authState.currentUser = {
      uid: 'user-1',
      providerData: [{ providerId: 'password' }],
    };
  });

  it('calls logout callback from logout button', async () => {
    const onLogout = vi.fn(async () => {});
    render(<SecuritySection onLogout={onLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    await waitFor(() => {
      expect(onLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('shows validation message when passwords do not match', () => {
    render(<SecuritySection onLogout={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'password999' },
    });

    fireEvent.click(screen.getByRole('button', { name: /actualizar ahora/i }));

    expect(screen.getByText(/la confirmación no coincide/i)).toBeTruthy();
    expect(updatePasswordMock).not.toHaveBeenCalled();
  });

  it('updates password after sudo confirmation flow', async () => {
    render(<SecuritySection onLogout={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /actualizar ahora/i }));

    expect(screen.getByTestId('sudo-modal-mock')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /confirmar-sudo/i }));

    await waitFor(() => {
      expect(updatePasswordMock).toHaveBeenCalledTimes(1);
    });

    expect(updatePasswordMock).toHaveBeenCalledWith(authState.currentUser, 'password123');
  });
});
