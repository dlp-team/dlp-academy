// tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SubjectFormModal from '../../../../src/pages/Subject/modals/SubjectFormModal';

const periodLifecycleMocks = vi.hoisted(() => ({
  buildSubjectPeriodTimeline: vi.fn(() => ({
    periodStartAt: '2025-09-01',
    periodEndAt: '2025-11-30',
    periodExtraordinaryEndAt: '2025-12-10',
  })),
}));

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

vi.mock('../../../../src/utils/subjectPeriodLifecycleUtils', () => ({
  buildSubjectPeriodTimeline: (...args) => periodLifecycleMocks.buildSubjectPeriodTimeline(...args),
}));

vi.mock('../../../../src/pages/Subject/modals/subject-form/BasicInfoFields', () => ({
  default: ({ availableCourses }) => (
    <div data-testid="mock-basic-info-courses-count">{Array.isArray(availableCourses) ? availableCourses.length : 0}</div>
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

describe('SubjectFormModal course period schedule wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        academicCalendar: {
          startDate: '2025-09-01',
          ordinaryEndDate: '2026-06-30',
          extraordinaryEndDate: '2026-07-15',
          periodization: {
            mode: 'trimester',
            customLabel: '',
          },
        },
      }),
    });

    firestoreMocks.getDocs.mockImplementation(async (source) => {
      if (getCollectionName(source) === 'courses') {
        return {
          docs: [
            {
              id: 'course-1',
              data: () => ({
                name: '1º ESO',
                academicYear: '2025-2026',
                coursePeriodSchedule: {
                  periodType: 'trimester',
                  periods: [
                    { periodIndex: 1, periodStartAt: '2025-09-02', periodEndAt: '2025-11-29' },
                    { periodIndex: 2, periodStartAt: '2025-12-01', periodEndAt: '2026-03-10' },
                    { periodIndex: 3, periodStartAt: '2026-03-11', periodEndAt: '2026-06-20' },
                  ],
                  extraordinaryEndDate: '2026-07-01',
                },
              }),
            },
          ],
        };
      }

      return { docs: [] };
    });
  });

  it('passes selected course schedule to buildSubjectPeriodTimeline on save', async () => {
    const onSave = vi.fn();

    render(
      <SubjectFormModal
        isOpen
        onClose={() => {}}
        onSave={onSave}
        initialData={{
          id: 'subject-1',
          ownerId: 'teacher-1',
          ownerEmail: 'teacher@test.com',
          institutionId: 'institution-1',
          name: 'Matematicas',
          course: '1º ESO',
          courseId: 'course-1',
          periodType: 'trimester',
          periodLabel: 'Trimestre 1',
          periodIndex: 1,
          classIds: [],
          sharedWith: [],
        }}
        isEditing
        onShare={() => Promise.resolve()}
        onUnshare={() => Promise.resolve()}
        onTransferOwnership={() => Promise.resolve()}
        onDeleteShortcut={() => Promise.resolve()}
        user={{
          uid: 'teacher-1',
          role: 'teacher',
          institutionId: 'institution-1',
          email: 'teacher@test.com',
        }}
        allFolders={[]}
        initialTab="general"
        studentShortcutTagOnlyMode={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-basic-info-courses-count').textContent).toBe('1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    expect(periodLifecycleMocks.buildSubjectPeriodTimeline).toHaveBeenCalled();
    const lastCallArgs = periodLifecycleMocks.buildSubjectPeriodTimeline.mock.calls.at(-1)?.[0];

    expect(lastCallArgs).toMatchObject({
      periodType: 'trimester',
      periodIndex: 1,
      coursePeriodSchedule: {
        periodType: 'trimester',
        extraordinaryEndDate: '2026-07-01',
      },
    });
  });
});
