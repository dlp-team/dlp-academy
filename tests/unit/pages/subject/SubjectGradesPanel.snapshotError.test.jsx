// tests/unit/pages/subject/SubjectGradesPanel.snapshotError.test.jsx
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SubjectGradesPanel from '../../../../src/pages/Subject/components/SubjectGradesPanel';

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((database, ...path) => ({
    __kind: 'collection',
    collectionName: path[path.length - 1],
    database,
    path,
  })),
  deleteDoc: vi.fn(),
  doc: vi.fn((database, ...path) => ({
    __kind: 'doc',
    collectionName: path[path.length - 2],
    database,
    id: path[path.length - 1],
    path,
  })),
  getDocs: vi.fn(async () => ({ docs: [] })),
  onSnapshot: vi.fn(),
  query: vi.fn((ref, ...clauses) => ({
    __kind: 'query',
    clauses,
    ref,
  })),
  serverTimestamp: vi.fn(() => 'server-ts'),
  updateDoc: vi.fn(),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  writeBatch: vi.fn(() => ({
    commit: vi.fn(),
    delete: vi.fn(),
  })),
}));

const getCollectionName = (source) => {
  if (source?.__kind === 'query') return source.ref?.collectionName;
  return source?.collectionName;
};

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    addDoc: (...args) => firestoreMocks.addDoc(...args),
    collection: (...args) => firestoreMocks.collection(...args),
    deleteDoc: (...args) => firestoreMocks.deleteDoc(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    getDocs: (...args) => firestoreMocks.getDocs(...args),
    onSnapshot: (...args) => firestoreMocks.onSnapshot(...args),
    query: (...args) => firestoreMocks.query(...args),
    serverTimestamp: (...args) => firestoreMocks.serverTimestamp(...args),
    updateDoc: (...args) => firestoreMocks.updateDoc(...args),
    where: (...args) => firestoreMocks.where(...args),
    writeBatch: (...args) => firestoreMocks.writeBatch(...args),
  };
});

describe('SubjectGradesPanel realtime listener feedback', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const renderPanel = () => {
    render(
      <SubjectGradesPanel
        user={{ uid: 'teacher-1', role: 'teacher' }}
        subject={{
          id: 'subject-1',
          gradingConfig: {
            mandatoryTestsWeight: 40,
            assignmentsWeight: 30,
            extrasWeight: 30,
          },
          institutionId: 'institution-1',
        }}
        topics={[]}
        classMembers={[]}
      />
    );
  };

  it('does not show listener feedback banner when snapshots succeed', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_source, onNext) => {
      onNext({ docs: [] });
      return vi.fn();
    });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('Bloques de nota (100% obligatorio)')).toBeTruthy();
    });

    expect(screen.queryByText('No se pudieron sincronizar las actividades extra del panel de notas.')).toBeNull();
  });

  it('shows inline listener feedback when evaluation-items snapshot fails', async () => {
    firestoreMocks.onSnapshot.mockImplementation((source, onNext, onError) => {
      if (getCollectionName(source) === 'subjectEvaluationItems') {
        onError(new Error('permission-denied'));
      } else {
        onNext({ docs: [] });
      }
      return vi.fn();
    });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('No se pudieron sincronizar las actividades extra del panel de notas.')).toBeTruthy();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
