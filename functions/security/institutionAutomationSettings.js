// functions/security/institutionAutomationSettings.js
import { HttpsError } from 'firebase-functions/v2/https';

export const normalizeInstitutionAutomationSettings = (automationSettings = null) => ({
  transferPromotionEnabled: automationSettings?.transferPromotionEnabled !== false,
  subjectLifecycleAutomationEnabled: automationSettings?.subjectLifecycleAutomationEnabled !== false,
});

export const assertTransferPromotionAutomationEnabled = ({ institutionData = {}, institutionId = '' } = {}) => {
  const settings = normalizeInstitutionAutomationSettings(institutionData?.automationSettings);

  if (settings.transferPromotionEnabled === false) {
    throw new HttpsError(
      'failed-precondition',
      `Transfer promotion tool is disabled for institution ${String(institutionId || '').trim() || 'unknown'}.`
    );
  }

  return settings;
};
