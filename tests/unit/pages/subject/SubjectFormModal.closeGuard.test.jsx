// tests/unit/pages/subject/SubjectFormModal.closeGuard.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SubjectFormModal from '../../../../src/pages/Subject/modals/SubjectFormModal';

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
  where: vi.fn(),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('../../../../src/pages/Subject/modals/subject-form/BasicInfoFields', () => ({
  default: ({ formData, setFormData }) => (
    <div>
      <label htmlFor="subject-name-input">Nombre</label>
      <input
        id="subject-name-input"
        aria-label="Nombre"
        value={formData?.name || ''}
        onChange={(event) => {
          setFormData((previous) => ({
            ...previous,
            name: event.target.value,
          }));
        }}
      />
    </div>
  ),
}));

vi.mock('../../../../src/pages/Subject/modals/subject-form/TagManager', () => ({
  default: () => null,
}));

vi.mock('../../../../src/pages/Subject/modals/subject-form/AppearanceSection', () => ({
  default: () => null,
}));

vi.mock('../../../../src/pages/Subject/modals/subject-form/StyleSelector', () => ({
  default: () => null,
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    addDoc: (...args) => firestoreMocks.addDoc(...args),
    collection: (...args) => firestoreMocks.collection(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    getDoc: (...args) => firestoreMocks.getDoc(...args),
    getDocs: (...args) => firestoreMocks.getDocs(...args),
    query: (...args) => firestoreMocks.query(...args),
    serverTimestamp: (...args) => firestoreMocks.serverTimestamp(...args),
    where: (...args) => firestoreMocks.where(...args),
  };
});

describe('SubjectFormModal close guard', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    initialData: {},
    isEditing: false,
    onShare: vi.fn(),
    onUnshare: vi.fn(),
    onTransferOwnership: vi.fn(),
    onDeleteShortcut: vi.fn(),
    user: {
      uid: 'teacher-1',
      role: 'teacher',
      institutionId: '',
      email: 'teacher@test.com',
    },
    allFolders: [],
    initialTab: 'general',
    studentShortcutTagOnlyMode: false,
  };

  const renderModal = (overrides = {}) => {
    render(<SubjectFormModal {...baseProps} {...overrides} />);
  };

  it('closes on backdrop click when create form has no unsaved changes', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows discard confirmation on backdrop click when create form was modified', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Historia' } });
    fireEvent.click(screen.getByTestId('base-modal-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Tienes cambios sin guardar en esta asignatura. ¿Quieres descartarlos y cerrar la ventana?')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Descartar y cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
