// tests/unit/pages/subject/SubjectGradesPanel.deleteConfirm.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SubjectGradesPanel from '../../../../src/pages/Subject/components/SubjectGradesPanel';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((database, ...path) => ({
    __kind: 'collection',
    database,
    path,
    collectionName: path[0],
  })),
  query: vi.fn((ref, ...clauses) => ({
    __kind: 'query',
    ref,
    clauses,
  })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  doc: vi.fn((database, ...path) => ({
    __kind: 'doc',
    database,
    path,
    collectionName: path[path.length - 2],
    id: path[path.length - 1],
  })),
  onSnapshot: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
  commit: vi.fn(),
  deleteCalls: [],
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
    collection: (...args) => firestoreMocks.collection(...args),
    query: (...args) => firestoreMocks.query(...args),
    where: (...args) => firestoreMocks.where(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    onSnapshot: (...args) => firestoreMocks.onSnapshot(...args),
    getDocs: (...args) => firestoreMocks.getDocs(...args),
    writeBatch: (...args) => firestoreMocks.writeBatch(...args),
    addDoc: (...args) => firestoreMocks.addDoc(...args),
    updateDoc: (...args) => firestoreMocks.updateDoc(...args),
    deleteDoc: (...args) => firestoreMocks.deleteDoc(...args),
    serverTimestamp: (...args) => firestoreMocks.serverTimestamp(...args),
  };
});

describe('SubjectGradesPanel evaluation delete confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.deleteCalls = [];

    firestoreMocks.commit.mockResolvedValue();
    firestoreMocks.writeBatch.mockImplementation(() => ({
      delete: vi.fn((docRef) => {
        firestoreMocks.deleteCalls.push(docRef);
      }),
      commit: firestoreMocks.commit,
    }));

    firestoreMocks.getDocs.mockResolvedValue({
      docs: [{ id: 'grade-1' }],
    });

    firestoreMocks.onSnapshot.mockImplementation((source, onNext) => {
      const collectionName = getCollectionName(source);

      if (collectionName === 'subjectEvaluationItems') {
        onNext({
          docs: [
            {
              id: 'extra-1',
              data: () => ({
                title: 'Exposicion oral',
                category: 'Presentacion',
                weight: 20,
                maxScore: 10,
              }),
            },
          ],
        });
      } else {
        onNext({ docs: [] });
      }

      return vi.fn();
    });

    vi.stubGlobal('confirm', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderPanel = () => {
    render(
      <SubjectGradesPanel
        user={{ uid: 'teacher-1', role: 'teacher' }}
        subject={{
          id: 'subject-1',
          institutionId: 'institution-1',
          gradingConfig: {
            mandatoryTestsWeight: 40,
            assignmentsWeight: 30,
            extrasWeight: 30,
          },
        }}
        topics={[]}
        classMembers={[]}
      />
    );
  };

  it('opens in-page confirmation and does not delete before explicit confirm', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('Exposicion oral')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));

    expect(screen.getByRole('heading', { name: /eliminar actividad extra/i })).toBeTruthy();
    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(firestoreMocks.getDocs).not.toHaveBeenCalled();
    expect(firestoreMocks.commit).not.toHaveBeenCalled();
  });

  it('deletes evaluation item and related grades only after modal confirmation', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('Exposicion oral')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));
    fireEvent.click(screen.getByRole('button', { name: /eliminar actividad/i }));

    await waitFor(() => {
      expect(firestoreMocks.getDocs).toHaveBeenCalledTimes(1);
      expect(firestoreMocks.commit).toHaveBeenCalledTimes(1);
    });

    const deletedPaths = firestoreMocks.deleteCalls.map((docRef) => docRef.path.join('/'));
    expect(deletedPaths).toContain('subjectEvaluationGrades/grade-1');
    expect(deletedPaths).toContain('subjectEvaluationItems/extra-1');
    expect(screen.queryByRole('heading', { name: /eliminar actividad extra/i })).toBeNull();
    expect(globalThis.confirm).not.toHaveBeenCalled();
  });
});
