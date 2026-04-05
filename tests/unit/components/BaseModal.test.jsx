// tests/unit/components/BaseModal.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BaseModal from '../../../src/components/ui/BaseModal';

describe('BaseModal', () => {
  it('closes when the backdrop is clicked', () => {
    const onClose = vi.fn();

    render(
      <BaseModal isOpen onClose={onClose}>
        <p>Contenido modal</p>
      </BaseModal>
    );

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the modal content', () => {
    const onClose = vi.fn();

    render(
      <BaseModal isOpen onClose={onClose}>
        <button type="button">Accion</button>
      </BaseModal>
    );

    fireEvent.click(screen.getByTestId('base-modal-content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('supports disabling backdrop close behavior', () => {
    const onClose = vi.fn();

    render(
      <BaseModal isOpen onClose={onClose} closeOnBackdropClick={false}>
        <p>Contenido modal</p>
      </BaseModal>
    );

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies custom wrapper style values', () => {
    render(
      <BaseModal isOpen contentWrapperStyle={{ top: '84px' }}>
        <p>Contenido modal</p>
      </BaseModal>
    );

    expect(screen.getByTestId('base-modal-wrapper').style.top).toBe('84px');
  });
});
