// tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('shows sharing-tab feedback when owner email resolution fails with denied permissions', async () => {
    firestoreMocks.getDoc.mockImplementation(async (source) => {
      if (source?.collectionName === 'users') {
        const deniedError = new Error('permission-denied');
        deniedError.code = 'permission-denied';
        throw deniedError;
      }
      return { exists: () => false, data: () => ({}) };
    });

    firestoreMocks.getDocs.mockImplementation(async () => ({ docs: [] }));

    renderModal({
      initialTab: 'sharing',
      initialData: {
        ...baseProps.initialData,
        ownerEmail: '',
        ownerId: 'owner-2',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para resolver el correo del propietario de esta asignatura.')).toBeTruthy();
    });
  });

  it('shows classes-tab feedback when institution policy load fails with denied permissions', async () => {
    firestoreMocks.getDoc.mockImplementation(async (source) => {
      if (source?.collectionName === 'institutions') {
        const deniedError = new Error('permission-denied');
        deniedError.code = 'permission-denied';
        throw deniedError;
      }
      return { exists: () => false, data: () => ({}) };
    });

    firestoreMocks.getDocs.mockImplementation(async () => ({ docs: [] }));

    renderModal({ initialTab: 'classes' });

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para cargar las políticas de acceso de esta institución.')).toBeTruthy();
    });
  });

  it('shows classes-tab mutation feedback when class request fails with denied permissions', async () => {
    firestoreMocks.getDoc.mockImplementation(async (source) => {
      if (source?.collectionName === 'institutions') {
        return {
          exists: () => true,
          data: () => ({
            accessPolicies: {
              teachers: {
                canAssignClassesAndStudents: false,
              },
            },
          }),
        };
      }
      return { exists: () => false, data: () => ({}) };
    });

    firestoreMocks.getDocs.mockImplementation(async (source) => {
      if (getCollectionName(source) === 'classes') {
        return {
          docs: [
            {
              id: 'class-1',
              data: () => ({ name: 'Clase A', studentIds: [] }),
            },
          ],
        };
      }
      return { docs: [] };
    });

    firestoreMocks.addDoc.mockImplementation(async () => {
      const deniedError = new Error('permission-denied');
      deniedError.code = 'permission-denied';
      throw deniedError;
    });

    renderModal({ initialTab: 'classes' });

    await waitFor(() => {
      expect(screen.getByText('Clase A')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Solicitar asignación'));

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para solicitar la asignación de clases de esta asignatura.')).toBeTruthy();
    });
  });

  it('shows sharing feedback when self-unshare fails with denied permissions', async () => {
    const deniedError = new Error('permission-denied');
    deniedError.code = 'permission-denied';

    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    firestoreMocks.getDocs.mockResolvedValue({ docs: [] });

    const onUnshare = vi.fn().mockRejectedValue(deniedError);
    const onDeleteShortcut = vi.fn();

    renderModal({
      initialTab: 'sharing',
      onUnshare,
      onDeleteShortcut,
      initialData: {
        ...baseProps.initialData,
        ownerId: 'owner-2',
        ownerEmail: 'owner@test.com',
        isShortcut: true,
        shortcutId: 'shortcut-1',
        sharedWith: [{ uid: 'teacher-1', email: 'teacher@test.com', role: 'editor', canEdit: true }],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Eliminar acceso para mí')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Eliminar acceso para mí'));
    fireEvent.click(screen.getByText('Confirmar eliminación'));

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para eliminar tu acceso a esta asignatura.')).toBeTruthy();
    });

    expect(onDeleteShortcut).not.toHaveBeenCalled();
  });

  it('shows sharing feedback when transfer ownership fails with denied permissions', async () => {
    const deniedError = new Error('permission-denied');
    deniedError.code = 'permission-denied';

    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    firestoreMocks.getDocs.mockResolvedValue({ docs: [] });

    const onTransferOwnership = vi.fn().mockRejectedValue(deniedError);

    renderModal({
      initialTab: 'sharing',
      onTransferOwnership,
      initialData: {
        ...baseProps.initialData,
        ownerId: 'teacher-1',
        sharedWith: [{ uid: 'teacher-2', email: 'teacher2@test.com', role: 'viewer', canEdit: false }],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Transferir')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Transferir'));
    fireEvent.click(screen.getByText('Transferir propiedad'));

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para transferir la propiedad de esta asignatura.')).toBeTruthy();
    });
  });

  it('shows apply-all feedback when share-add fails with denied permissions', async () => {
    const deniedError = new Error('permission-denied');
    deniedError.code = 'permission-denied';

    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    firestoreMocks.getDocs.mockResolvedValue({ docs: [] });

    const onShare = vi.fn().mockRejectedValue(deniedError);

    renderModal({
      initialTab: 'sharing',
      onShare,
      initialData: {
        ...baseProps.initialData,
        ownerId: 'teacher-1',
        sharedWith: [],
      },
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('usuario@ejemplo.com')).toBeTruthy();
    });

    fireEvent.change(screen.getByPlaceholderText('usuario@ejemplo.com'), {
      target: { value: 'newuser@test.com' },
    });
    fireEvent.click(screen.getByText('Añadir'));

    fireEvent.click(screen.getByText('Aplicar cambios'));
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para compartir con newuser@test.com.')).toBeTruthy();
    });
  });

  it('shows apply-all feedback when permission update fails with denied permissions', async () => {
    const deniedError = new Error('permission-denied');
    deniedError.code = 'permission-denied';

    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    firestoreMocks.getDocs.mockResolvedValue({ docs: [] });

    const onShare = vi.fn().mockRejectedValue(deniedError);

    renderModal({
      initialTab: 'sharing',
      onShare,
      initialData: {
        ...baseProps.initialData,
        ownerId: 'teacher-1',
        sharedWith: [{ uid: 'teacher-2', email: 'teacher2@test.com', role: 'viewer', canEdit: false }],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('teacher2@test.com')).toBeTruthy();
    });

    const roleSelectors = screen.getAllByDisplayValue('Lector');
    fireEvent.change(roleSelectors[roleSelectors.length - 1], {
      target: { value: 'editor' },
    });

    fireEvent.click(screen.getByText('Aplicar cambios'));
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para actualizar permiso de teacher2@test.com.')).toBeTruthy();
    });
  });
});
