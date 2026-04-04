// tests/unit/functions/transfer-promotion-snapshot-utils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildExecutionSnapshotChecksum,
  buildSnapshotPersistencePlan,
  rebuildExecutionSnapshotFromChunks,
} from '../../../functions/security/transferPromotionSnapshotUtils.js';

describe('transferPromotionSnapshotUtils', () => {
  it('keeps inline snapshot mode when entry count is below threshold', () => {
    const executionSnapshot = {
      mode: 'promote',
      institutionId: 'inst-1',
      requestId: 'request-1',
      createdCourseIds: ['course-target-1'],
      createdClassIds: ['class-target-1'],
      studentStates: [],
      classMembershipStates: [],
    };

    const plan = buildSnapshotPersistencePlan({
      executionSnapshot,
      inlineEntryLimit: 10,
      chunkSize: 2,
    });

    expect(plan.snapshotStorageMode).toBe('inline');
    expect(plan.executionSnapshot).toMatchObject(executionSnapshot);
    expect(plan.snapshotChunkIds).toEqual([]);
    expect(plan.snapshotChunkCount).toBe(0);
  });

  it('chunks and rebuilds snapshots deterministically with checksum parity', () => {
    const executionSnapshot = {
      mode: 'transfer',
      institutionId: 'inst-1',
      requestId: 'request-2',
      createdCourseIds: ['course-target-1', 'course-target-2'],
      createdClassIds: ['class-target-1'],
      studentStates: [
        {
          studentId: 'student-1',
          courseId: 'course-source-1',
          courseIds: ['course-source-1'],
          enrolledCourseIds: ['course-source-1'],
        },
        {
          studentId: 'student-2',
          courseId: 'course-source-2',
          courseIds: ['course-source-2'],
          enrolledCourseIds: ['course-source-2'],
        },
      ],
      classMembershipStates: [
        {
          classId: 'class-source-1',
          studentIds: ['student-1', 'student-2'],
        },
      ],
    };

    const plan = buildSnapshotPersistencePlan({
      executionSnapshot,
      inlineEntryLimit: 0,
      chunkSize: 1,
    });

    expect(plan.snapshotStorageMode).toBe('chunked');
    expect(plan.executionSnapshot).toBeNull();
    expect(plan.snapshotChunkCount).toBe(plan.snapshotChunkIds.length);
    expect(plan.snapshotChunkCount).toBeGreaterThan(0);

    const rebuiltSnapshot = rebuildExecutionSnapshotFromChunks({
      baseSnapshot: {
        mode: executionSnapshot.mode,
        institutionId: executionSnapshot.institutionId,
        requestId: executionSnapshot.requestId,
      },
      chunkDocs: plan.snapshotChunks,
    });

    expect(rebuiltSnapshot).toMatchObject(executionSnapshot);
    expect(buildExecutionSnapshotChecksum(rebuiltSnapshot)).toBe(plan.snapshotChecksum);
  });

  it('handles large snapshots with stable chunk metadata and checksum parity', () => {
    const studentStates = Array.from({ length: 520 }, (_, index) => ({
      studentId: `student-${index + 1}`,
      courseId: `course-source-${(index % 4) + 1}`,
      courseIds: [`course-source-${(index % 4) + 1}`],
      enrolledCourseIds: [`course-source-${(index % 4) + 1}`],
    }));

    const classMembershipStates = Array.from({ length: 180 }, (_, index) => ({
      classId: `class-source-${index + 1}`,
      studentIds: [`student-${(index % 50) + 1}`, `student-${(index % 50) + 2}`],
    }));

    const executionSnapshot = {
      mode: 'promote',
      institutionId: 'inst-1',
      requestId: 'request-large',
      createdCourseIds: ['course-target-1', 'course-target-2', 'course-target-3'],
      createdClassIds: ['class-target-1', 'class-target-2', 'class-target-3'],
      studentStates,
      classMembershipStates,
    };

    const plan = buildSnapshotPersistencePlan({
      executionSnapshot,
      inlineEntryLimit: 120,
      chunkSize: 75,
    });

    expect(plan.snapshotStorageMode).toBe('chunked');
    expect(plan.snapshotChunkCount).toBeGreaterThan(8);
    expect(plan.snapshotChunkIds[0]).toMatch(/^0000-/);
    expect(plan.snapshotChunkIds.at(-1)).toMatch(/^\d{4}-/);

    const rebuiltSnapshot = rebuildExecutionSnapshotFromChunks({
      baseSnapshot: {
        mode: executionSnapshot.mode,
        institutionId: executionSnapshot.institutionId,
        requestId: executionSnapshot.requestId,
      },
      chunkDocs: plan.snapshotChunks,
    });

    expect(rebuiltSnapshot).toMatchObject(executionSnapshot);
    expect(buildExecutionSnapshotChecksum(rebuiltSnapshot)).toBe(plan.snapshotChecksum);
  });
});
