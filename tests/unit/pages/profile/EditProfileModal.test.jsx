// tests/unit/pages/profile/EditProfileModal.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditProfileModal from '../../../../src/pages/Profile/modals/EditProfileModal';

const storageMocks = vi.hoisted(() => ({
  ref: vi.fn(() => ({ __ref: true })),
  uploadBytes: vi.fn(async () => ({})),
  getDownloadURL: vi.fn(async () => 'https://cdn.example.com/new-avatar.png'),
}));

vi.mock('../../../../src/firebase/config', () => ({
  storage: { __storage: true },
}));

vi.mock('firebase/storage', () => ({
  ref: (...args) => storageMocks.ref(...args),
  uploadBytes: (...args) => storageMocks.uploadBytes(...args),
  getDownloadURL: (...args) => storageMocks.getDownloadURL(...args),
}));

vi.mock('../../../../src/components/ui/Avatar', () => ({
  default: ({ photoURL, name }) => (
    <div data-testid="avatar-proxy" data-photo={photoURL || ''} data-name={name || ''} />
  ),
}));

describe('EditProfileModal', () => {
  const baseInitialData = {
    uid: 'user-1',
    displayName: 'Nombre Inicial',
    photoURL: 'https://cdn.example.com/original.png',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:preview-image');
  });

  it('closes on cancel without saving', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <EditProfileModal
        isOpen
        onClose={onClose}
        initialData={baseInitialData}
        onSave={onSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('updates image preview when selecting a valid file', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    const { container } = render(
      <EditProfileModal
        isOpen
        onClose={onClose}
        initialData={baseInitialData}
        onSave={onSave}
      />
    );

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByTestId('avatar-proxy').getAttribute('data-photo')).toBe('blob:preview-image');
  });

  it('saves profile and uploads selected image before closing', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn(async () => {});

    const { container } = render(
      <EditProfileModal
        isOpen
        onClose={onClose}
        initialData={baseInitialData}
        onSave={onSave}
      />
    );

    const nameInput = screen.getByRole('textbox');
    fireEvent.change(nameInput, { target: { value: 'Nombre Actualizado' } });

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(storageMocks.uploadBytes).toHaveBeenCalledTimes(1);
      expect(storageMocks.getDownloadURL).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({
        displayName: 'Nombre Actualizado',
        photoURL: 'https://cdn.example.com/new-avatar.png',
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
