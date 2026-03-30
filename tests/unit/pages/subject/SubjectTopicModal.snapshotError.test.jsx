// tests/unit/pages/subject/SubjectTopicModal.snapshotError.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
});
