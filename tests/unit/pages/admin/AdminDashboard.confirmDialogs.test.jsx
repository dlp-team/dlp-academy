// tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import AdminDashboard from '../../../../src/pages/AdminDashboard/AdminDashboard';

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((database, collectionName) => ({
    __kind: 'collection',
    database,
    collectionName,
  })),
  query: vi.fn((base, ...clauses) => ({
    __kind: 'query',
    base,
    clauses,
  })),
  where: vi.fn((field, op, value) => ({
    __kind: 'where',
    field,
    op,
    value,
  })),
  limit: vi.fn((value) => ({
    __kind: 'limit',
    value,
  })),
  startAfter: vi.fn((value) => ({
    __kind: 'startAfter',
    value,
  })),
  doc: vi.fn((database, collectionName, id) => ({
    __kind: 'doc',
    database,
    collectionName,
    id,
  })),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
}));

const createSnapshot = (rows) => ({
  docs: rows.map((row) => ({
    id: row.id,
    data: () => row,
  })),
  size: rows.length,
});

const getCollectionName = (source) => {
  if (source?.__kind === 'query') {
    return source.base?.collectionName;
  }
  return source?.collectionName;
};

const getWhereValue = (source, field) => {
  if (source?.__kind !== 'query') return undefined;
  const clause = source.clauses.find((item) => item.__kind === 'where' && item.field === field);
  return clause?.value;
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => routerMocks.navigate,
  };
});

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('../../../../src/components/layout/Header', () => ({
  default: () => <header data-testid="admin-header-mock" />, 
}));

vi.mock('../../../../src/hooks/useIdleTimeout', () => ({
  useIdleTimeout: vi.fn(),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => firestoreMocks.collection(...args),
    query: (...args) => firestoreMocks.query(...args),
    where: (...args) => firestoreMocks.where(...args),
    limit: (...args) => firestoreMocks.limit(...args),
    startAfter: (...args) => firestoreMocks.startAfter(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    getDocs: (...args) => firestoreMocks.getDocs(...args),
    updateDoc: (...args) => firestoreMocks.updateDoc(...args),
    deleteDoc: (...args) => firestoreMocks.deleteDoc(...args),
    writeBatch: (...args) => firestoreMocks.writeBatch(...args),
    serverTimestamp: (...args) => firestoreMocks.serverTimestamp(...args),
  };
});

describe('AdminDashboard confirmation dialogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    firestoreMocks.updateDoc.mockResolvedValue();
    firestoreMocks.deleteDoc.mockResolvedValue();

    firestoreMocks.getDocs.mockImplementation(async (source) => {
      const collectionName = getCollectionName(source);
      const roleValue = getWhereValue(source, 'role');

      if (collectionName === 'institutions') {
        return createSnapshot([
          {
            id: 'inst-1',
            name: 'Institucion Demo',
            domain: 'demo.edu',
            enabled: true,
            type: 'school',
            city: 'Madrid',
            institutionAdministrators: ['admin@demo.edu'],
          },
        ]);
      }

      if (collectionName === 'users') {
        if (roleValue === 'teacher') {
          return createSnapshot([
            {
              id: 'user-1',
              displayName: 'Docente Demo',
              email: 'docente@demo.edu',
              role: 'teacher',
              enabled: true,
            },
          ]);
        }

        if (roleValue === 'student') {
          return createSnapshot([]);
        }

        return createSnapshot([
          {
            id: 'user-1',
            displayName: 'Docente Demo',
            email: 'docente@demo.edu',
            role: 'teacher',
            enabled: true,
          },
        ]);
      }

      return createSnapshot([]);
    });

    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderDashboard = () => {
    render(<AdminDashboard user={{ uid: 'admin-1', role: 'admin' }} />);
  };

  it('requires in-page confirmation before institution toggle and confirms explicitly', async () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /instituciones/i }));

    await waitFor(() => {
      expect(screen.getByText('Institucion Demo')).toBeTruthy();
    });

    fireEvent.click(screen.getByTitle(/^deshabilitar$/i));

    expect(screen.getByRole('heading', { name: /deshabilitar institución/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(firestoreMocks.updateDoc).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /deshabilitar institución/i })
    );

    await waitFor(() => {
      expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    });

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: 'institutions', id: 'inst-1' }),
      { enabled: false }
    );
  });

  it('cancels institution delete without invoking destructive handler', async () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /instituciones/i }));

    await waitFor(() => {
      expect(screen.getByText('Institucion Demo')).toBeTruthy();
    });

    fireEvent.click(screen.getByTitle(/^eliminar$/i));

    expect(screen.getByRole('heading', { name: /eliminar institución/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancelar/i }));

    expect(firestoreMocks.deleteDoc).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /eliminar institución/i })).toBeNull();
  });

  it('requires in-page confirmation before user toggle and confirms explicitly', async () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /usuarios/i }));

    await waitFor(() => {
      expect(screen.getByText('docente@demo.edu')).toBeTruthy();
    });

    fireEvent.click(screen.getByTitle(/^deshabilitar$/i));

    expect(screen.getByRole('heading', { name: /deshabilitar usuario/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(firestoreMocks.updateDoc).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /deshabilitar usuario/i })
    );

    await waitFor(() => {
      expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    });

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: 'users', id: 'user-1' }),
      { enabled: false }
    );
  });

  it('requires in-page confirmation before role change and updates only on confirm', async () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /usuarios/i }));

    await waitFor(() => {
      expect(screen.getByText('docente@demo.edu')).toBeTruthy();
    });

    const userRow = screen.getByText('docente@demo.edu').closest('tr');
    const roleSelect = within(userRow).getByRole('combobox');

    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    expect(screen.getByRole('heading', { name: /cambiar rol de usuario/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(firestoreMocks.updateDoc).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cambiar rol/i }));

    await waitFor(() => {
      expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    });

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: 'users', id: 'user-1' }),
      { role: 'admin' }
    );
  });

  it('uses last visible cursor when loading more users and appends next page results', async () => {
    const firstPageRows = Array.from({ length: 50 }, (_, index) => ({
      id: `user-${index + 1}`,
      displayName: `Usuario ${index + 1}`,
      email: `usuario${index + 1}@demo.edu`,
      role: 'teacher',
      enabled: true,
    }));
    const secondPageRows = [
      {
        id: 'user-51',
        displayName: 'Usuario 51',
        email: 'usuario51@demo.edu',
        role: 'student',
        enabled: true,
      },
    ];

    const firstUsersPageSnapshot = createSnapshot(firstPageRows);
    const secondUsersPageSnapshot = createSnapshot(secondPageRows);
    const expectedCursor = firstUsersPageSnapshot.docs[firstUsersPageSnapshot.docs.length - 1];

    firestoreMocks.getDocs.mockImplementation(async (source) => {
      const collectionName = getCollectionName(source);
      const roleValue = getWhereValue(source, 'role');

      if (collectionName === 'institutions') {
        return createSnapshot([]);
      }

      if (collectionName !== 'users') {
        return createSnapshot([]);
      }

      if (roleValue === 'teacher' || roleValue === 'student') {
        return createSnapshot([]);
      }

      const hasStartAfter = source?.__kind === 'query' && source.clauses.some((item) => item.__kind === 'startAfter');

      if (hasStartAfter) {
        return secondUsersPageSnapshot;
      }

      return firstUsersPageSnapshot;
    });

    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /usuarios/i }));

    await waitFor(() => {
      expect(screen.getByText('usuario1@demo.edu')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /cargar más usuarios/i }));

    await waitFor(() => {
      expect(screen.getByText('usuario51@demo.edu')).toBeTruthy();
    });

    expect(firestoreMocks.startAfter).toHaveBeenCalledWith(expectedCursor);
    expect(globalThis.confirm).not.toHaveBeenCalled();
  });
});
