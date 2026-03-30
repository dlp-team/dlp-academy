// tests/unit/pages/topic/TopicAssignmentsSection.snapshotError.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TopicAssignmentsSection from '../../../../src/pages/Topic/components/TopicAssignmentsSection';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((database, collectionName) => ({
    __kind: 'collection',
    database,
    collectionName,
  })),
  query: vi.fn((ref, ...clauses) => ({
    __kind: 'query',
    ref,
    clauses,
  })),
  where: vi.fn((field, op, value) => ({
    __kind: 'where',
    field,
    op,
    value,
  })),
  doc: vi.fn((database, collectionName, id) => ({
    __kind: 'doc',
    database,
    collectionName,
    id,
  })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
}));

const storageMocks = vi.hoisted(() => ({
  ref: vi.fn(() => ({ __kind: 'storage-ref' })),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: 'mock-db' },
  storage: { __storage: 'mock-storage' },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args) => firestoreMocks.collection(...args),
    query: (...args) => firestoreMocks.query(...args),
    where: (...args) => firestoreMocks.where(...args),
    doc: (...args) => firestoreMocks.doc(...args),
    getDoc: (...args) => firestoreMocks.getDoc(...args),
    onSnapshot: (...args) => firestoreMocks.onSnapshot(...args),
    setDoc: (...args) => firestoreMocks.setDoc(...args),
    deleteDoc: (...args) => firestoreMocks.deleteDoc(...args),
    serverTimestamp: (...args) => firestoreMocks.serverTimestamp(...args),
  };
});

vi.mock('firebase/storage', async () => {
  const actual = await vi.importActual('firebase/storage');
  return {
    ...actual,
    ref: (...args) => storageMocks.ref(...args),
    uploadBytes: (...args) => storageMocks.uploadBytes(...args),
    getDownloadURL: (...args) => storageMocks.getDownloadURL(...args),
  };
});

const baseAssignments = [
  {
    id: 'assignment-1',
    title: 'Entrega parcial',
    description: 'Resuelve ejercicios base',
    dueAt: null,
    visibleToStudents: true,
    allowLateDelivery: false,
  },
];

describe('TopicAssignmentsSection snapshot error feedback', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows inline teacher feedback when submission-count listener fails', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_source, _onNext, onError) => {
      onError(new Error('permission-denied'));
      return vi.fn();
    });

    render(
      <TopicAssignmentsSection
        assignments={baseAssignments}
        topicId="topic-1"
        subjectId="subject-1"
        user={{ uid: 'teacher-1', role: 'teacher', institutionId: 'inst-1' }}
        permissions={{ canEdit: true }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No se pudieron cargar las entregas de las tareas.')).toBeTruthy();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[TOPIC_ASSIGNMENTS] Error loading submission counts:',
      expect.any(Error)
    );
  });

  it('shows inline student feedback when own-submissions listener fails', async () => {
    firestoreMocks.onSnapshot.mockImplementation((_source, _onNext, onError) => {
      onError(new Error('permission-denied'));
      return vi.fn();
    });

    render(
      <TopicAssignmentsSection
        assignments={baseAssignments}
        topicId="topic-1"
        subjectId="subject-1"
        user={{ uid: 'student-1', role: 'student', institutionId: 'inst-1' }}
        permissions={{ canEdit: false }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No se pudo cargar tu estado de entregas.')).toBeTruthy();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[TOPIC_ASSIGNMENTS] Error loading student submissions:',
      expect.any(Error)
    );
  });
});
