// tests/unit/functions/subjectLifecycleAutomation.test.js
import { describe, expect, it } from 'vitest';
import {
  buildSubjectLifecycleAutomationUpdate,
  evaluateSubjectLifecycleAutomationRun,
  resolveSubjectLifecyclePhase,
  SUBJECT_LIFECYCLE_AUTOMATION_VERSION,
  SUBJECT_UNKNOWN_PASS_STATE_POLICY,
} from '../../../functions/security/subjectLifecycleAutomation.js';

describe('subject lifecycle automation helper', () => {
  it('returns null lifecycle phase when period boundaries are missing', () => {
    expect(resolveSubjectLifecyclePhase({
      subject: { id: 'subject-legacy', academicYear: '2025-2026' },
      referenceDate: new Date('2026-06-01T12:00:00.000Z'),
    })).toBeNull();
  });

  it('resolves active, extraordinary, and post-extraordinary phases', () => {
    const subject = {
      periodEndAt: '2026-06-20',
      periodExtraordinaryEndAt: '2026-07-10',
    };

    expect(resolveSubjectLifecyclePhase({
      subject,
      referenceDate: new Date('2026-06-10T10:00:00.000Z'),
    })).toBe('active');

    expect(resolveSubjectLifecyclePhase({
      subject,
      referenceDate: new Date('2026-06-30T10:00:00.000Z'),
    })).toBe('extraordinary');

    expect(resolveSubjectLifecyclePhase({
      subject,
      referenceDate: new Date('2026-07-20T10:00:00.000Z'),
    })).toBe('post_extraordinary');
  });

  it('applies delete policy updates and disables invite codes after extraordinary close', () => {
    const decision = buildSubjectLifecycleAutomationUpdate({
      subject: {
        id: 'subject-delete',
        periodEndAt: '2026-06-20',
        periodExtraordinaryEndAt: '2026-07-10',
        postCoursePolicy: 'delete',
        inviteCodeEnabled: true,
      },
      referenceDate: new Date('2026-07-20T12:00:00.000Z'),
    });

    expect(decision.lifecyclePhase).toBe('post_extraordinary');
    expect(decision.lifecyclePostCourseVisibility).toBe('hidden');
    expect(decision.shouldUpdate).toBe(true);
    expect(decision.updates).toMatchObject({
      lifecyclePhase: 'post_extraordinary',
      lifecyclePostCourseVisibility: 'hidden',
      lifecycleUnknownPassStatePolicy: SUBJECT_UNKNOWN_PASS_STATE_POLICY,
      lifecycleAutomationVersion: SUBJECT_LIFECYCLE_AUTOMATION_VERSION,
      inviteCodeEnabled: false,
      inviteCodeDisabledByLifecycle: true,
    });
  });

  it('applies retain_teacher_only policy after extraordinary close', () => {
    const decision = buildSubjectLifecycleAutomationUpdate({
      subject: {
        id: 'subject-teacher-only',
        periodEndAt: '2026-06-20',
        periodExtraordinaryEndAt: '2026-07-10',
        postCoursePolicy: 'retain_teacher_only',
      },
      referenceDate: new Date('2026-07-20T12:00:00.000Z'),
    });

    expect(decision.lifecyclePostCourseVisibility).toBe('teacher_only');
    expect(decision.updates.lifecyclePostCourseVisibility).toBe('teacher_only');
  });

  it('returns no-op when subject already matches derived lifecycle values', () => {
    const decision = buildSubjectLifecycleAutomationUpdate({
      subject: {
        id: 'subject-aligned',
        periodEndAt: '2026-06-20',
        periodExtraordinaryEndAt: '2026-07-10',
        postCoursePolicy: 'retain_all_no_join',
        lifecyclePhase: 'post_extraordinary',
        lifecyclePostCourseVisibility: 'all_no_join',
        lifecycleUnknownPassStatePolicy: SUBJECT_UNKNOWN_PASS_STATE_POLICY,
        lifecycleAutomationVersion: SUBJECT_LIFECYCLE_AUTOMATION_VERSION,
        inviteCodeEnabled: false,
        inviteCodeDisabledByLifecycle: true,
      },
      referenceDate: new Date('2026-07-20T12:00:00.000Z'),
    });

    expect(decision.shouldUpdate).toBe(false);
    expect(decision.updates).toEqual({});
  });

  it('builds deterministic dry-run summary for mixed subject states', () => {
    const summary = evaluateSubjectLifecycleAutomationRun({
      subjects: [
        {
          id: 'subject-update-1',
          data: {
            periodEndAt: '2026-06-20',
            periodExtraordinaryEndAt: '2026-07-10',
            postCoursePolicy: 'delete',
            inviteCodeEnabled: true,
          },
        },
        {
          id: 'subject-aligned',
          data: {
            periodEndAt: '2026-06-20',
            periodExtraordinaryEndAt: '2026-07-10',
            postCoursePolicy: 'retain_all_no_join',
            lifecyclePhase: 'post_extraordinary',
            lifecyclePostCourseVisibility: 'all_no_join',
            lifecycleUnknownPassStatePolicy: SUBJECT_UNKNOWN_PASS_STATE_POLICY,
            lifecycleAutomationVersion: SUBJECT_LIFECYCLE_AUTOMATION_VERSION,
            inviteCodeEnabled: false,
            inviteCodeDisabledByLifecycle: true,
          },
        },
        {
          id: 'subject-legacy',
          data: {
            academicYear: '2025-2026',
          },
        },
        {
          id: 'subject-trashed',
          data: {
            status: 'trashed',
            periodEndAt: '2026-06-20',
            periodExtraordinaryEndAt: '2026-07-10',
          },
        },
      ],
      referenceDate: new Date('2026-07-20T12:00:00.000Z'),
      maxPreviewSubjectIds: 10,
    });

    expect(summary.scannedSubjects).toBe(4);
    expect(summary.updatedSubjects).toBe(1);
    expect(summary.skippedSubjects).toBe(3);
    expect(summary.previewSubjectIds).toEqual(['subject-update-1']);
    expect(summary.updates).toHaveLength(1);
    expect(summary.updates[0]).toMatchObject({
      id: 'subject-update-1',
      updates: expect.objectContaining({
        lifecyclePhase: 'post_extraordinary',
        lifecyclePostCourseVisibility: 'hidden',
        inviteCodeEnabled: false,
      }),
    });
  });

  it('limits dry-run preview IDs to configured max', () => {
    const summary = evaluateSubjectLifecycleAutomationRun({
      subjects: [
        {
          id: 'subject-update-1',
          data: {
            periodEndAt: '2026-06-20',
            periodExtraordinaryEndAt: '2026-07-10',
            postCoursePolicy: 'delete',
            inviteCodeEnabled: true,
          },
        },
        {
          id: 'subject-update-2',
          data: {
            periodEndAt: '2026-06-20',
            periodExtraordinaryEndAt: '2026-07-10',
            postCoursePolicy: 'retain_teacher_only',
            inviteCodeEnabled: true,
          },
        },
      ],
      referenceDate: new Date('2026-07-20T12:00:00.000Z'),
      maxPreviewSubjectIds: 1,
    });

    expect(summary.updatedSubjects).toBe(2);
    expect(summary.previewSubjectIds).toEqual(['subject-update-1']);
  });
});
