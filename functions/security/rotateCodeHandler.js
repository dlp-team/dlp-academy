// functions/security/rotateCodeHandler.js
import { HttpsError } from 'firebase-functions/v2/https';
import { assertNonEmptyString, requireAuthUid, requirePreviewPermission } from './guards.js';

const normalizeRole = (value) => (String(value || '').trim().toLowerCase() === 'student' ? 'student' : 'teacher');
const normalizeRolePolicyKey = (role) => (role === 'student' ? 'students' : 'teachers');

const normalizePolicy = (policy = {}) => {
  const parsedInterval = Number(policy?.rotationIntervalHours || 24);
  const parsedVersion = Number(policy?.codeVersion || 0);

  return {
    requireCode: policy?.requireCode !== false,
    rotationIntervalHours: Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval : 24,
    codeVersion: Number.isFinite(parsedVersion) && parsedVersion >= 0 ? Math.floor(parsedVersion) : 0,
  };
};

export const createRotateInstitutionalAccessCodeNowHandler = ({
  dbInstance,
  secretProvider,
  codeGenerator,
  nowProvider = Date.now,
  serverTimestampProvider,
}) => async (request) => {
  const uid = requireAuthUid(request);

  const institutionId = assertNonEmptyString(request.data?.institutionId, 'institutionId');
  const role = normalizeRole(request.data?.userType);
  const rolePolicyKey = normalizeRolePolicyKey(role);

  const actorSnap = await dbInstance.collection('users').doc(uid).get();
  if (!actorSnap.exists) {
    throw new HttpsError('permission-denied', 'No user profile found.');
  }

  const actorData = actorSnap.data() || {};
  requirePreviewPermission({ userData: actorData, institutionId });

  const institutionRef = dbInstance.collection('institutions').doc(institutionId);
  const institutionSnap = await institutionRef.get();
  if (!institutionSnap.exists) {
    throw new HttpsError('not-found', 'Institution not found.');
  }

  const institutionData = institutionSnap.data() || {};
  const currentPolicy = normalizePolicy(institutionData?.accessPolicies?.[rolePolicyKey] || {});

  if (!currentPolicy.requireCode) {
    throw new HttpsError('failed-precondition', 'Access code is disabled for this role.');
  }

  const nextCodeVersion = currentPolicy.codeVersion + 1;
  await institutionRef.update({
    [`accessPolicies.${rolePolicyKey}.codeVersion`]: nextCodeVersion,
    [`accessPolicies.${rolePolicyKey}.codeVersionUpdatedAt`]: serverTimestampProvider(),
    updatedAt: serverTimestampProvider(),
  });

  const salt = secretProvider() || 'DLP_DEFAULT_SERVER_SALT';
  const now = nowProvider();
  const code = codeGenerator({
    institutionId,
    role,
    intervalHours: currentPolicy.rotationIntervalHours,
    codeVersion: nextCodeVersion,
    currentTimeMs: now,
    salt,
  });

  const windowMs = currentPolicy.rotationIntervalHours * 60 * 60 * 1000;
  const validUntilMs = (Math.floor(now / windowMs) + 1) * windowMs;

  return {
    code,
    validUntilMs,
    codeVersion: nextCodeVersion,
  };
};
