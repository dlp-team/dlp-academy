// functions/index.js
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

initializeApp();

const db = getFirestore();
const INSTITUTION_CODE_SALT = defineSecret('INSTITUTION_CODE_SALT');

const normalizePolicy = (policy = {}) => ({
  requireCode: policy.requireCode !== false,
  requireDomain: policy.requireDomain === true,
  allowedDomains: String(policy.allowedDomains || ''),
  rotationIntervalHours: Number(policy.rotationIntervalHours || 24),
});

const normalizeAllowedDomains = (domainsString) =>
  String(domainsString || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const emailDomain = (email) => {
  const parts = String(email || '').toLowerCase().split('@');
  return parts.length === 2 ? parts[1] : '';
};

const generateDynamicCodeServer = ({ institutionId, role, intervalHours, currentTimeMs, salt }) => {
  if (!institutionId || !role || !intervalHours) return '------';

  const windowMs = intervalHours * 60 * 60 * 1000;
  const currentWindow = Math.floor(currentTimeMs / windowMs);
  const seed = `${institutionId}-${role}-${currentWindow}-${salt}`;

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
  }

  const hexCode = Math.abs(hash).toString(16).toUpperCase();
  return hexCode.padStart(6, '0').slice(0, 6);
};

export const validateInstitutionalAccessCode = onCall(
  { 
    region: 'europe-west1',
    secrets: [INSTITUTION_CODE_SALT],
    invoker: 'public',
  },
  async (request) => {
    const verificationCode = String(request.data?.verificationCode || '').trim().toUpperCase();
    const normalizedEmail = String(request.data?.email || '').trim().toLowerCase();
    const userType = String(request.data?.userType || 'teacher').trim().toLowerCase();

    if (!verificationCode) {
      throw new HttpsError('invalid-argument', 'verificationCode is required.');
    }
    if (!normalizedEmail) {
      throw new HttpsError('invalid-argument', 'email is required.');
    }

    const role = userType === 'student' ? 'student' : 'teacher';
    const now = Date.now();
    const salt = INSTITUTION_CODE_SALT.value() || 'DLP_DEFAULT_SERVER_SALT';

    const institutionsSnap = await db.collection('institutions').select('accessPolicies').get();
    for (const doc of institutionsSnap.docs) {
      const institutionId = doc.id;
      const data = doc.data() || {};
      const policy = normalizePolicy(data.accessPolicies?.[`${role}s`] || data.accessPolicies?.[role] || {});

      if (!policy.requireCode) {
        continue;
      }

      if (policy.requireDomain) {
        const allowed = normalizeAllowedDomains(policy.allowedDomains);
        const domain = emailDomain(normalizedEmail);
        if (!domain || !allowed.includes(domain)) {
          continue;
        }
      }

      const currentCode = generateDynamicCodeServer({
        institutionId,
        role,
        intervalHours: policy.rotationIntervalHours,
        currentTimeMs: now,
        salt,
      });

      const previousCode = generateDynamicCodeServer({
        institutionId,
        role,
        intervalHours: policy.rotationIntervalHours,
        currentTimeMs: now - (policy.rotationIntervalHours * 60 * 60 * 1000),
        salt,
      });

      if (verificationCode === currentCode || verificationCode === previousCode) {
        return {
          valid: true,
          institutionId,
          role,
        };
      }
    }

    return {
      valid: false,
      institutionId: null,
      role,
    };
  }
);

export const getInstitutionalAccessCodePreview = onCall(
  {
    region: 'europe-west1',
    secrets: [INSTITUTION_CODE_SALT],
    invoker: 'public',
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication is required.');
    }

    const institutionId = String(request.data?.institutionId || '').trim();
    const role = String(request.data?.userType || 'teacher').trim().toLowerCase();
    const intervalHours = Number(request.data?.intervalHours || 24);

    if (!institutionId) {
      throw new HttpsError('invalid-argument', 'institutionId is required.');
    }
    if (!Number.isFinite(intervalHours) || intervalHours <= 0) {
      throw new HttpsError('invalid-argument', 'intervalHours must be a positive number.');
    }

    const userSnap = await db.collection('users').doc(request.auth.uid).get();
    if (!userSnap.exists) {
      throw new HttpsError('permission-denied', 'No user profile found.');
    }

    const userData = userSnap.data() || {};
    const isGlobalAdmin = userData.role === 'admin';
    const isInstitutionAdmin = userData.role === 'institutionadmin' && userData.institutionId === institutionId;

    if (!isGlobalAdmin && !isInstitutionAdmin) {
      throw new HttpsError('permission-denied', 'Not allowed to preview this code.');
    }

    const salt = INSTITUTION_CODE_SALT.value() || 'DLP_DEFAULT_SERVER_SALT';
    const now = Date.now();
    const code = generateDynamicCodeServer({ institutionId, role, intervalHours, currentTimeMs: now, salt });
    const windowMs = intervalHours * 60 * 60 * 1000;
    const validUntilMs = (Math.floor(now / windowMs) + 1) * windowMs;

    return {
      code,
      validUntilMs,
    };
  }
);
