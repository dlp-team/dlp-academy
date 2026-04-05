// tests/unit/components/FolderDeleteModal.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FolderDeleteModal from '../../../src/components/modals/FolderDeleteModal';

const buildProps = (overrides = {}) => ({
  isOpen: true,
  onClose: vi.fn(),
  onDeleteAll: vi.fn(),
  onDeleteFolderOnly: vi.fn(),
  folderName: 'Carpeta Alfa',
  itemCount: 3,
  ...overrides,
});

describe('FolderDeleteModal', () => {
  it('calls onClose when clicking backdrop on main selection screen', () => {
    const props = buildProps();

    render(<FolderDeleteModal {...props} />);

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('returns from confirmation screen to main selection on backdrop click', () => {
    const props = buildProps();

    render(<FolderDeleteModal {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /mover todo a papelera/i }));
    expect(screen.getByText(/confirmar acción/i)).toBeTruthy();

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(props.onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /mover solo carpeta a papelera/i })).toBeTruthy();
  });

  it('executes delete-all path from confirmation screen', () => {
    const props = buildProps();

    render(<FolderDeleteModal {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /mover todo a papelera/i }));
    fireEvent.click(screen.getByRole('button', { name: /sí, mover a papelera/i }));

    expect(props.onDeleteAll).toHaveBeenCalledTimes(1);
    expect(props.onDeleteFolderOnly).not.toHaveBeenCalled();
  });

  it('executes folder-only path from confirmation screen', () => {
    const props = buildProps();

    render(<FolderDeleteModal {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /mover solo carpeta a papelera/i }));
    fireEvent.click(screen.getByRole('button', { name: /sí, mover contenido/i }));

    expect(props.onDeleteFolderOnly).toHaveBeenCalledTimes(1);
    expect(props.onDeleteAll).not.toHaveBeenCalled();
  });
});
