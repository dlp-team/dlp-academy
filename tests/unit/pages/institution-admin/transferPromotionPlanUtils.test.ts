// tests/unit/pages/institution-admin/transferPromotionPlanUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildTransferPromotionDryRunPayload,
  buildTransferRollbackMetadata,
  validateTransferPromotionPayload,
} from '../../../../src/pages/InstitutionAdminDashboard/utils/transferPromotionPlanUtils';

describe('transferPromotionPlanUtils', () => {
  it('validates required dry-run payload fields', () => {
    const result = validateTransferPromotionPayload({
      institutionId: '',
      sourceAcademicYear: '2026-2028',
      targetAcademicYear: '2027-2027',
      mode: 'clone',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('builds deterministic dry-run payload with defaults', () => {
    const payload = buildTransferPromotionDryRunPayload({
      institutionId: 'inst-1',
      sourceAcademicYear: '2025-2026',
      targetAcademicYear: '2026-2027',
      initiatedByUid: 'admin-1',
    });

    expect(payload.requestId).toContain('transfer-promote-');
    expect(payload.metadata.dryRun).toBe(true);
    expect(payload.options.copyStudentLinks).toBe(true);
    expect(payload.options.includeClassMemberships).toBe(true);
    expect(payload.mode).toBe('promote');
  });

  it('builds rollback metadata summary from planned entities', () => {
    const dryRunPayload = buildTransferPromotionDryRunPayload({
      institutionId: 'inst-1',
      sourceAcademicYear: '2025-2026',
      targetAcademicYear: '2026-2027',
      mode: 'transfer',
    });

    const rollbackMetadata = buildTransferRollbackMetadata({
      dryRunPayload,
      plannedCourses: [
        { sourceCourseId: 'course-a', targetCourseId: 'course-b', sourceAcademicYear: '2025-2026', targetAcademicYear: '2026-2027' },
      ],
      plannedClasses: [
        { sourceClassId: 'class-a', targetClassId: 'class-b', sourceCourseId: 'course-a', targetCourseId: 'course-b' },
      ],
      plannedStudentAssignments: [
        { studentId: 'student-1', fromCourseIds: ['course-a'], toCourseIds: ['course-b'] },
      ],
    });

    expect(rollbackMetadata.rollbackId).toContain('rollback-');
    expect(rollbackMetadata.summary).toEqual({
      plannedCourses: 1,
      plannedClasses: 1,
      plannedStudentAssignments: 1,
    });
    expect(rollbackMetadata.mode).toBe('transfer');
  });
});
