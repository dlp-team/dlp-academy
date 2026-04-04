// src/services/transferPromotionService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const RUN_TRANSFER_PROMOTION_DRY_RUN_CALLABLE = 'runTransferPromotionDryRun';

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
