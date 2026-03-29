// functions/security/previewHandler.js
import { HttpsError } from 'firebase-functions/v2/https';
import {
  assertNonEmptyString,
  assertPositiveNumber,
  requireAuthUid,
  requirePreviewPermission,
} from './guards.js';

export const createGetInstitutionalAccessCodePreviewHandler = ({
  dbInstance,
  secretProvider,
  codeGenerator,
  nowProvider = Date.now,
}) => async (request) => {
  const uid = requireAuthUid(request);

  const institutionId = assertNonEmptyString(request.data?.institutionId, 'institutionId');
  const role = String(request.data?.userType || 'teacher').trim().toLowerCase();
  const intervalHours = assertPositiveNumber(request.data?.intervalHours || 24, 'intervalHours');

  const userSnap = await dbInstance.collection('users').doc(uid).get();
  if (!userSnap.exists) {
    throw new HttpsError('permission-denied', 'No user profile found.');
  }

  const userData = userSnap.data() || {};
  requirePreviewPermission({ userData, institutionId });

  const salt = secretProvider() || 'DLP_DEFAULT_SERVER_SALT';
  const now = nowProvider();
  const code = codeGenerator({ institutionId, role, intervalHours, currentTimeMs: now, salt });
  const windowMs = intervalHours * 60 * 60 * 1000;
  const validUntilMs = (Math.floor(now / windowMs) + 1) * windowMs;

  return {
    code,
    validUntilMs,
  };
};
