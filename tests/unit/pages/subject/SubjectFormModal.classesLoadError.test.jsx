// tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SubjectFormModal from '../../../../src/pages/Subject/modals/SubjectFormModal';

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((database, collectionName) => ({
    __kind: 'collection',
    database,
    collectionName,
  })),
  doc: vi.fn((database, collectionName, id) => ({
    __kind: 'doc',
    database,
    collectionName,
    id,
  })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((ref, ...clauses) => ({
    __kind: 'query',
    ref,
    clauses,
  })),
  serverTimestamp: vi.fn(() => 'server-ts'),
  where: vi.fn((field, op, value) => ({
    __kind: 'where',
    field,
    op,
    value,
  })),
}));

const getCollectionName = (source) => {
  if (source?.__kind === 'query') return source.ref?.collectionName;
  return source?.collectionName;
};

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('../../../../src/pages/Subject/modals/subject-form/BasicInfoFields', () => ({
  default: () => null,
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

describe('SubjectFormModal classes-load feedback', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    initialData: {
      id: 'subject-1',
      name: 'Matematicas',
      ownerId: 'teacher-1',
      ownerEmail: 'teacher@test.com',
      institutionId: 'institution-1',
      classIds: [],
      sharedWith: [],
      inviteCode: 'ABC123',
    },
    isEditing: true,
    onShare: vi.fn(),
    onUnshare: vi.fn(),
    onTransferOwnership: vi.fn(),
    onDeleteShortcut: vi.fn(),
    user: {
      uid: 'teacher-1',
      role: 'teacher',
      institutionId: 'institution-1',
      email: 'teacher@test.com',
    },
    allFolders: [],
    initialTab: 'classes',
    studentShortcutTagOnlyMode: false,
  };

  const renderModal = (overrides = {}) => {
    render(<SubjectFormModal {...baseProps} {...overrides} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
  });

  it('renders available classes without load error when classes query succeeds', async () => {
    firestoreMocks.getDocs.mockImplementation(async (source) => {
      if (getCollectionName(source) === 'classes') {
        return {
          docs: [
            {
              id: 'class-1',
              data: () => ({ name: 'Clase A', studentIds: ['student-1'] }),
            },
          ],
        };
      }
      return { docs: [] };
    });

    renderModal();

    await waitFor(() => {
      expect(screen.getByText('Clase A')).toBeTruthy();
    });

    expect(screen.queryByText('No tienes permiso para cargar las clases disponibles de esta asignatura.')).toBeNull();
  });

  it('shows inline permission feedback when classes query fails', async () => {
    firestoreMocks.getDocs.mockImplementation(async (source) => {
      if (getCollectionName(source) === 'classes') {
        const deniedError = new Error('permission-denied');
        deniedError.code = 'permission-denied';
        throw deniedError;
      }
      return { docs: [] };
    });

    renderModal();

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para cargar las clases disponibles de esta asignatura.')).toBeTruthy();
    });

    expect(screen.getByText('No hay clases disponibles para asignar.')).toBeTruthy();
  });

  it('shows inline general-tab feedback when courses query fails with denied permissions', async () => {
    firestoreMocks.getDocs.mockImplementation(async (source) => {
      if (getCollectionName(source) === 'courses') {
        const deniedError = new Error('permission-denied');
        deniedError.code = 'permission-denied';
        throw deniedError;
      }
      return { docs: [] };
    });

    renderModal({ initialTab: 'general' });

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para cargar los cursos de esta institución.')).toBeTruthy();
    });
  });

  it('shows sharing-tab feedback when institution users query fails with denied permissions', async () => {
    firestoreMocks.getDocs.mockImplementation(async (source) => {
      if (getCollectionName(source) === 'users') {
        const deniedError = new Error('permission-denied');
        deniedError.code = 'permission-denied';
        throw deniedError;
      }
      return { docs: [] };
    });

    renderModal({ initialTab: 'sharing' });

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para cargar sugerencias de usuarios de la institución.')).toBeTruthy();
    });
  });
});
