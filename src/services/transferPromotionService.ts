// src/services/transferPromotionService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const RUN_TRANSFER_PROMOTION_DRY_RUN_CALLABLE = 'runTransferPromotionDryRun';
const APPLY_TRANSFER_PROMOTION_PLAN_CALLABLE = 'applyTransferPromotionPlan';

export const runTransferPromotionDryRun = async (payload: any) => {
  const callable = httpsCallable(functions, RUN_TRANSFER_PROMOTION_DRY_RUN_CALLABLE);
  const response: any = await callable(payload);

  return response?.data || {
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
  };
};

export const applyTransferPromotionPlan = async ({
  dryRunPayload,
  mappings,
  rollbackMetadata,
}: any) => {
  const callable = httpsCallable(functions, APPLY_TRANSFER_PROMOTION_PLAN_CALLABLE);
  const response: any = await callable({
    dryRunPayload,
    mappings,
    rollbackMetadata,
  });

  return response?.data || {
    success: false,
    alreadyApplied: false,
    requestId: dryRunPayload?.requestId || null,
    rollbackId: rollbackMetadata?.rollbackId || null,
    summary: null,
    warnings: [],
  };
};
