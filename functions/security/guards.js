// functions/security/guards.js
import { HttpsError } from 'firebase-functions/v2/https';

export const assertNonEmptyString = (value, fieldName) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    throw new HttpsError('invalid-argument', `${fieldName} is required.`);
  }
  return normalized;
};

export const assertPositiveNumber = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new HttpsError('invalid-argument', `${fieldName} must be a positive number.`);
  }
  return parsed;
};

export const requireAuthUid = (request) => {
  const uid = request?.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }
  return uid;
};

export const requirePreviewPermission = ({ userData, institutionId }) => {
  const isGlobalAdmin = userData?.role === 'admin';
  const isInstitutionAdmin = userData?.role === 'institutionadmin' && userData?.institutionId === institutionId;

  if (!isGlobalAdmin && !isInstitutionAdmin) {
    throw new HttpsError('permission-denied', 'Not allowed to preview this code.');
  }
};
