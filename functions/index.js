// functions/index.js
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import {
  assertNonEmptyString,
} from './security/guards.js';
import { createGetInstitutionalAccessCodePreviewHandler } from './security/previewHandler.js';

initializeApp();

const db = getFirestore();
const INSTITUTION_CODE_SALT = defineSecret('INSTITUTION_CODE_SALT');
const ALLOWED_ROLE_CLAIMS = new Set(['admin', 'institutionadmin', 'teacher', 'student']);

const normalizeRoleClaim = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return ALLOWED_ROLE_CLAIMS.has(normalized) ? normalized : 'student';
};

const normalizeInstitutionClaim = (value) => {
  const normalized = String(value || '').trim();
  return normalized.length > 0 ? normalized : null;
};

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
    const verificationCode = assertNonEmptyString(request.data?.verificationCode, 'verificationCode').toUpperCase();
    const normalizedEmail = assertNonEmptyString(request.data?.email, 'email').toLowerCase();
    const userType = String(request.data?.userType || 'teacher').trim().toLowerCase();

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

const getInstitutionalAccessCodePreviewHandler = createGetInstitutionalAccessCodePreviewHandler({
  dbInstance: db,
  secretProvider: () => INSTITUTION_CODE_SALT.value(),
  codeGenerator: generateDynamicCodeServer,
});

export const getInstitutionalAccessCodePreview = onCall(
  {
    region: 'europe-west1',
    secrets: [INSTITUTION_CODE_SALT],
    invoker: 'public',
  },
  getInstitutionalAccessCodePreviewHandler
);

export const syncCurrentUserClaims = onCall(
  {
    region: 'europe-west1',
    invoker: 'public',
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication is required.');
    }

    const uid = request.auth.uid;
    const userSnapshot = await db.collection('users').doc(uid).get();

    if (!userSnapshot.exists) {
      throw new HttpsError('failed-precondition', 'User profile not found.');
    }

    const userData = userSnapshot.data() || {};
    const role = normalizeRoleClaim(userData.role);
    const institutionId = normalizeInstitutionClaim(userData.institutionId);

    const authAdmin = getAuth();
    const userRecord = await authAdmin.getUser(uid);
    const currentClaims = userRecord.customClaims || {};
    const { role: _legacyRole, institutionId: _legacyInstitutionId, ...remainingClaims } = currentClaims;

    await authAdmin.setCustomUserClaims(uid, {
      ...remainingClaims,
      role,
      institutionId,
    });

    return {
      success: true,
      role,
      institutionId,
    };
  }
);
