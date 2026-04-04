// tests/unit/services/transferPromotionService.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTransferPromotionPlan, runTransferPromotionDryRun } from '../../../src/services/transferPromotionService';

const serviceMocks = vi.hoisted(() => ({
  httpsCallable: vi.fn(),
  functionsRef: { __type: 'functions' },
  callableFn: vi.fn(),
}));

vi.mock('../../../src/firebase/config', () => ({
  functions: serviceMocks.functionsRef,
}));

vi.mock('firebase/functions', async () => {
  const actual = await vi.importActual('firebase/functions');
  return {
    ...actual,
    httpsCallable: serviceMocks.httpsCallable,
  };
});

describe('transferPromotionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.httpsCallable.mockReturnValue(serviceMocks.callableFn);
    serviceMocks.callableFn.mockResolvedValue({ data: {} });
  });

  it('calls runTransferPromotionDryRun callable with payload', async () => {
    const payload = {
      institutionId: 'inst-1',
      sourceAcademicYear: '2025-2026',
      targetAcademicYear: '2026-2027',
      mode: 'promote',
    };

    serviceMocks.callableFn.mockResolvedValue({
      data: {
        success: true,
        summary: {
          plannedCourseMappings: 3,
        },
      },
    });

    const result = await runTransferPromotionDryRun(payload);

    expect(serviceMocks.httpsCallable).toHaveBeenCalledWith(serviceMocks.functionsRef, 'runTransferPromotionDryRun');
    expect(serviceMocks.callableFn).toHaveBeenCalledWith(payload);
    expect(result).toEqual({
      success: true,
      summary: {
        plannedCourseMappings: 3,
      },
    });
  });

  it('returns default shape when callable has no data payload', async () => {
    serviceMocks.callableFn.mockResolvedValue({ data: null });

    const result = await runTransferPromotionDryRun({ institutionId: 'inst-1' });

    expect(result).toEqual({
      success: false,
      dryRunPayload: null,
      summary: null,
      mappings: {
        courses: [],
        classes: [],
        studentAssignments: [],
      },
      rollbackMetadata: null,
      warnings: [],
    });
  });

  it('calls applyTransferPromotionPlan callable with dry-run payload and mappings', async () => {
    serviceMocks.callableFn.mockResolvedValue({
      data: {
        success: true,
        requestId: 'transfer-promote-1',
      },
    });

    const result = await applyTransferPromotionPlan({
      dryRunPayload: {
        requestId: 'transfer-promote-1',
      },
      mappings: {
        courses: [{ sourceCourseId: 'source-1', targetCourseId: 'target-1' }],
        classes: [],
        studentAssignments: [],
      },
      rollbackMetadata: {
        rollbackId: 'rollback-1',
      },
    });

    expect(serviceMocks.httpsCallable).toHaveBeenCalledWith(serviceMocks.functionsRef, 'applyTransferPromotionPlan');
    expect(serviceMocks.callableFn).toHaveBeenCalledWith({
      dryRunPayload: {
        requestId: 'transfer-promote-1',
      },
      mappings: {
        courses: [{ sourceCourseId: 'source-1', targetCourseId: 'target-1' }],
        classes: [],
        studentAssignments: [],
      },
      rollbackMetadata: {
        rollbackId: 'rollback-1',
      },
    });
    expect(result).toEqual({
      success: true,
      requestId: 'transfer-promote-1',
    });
  });
});
