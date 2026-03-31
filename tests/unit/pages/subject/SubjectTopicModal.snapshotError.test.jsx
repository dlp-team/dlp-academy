// tests/unit/pages/subject/SubjectTopicModal.snapshotError.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SubjectTopicModal from '../../../../src/pages/Subject/modals/SubjectTopicModal';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((database, collectionName) => ({
    __kind: 'collection',
    database,
    collectionName,
  })),
  where: vi.fn((field, op, value) => ({
    __kind: 'where',
    field,
    op,
    value,
  })),
  orderBy: vi.fn((field, direction) => ({
    __kind: 'orderBy',
    field,
    direction,
  })),
  query: vi.fn((base, ...clauses) => ({
    __kind: 'query',
    base,
    clauses,
  })),
  onSnapshot: vi.fn(),
  writeBatch: vi.fn(),
  doc: vi.fn(),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('../../../../src/components/ui/SubjectIcon', () => ({
  default: () => <span data-testid="subject-icon-mock" />,
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => firestoreMocks.collection(...args),
    where: (...args) => firestoreMocks.where(...args),
    orderBy: (...args) => firestoreMocks.orderBy(...args),
    query: (...args) => firestoreMocks.query(...args),
    onSnapshot: (...args) => firestoreMocks.onSnapshot(...args),
    writeBatch: (...args) => firestoreMocks.writeBatch(...args),
    doc: (...args) => firestoreMocks.doc(...args),
  };
});

describe('SubjectTopicModal snapshot reliability', () => {
  let consoleErrorSpy;

  const createDataTransfer = () => {
    const data = {};
    return {
      setData: (type, value) => {
        data[type] = String(value);
      },
      getData: (type) => data[type] || '',
      effectAllowed: 'move',
      dropEffect: 'move',
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    subject: {
      id: 'subject-1',
      name: 'Matematicas',
      color: 'from-indigo-500 to-purple-500',
      icon: 'book',
    },
  };

  it('renders topic entries from snapshot data', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_source, onNext) => {
      onNext({
        docs: [
          {
            id: 'topic-1',
            data: () => ({ name: 'Tema de algebra', status: 'pending', order: 0 }),
          },
        ],
      });
      return vi.fn();
    });

    render(<SubjectTopicModal {...baseProps} />);

    await waitFor(() => {
      expect(screen.getByText('Tema de algebra')).toBeTruthy();
    });

    expect(screen.queryByText('No se pudieron cargar los temas. Intentalo de nuevo.')).toBeNull();
  });

  it('shows inline error feedback when snapshot listener fails', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_source, _onNext, onError) => {
      onError(new Error('permission-denied'));
      return vi.fn();
    });

    render(<SubjectTopicModal {...baseProps} />);

    await waitFor(() => {
      expect(screen.getByText('No se pudieron cargar los temas. Intentalo de nuevo.')).toBeTruthy();
    });

    expect(screen.getByText('Matematicas')).toBeTruthy();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('shows inline reorder feedback when commit fails with denied permissions', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_source, onNext) => {
      queueMicrotask(() => {
        onNext({
          docs: [
            {
              id: 'topic-1',
              data: () => ({ name: 'Tema de algebra', status: 'pending', order: 0 }),
            },
            {
              id: 'topic-2',
              data: () => ({ name: 'Tema de geometria', status: 'pending', order: 1 }),
            },
          ],
        });
      });
      return vi.fn();
    });

    const deniedError = new Error('permission-denied');
    deniedError.code = 'permission-denied';

    const batchUpdate = vi.fn();
    const batchCommit = vi.fn().mockRejectedValue(deniedError);
    firestoreMocks.writeBatch.mockReturnValue({
      update: batchUpdate,
      commit: batchCommit,
    });

    firestoreMocks.doc.mockImplementation((database, collectionName, id) => ({
      __kind: 'doc',
      database,
      collectionName,
      id,
    }));

    render(<SubjectTopicModal {...baseProps} />);

    await waitFor(() => {
      expect(screen.getByText('Tema de algebra')).toBeTruthy();
      expect(screen.getByText('Tema de geometria')).toBeTruthy();
    });

    const sourceCard = screen.getByText('Tema de algebra').closest('[draggable="true"]');
    const targetCard = screen.getByText('Tema de geometria').closest('[draggable="true"]');
    expect(sourceCard).toBeTruthy();
    expect(targetCard).toBeTruthy();

    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(sourceCard, { dataTransfer });
    fireEvent.dragOver(targetCard, { dataTransfer });
    fireEvent.drop(targetCard, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByText('No tienes permiso para reordenar los temas de esta asignatura.')).toBeTruthy();
    });

    expect(batchUpdate).toHaveBeenCalledTimes(2);
    expect(batchCommit).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error reordering topics:', expect.any(Error));
  });
});
