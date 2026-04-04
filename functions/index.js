// functions/index.js
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import {
  assertNonEmptyString,
  requireAuthUid,
} from './security/guards.js';
import { createGetInstitutionalAccessCodePreviewHandler } from './security/previewHandler.js';
import { createRotateInstitutionalAccessCodeNowHandler } from './security/rotateCodeHandler.js';
import { createApplyTransferPromotionPlanHandler } from './security/transferPromotionApplyHandler.js';
import { createRunTransferPromotionDryRunHandler } from './security/transferPromotionDryRunHandler.js';
import { createRollbackTransferPromotionPlanHandler } from './security/transferPromotionRollbackHandler.js';
import { evaluateSubjectLifecycleAutomationRun } from './security/subjectLifecycleAutomation.js';
import {
  shouldQueueShortcutMoveOwnerMail,
  shouldQueueShortcutMoveRequesterMail,
} from './security/shortcutMoveRequestEmailUtils.js';

initializeApp();

const db = getFirestore();
const INSTITUTION_CODE_SALT = defineSecret('INSTITUTION_CODE_SALT');
const ALLOWED_ROLE_CLAIMS = new Set(['admin', 'institutionadmin', 'teacher', 'student']);
const ALLOWED_SHORTCUT_TYPES = new Set(['subject', 'folder']);
const MOVE_REQUEST_STATUS_PENDING = 'pending';
const MOVE_REQUEST_STATUS_APPROVED = 'approved';
const MOVE_REQUEST_STATUS_REJECTED = 'rejected';
const LIFECYCLE_AUTOMATION_CHUNK_SIZE = 400;

const normalizeRoleClaim = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return ALLOWED_ROLE_CLAIMS.has(normalized) ? normalized : 'student';
};

const normalizeInstitutionClaim = (value) => {
  const normalized = String(value || '').trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeEmail = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

const normalizeShortcutType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return ALLOWED_SHORTCUT_TYPES.has(normalized) ? normalized : null;
};

const sanitizeRequestIdFragment = (value) =>
  String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, '_')
    .slice(0, 120);

const buildShortcutMoveRequestId = ({ requesterUid, shortcutId, targetFolderId }) => {
  const uidPart = sanitizeRequestIdFragment(requesterUid);
  const shortcutPart = sanitizeRequestIdFragment(shortcutId);
  const folderPart = sanitizeRequestIdFragment(targetFolderId);
  return `shortcut_move_request_${uidPart}_${shortcutPart}_${folderPart}`;
};

const dedupeSharedWithEntries = (entries = []) => {
  const byKey = new Map();

  entries.forEach((entry) => {
    const uid = String(entry?.uid || '').trim();
    const email = normalizeEmail(entry?.email);
    const key = uid || (email ? `email:${email}` : null);
    if (!key || byKey.has(key)) return;
    byKey.set(key, {
      ...(uid ? { uid } : {}),
      ...(email ? { email } : {}),
      ...(entry?.displayName ? { displayName: String(entry.displayName) } : {}),
      ...(entry?.name ? { name: String(entry.name) } : {}),
    });
  });

  return Array.from(byKey.values());
};

const mergeSharedWithUids = (left = [], right = []) => {
  const merged = new Set();
  [...left, ...right].forEach((uid) => {
    const normalized = String(uid || '').trim();
    if (normalized) merged.add(normalized);
  });
  return Array.from(merged);
};

const extractFolderShareSnapshot = (folderData = {}, folderOwnerUid = null) => {
  const folderSharedWith = Array.isArray(folderData?.sharedWith) ? folderData.sharedWith : [];
  const folderSharedWithUids = Array.isArray(folderData?.sharedWithUids) ? folderData.sharedWithUids : [];
  const ownerUid = String(folderOwnerUid || '').trim();
  const ownerEmail = normalizeEmail(folderData?.ownerEmail || null);

  const normalizedFolderSharedWith = dedupeSharedWithEntries([
    ...folderSharedWith,
    ...(ownerUid ? [{ uid: ownerUid, email: ownerEmail || undefined }] : []),
  ]);

  const normalizedFolderSharedWithUids = mergeSharedWithUids(
    folderSharedWithUids,
    ownerUid ? [ownerUid] : []
  );

  return {
    sharedWith: normalizedFolderSharedWith,
    sharedWithUids: normalizedFolderSharedWithUids,
  };
};

const createMailQueuePayload = ({
  to,
  subject,
  title,
  bodyText,
  metadata,
}) => ({
  to: [to],
  message: {
    subject,
    text: `${title}\n\n${bodyText}`,
  },
  metadata,
  createdAt: FieldValue.serverTimestamp(),
});

const normalizePolicy = (policy = {}) => ({
  requireCode: policy.requireCode !== false,
  requireDomain: policy.requireDomain === true,
  allowedDomains: String(policy.allowedDomains || ''),
  rotationIntervalHours: Number(policy.rotationIntervalHours || 24),
  codeVersion: Number.isFinite(Number(policy.codeVersion)) && Number(policy.codeVersion) >= 0
    ? Math.floor(Number(policy.codeVersion))
    : 0,
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

const generateDynamicCodeServer = ({
  institutionId,
  role,
  intervalHours,
  codeVersion = 0,
  currentTimeMs,
  salt,
}) => {
  if (!institutionId || !role || !intervalHours) return '------';

  const windowMs = intervalHours * 60 * 60 * 1000;
  const currentWindow = Math.floor(currentTimeMs / windowMs);
  const normalizedCodeVersion = Number.isFinite(Number(codeVersion)) && Number(codeVersion) >= 0
    ? Math.floor(Number(codeVersion))
    : 0;
  const seed = `${institutionId}-${role}-${currentWindow}-${normalizedCodeVersion}-${salt}`;

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
        codeVersion: policy.codeVersion,
        currentTimeMs: now,
        salt,
      });

      const previousCode = generateDynamicCodeServer({
        institutionId,
        role,
        intervalHours: policy.rotationIntervalHours,
        codeVersion: policy.codeVersion,
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

const rotateInstitutionalAccessCodeNowHandler = createRotateInstitutionalAccessCodeNowHandler({
  dbInstance: db,
  secretProvider: () => INSTITUTION_CODE_SALT.value(),
  codeGenerator: generateDynamicCodeServer,
  serverTimestampProvider: () => FieldValue.serverTimestamp(),
});

const runTransferPromotionDryRunHandler = createRunTransferPromotionDryRunHandler({
  dbInstance: db,
});

const applyTransferPromotionPlanHandler = createApplyTransferPromotionPlanHandler({
  dbInstance: db,
  serverTimestampProvider: () => FieldValue.serverTimestamp(),
});

const rollbackTransferPromotionPlanHandler = createRollbackTransferPromotionPlanHandler({
  dbInstance: db,
  serverTimestampProvider: () => FieldValue.serverTimestamp(),
});

export const getInstitutionalAccessCodePreview = onCall(
  {
    region: 'europe-west1',
    secrets: [INSTITUTION_CODE_SALT],
    invoker: 'public',
  },
  getInstitutionalAccessCodePreviewHandler
);

export const rotateInstitutionalAccessCodeNow = onCall(
  {
    region: 'europe-west1',
    secrets: [INSTITUTION_CODE_SALT],
    invoker: 'public',
  },
  rotateInstitutionalAccessCodeNowHandler
);

export const runTransferPromotionDryRun = onCall(
  {
    region: 'europe-west1',
    invoker: 'public',
  },
  runTransferPromotionDryRunHandler
);

export const applyTransferPromotionPlan = onCall(
  {
    region: 'europe-west1',
    invoker: 'public',
  },
  applyTransferPromotionPlanHandler
);

export const rollbackTransferPromotionPlan = onCall(
  {
    region: 'europe-west1',
    invoker: 'public',
  },
  rollbackTransferPromotionPlanHandler
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

const commitOperationsInChunks = async (operations = [], chunkSize = 400) => {
  for (let index = 0; index < operations.length; index += chunkSize) {
    const batch = db.batch();
    const chunk = operations.slice(index, index + chunkSize);
    chunk.forEach((applyOperation) => applyOperation(batch));
    await batch.commit();
  }
};

const runSubjectLifecycleAutomationInternal = async ({
  institutionId = null,
  referenceDate = new Date(),
  triggeredBy = 'system',
  dryRun = false,
  maxPreviewSubjectIds = 25,
} = {}) => {
  let query = db.collection('subjects');
  if (institutionId) {
    query = query.where('institutionId', '==', institutionId);
  }

  const subjectsSnapshot = await query.get();
  const subjectsForEvaluation = subjectsSnapshot.docs.map((subjectDoc) => ({
    id: subjectDoc.id,
    data: subjectDoc.data() || {},
  }));

  const lifecycleEvaluation = evaluateSubjectLifecycleAutomationRun({
    subjects: subjectsForEvaluation,
    referenceDate,
    maxPreviewSubjectIds,
  });

  const subjectRefsById = new Map();
  subjectsSnapshot.docs.forEach((subjectDoc) => {
    subjectRefsById.set(subjectDoc.id, subjectDoc.ref);
  });

  const operations = [];

  lifecycleEvaluation.updates.forEach((entry) => {
    const subjectRef = subjectRefsById.get(entry.id);
    if (!subjectRef) return;

    operations.push((batch) => {
      batch.update(subjectRef, {
        ...entry.updates,
        lifecycleEvaluatedAt: FieldValue.serverTimestamp(),
        lifecycleAutomationTrigger: String(triggeredBy || 'system'),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  });

  if (!dryRun) {
    await commitOperationsInChunks(operations, LIFECYCLE_AUTOMATION_CHUNK_SIZE);
  }

  return {
    institutionId,
    dryRun,
    scannedSubjects: lifecycleEvaluation.scannedSubjects,
    updatedSubjects: lifecycleEvaluation.updatedSubjects,
    skippedSubjects: lifecycleEvaluation.skippedSubjects,
    committedUpdates: dryRun ? 0 : lifecycleEvaluation.updatedSubjects,
    previewSubjectIds: lifecycleEvaluation.previewSubjectIds,
  };
};

export const runSubjectLifecycleAutomation = onCall(
  {
    region: 'europe-west1',
    invoker: 'public',
  },
  async (request) => {
    const actorUid = requireAuthUid(request);

    const actorSnapshot = await db.collection('users').doc(actorUid).get();
    if (!actorSnapshot.exists) {
      throw new HttpsError('failed-precondition', 'Actor profile not found.');
    }

    const actorData = actorSnapshot.data() || {};
    const actorRole = normalizeRoleClaim(actorData.role);
    const actorInstitutionId = normalizeInstitutionClaim(actorData.institutionId);
    const requestedInstitutionId = normalizeInstitutionClaim(request.data?.institutionId);
    const dryRun = request.data?.dryRun === true;
    const parsedMaxPreviewSubjectIds = Number(request.data?.maxPreviewSubjectIds);
    const maxPreviewSubjectIds = Number.isFinite(parsedMaxPreviewSubjectIds)
      ? Math.max(0, Math.min(100, Math.floor(parsedMaxPreviewSubjectIds)))
      : 25;

    const canRunAsGlobalAdmin = actorRole === 'admin';
    const canRunAsInstitutionAdmin = actorRole === 'institutionadmin';

    if (!canRunAsGlobalAdmin && !canRunAsInstitutionAdmin) {
      throw new HttpsError('permission-denied', 'Only admins can trigger lifecycle automation.');
    }

    let scopedInstitutionId = requestedInstitutionId;

    if (canRunAsInstitutionAdmin) {
      if (!actorInstitutionId) {
        throw new HttpsError('failed-precondition', 'Institution admin profile is missing institutionId.');
      }

      if (requestedInstitutionId && requestedInstitutionId !== actorInstitutionId) {
        throw new HttpsError('permission-denied', 'Institution admins can only run automation for their own institution.');
      }

      scopedInstitutionId = actorInstitutionId;
    }

    const result = await runSubjectLifecycleAutomationInternal({
      institutionId: scopedInstitutionId || null,
      triggeredBy: `manual:${actorUid}`,
      dryRun,
      maxPreviewSubjectIds,
    });

    return {
      success: true,
      ...result,
    };
  }
);

export const reconcileSubjectLifecycleAutomation = onSchedule(
  {
    region: 'europe-west1',
    schedule: 'every day 02:15',
    timeZone: 'Europe/Madrid',
  },
  async () => {
    return runSubjectLifecycleAutomationInternal({
      institutionId: null,
      triggeredBy: 'schedule:daily',
      dryRun: false,
      maxPreviewSubjectIds: 0,
    });
  }
);

const collectFolderSubtreeIds = async (rootFolderId) => {
  const visited = new Set();
  const queue = [rootFolderId];

  while (queue.length > 0) {
    const currentFolderId = queue.shift();
    if (!currentFolderId || visited.has(currentFolderId)) continue;
    visited.add(currentFolderId);

    const childFoldersSnapshot = await db
      .collection('folders')
      .where('parentId', '==', currentFolderId)
      .get();

    childFoldersSnapshot.docs.forEach((childDoc) => {
      if (!visited.has(childDoc.id)) {
        queue.push(childDoc.id);
      }
    });
  }

  return Array.from(visited);
};

const ensureFolderMoveDoesNotCreateCycle = async ({ sourceFolderId, targetFolderId }) => {
  let cursorId = targetFolderId;
  let safety = 0;

  while (cursorId && safety < 250) {
    if (cursorId === sourceFolderId) {
      throw new HttpsError('failed-precondition', 'Cannot move a folder into its own subtree.');
    }

    const cursorSnapshot = await db.collection('folders').doc(cursorId).get();
    if (!cursorSnapshot.exists) break;

    const cursorData = cursorSnapshot.data() || {};
    cursorId = normalizeInstitutionClaim(cursorData.parentId);
    safety += 1;
  }
};

export const createShortcutMoveRequest = onCall(
  {
    region: 'europe-west1',
    invoker: 'public',
  },
  async (request) => {
    const requesterUid = requireAuthUid(request);
    const shortcutId = assertNonEmptyString(request.data?.shortcutId, 'shortcutId');
    const targetFolderId = assertNonEmptyString(request.data?.targetFolderId, 'targetFolderId');
    const requestedTargetId = assertNonEmptyString(request.data?.targetId, 'targetId');
    const requestedShortcutType = normalizeShortcutType(request.data?.shortcutType);

    if (!requestedShortcutType) {
      throw new HttpsError('invalid-argument', 'shortcutType must be subject or folder.');
    }

    const requesterSnapshot = await db.collection('users').doc(requesterUid).get();
    if (!requesterSnapshot.exists) {
      throw new HttpsError('failed-precondition', 'Requester profile not found.');
    }

    const requesterData = requesterSnapshot.data() || {};
    const requesterEmail = normalizeEmail(requesterData.email || request.auth?.token?.email || null);
    const requesterInstitutionId = normalizeInstitutionClaim(requesterData.institutionId);

    const shortcutSnapshot = await db.collection('shortcuts').doc(shortcutId).get();
    if (!shortcutSnapshot.exists) {
      throw new HttpsError('not-found', 'Shortcut not found.');
    }

    const shortcutData = shortcutSnapshot.data() || {};
    const shortcutType = normalizeShortcutType(shortcutData.targetType);

    if (shortcutData.ownerId !== requesterUid) {
      throw new HttpsError('permission-denied', 'Only the shortcut owner can create a move request.');
    }

    if (!shortcutType || shortcutType !== requestedShortcutType) {
      throw new HttpsError('invalid-argument', 'Shortcut type mismatch.');
    }

    if (String(shortcutData.targetId || '').trim() !== requestedTargetId) {
      throw new HttpsError('invalid-argument', 'Shortcut target mismatch.');
    }

    const shortcutInstitutionId = normalizeInstitutionClaim(shortcutData.institutionId);
    if (
      requesterInstitutionId
      && shortcutInstitutionId
      && requesterInstitutionId !== shortcutInstitutionId
    ) {
      throw new HttpsError('permission-denied', 'Shortcut institution does not match requester institution.');
    }

    const targetFolderSnapshot = await db.collection('folders').doc(targetFolderId).get();
    if (!targetFolderSnapshot.exists) {
      throw new HttpsError('not-found', 'Target folder not found.');
    }

    const targetFolderData = targetFolderSnapshot.data() || {};
    const targetFolderOwnerUid = String(targetFolderData.ownerId || targetFolderData.uid || '').trim();
    const targetFolderInstitutionId = normalizeInstitutionClaim(targetFolderData.institutionId);

    if (targetFolderData.isShared !== true) {
      throw new HttpsError('failed-precondition', 'Target folder must be shared.');
    }

    if (!targetFolderOwnerUid) {
      throw new HttpsError('failed-precondition', 'Target folder owner is missing.');
    }

    if (targetFolderOwnerUid === requesterUid) {
      throw new HttpsError('failed-precondition', 'Owner can move the original item directly without a request.');
    }

    if (
      requesterInstitutionId
      && targetFolderInstitutionId
      && requesterInstitutionId !== targetFolderInstitutionId
    ) {
      throw new HttpsError('permission-denied', 'Target folder belongs to another institution.');
    }

    const requestId = buildShortcutMoveRequestId({
      requesterUid,
      shortcutId,
      targetFolderId,
    });

    const requestRef = db.collection('shortcutMoveRequests').doc(requestId);
    const existingRequestSnapshot = await requestRef.get();
    if (
      existingRequestSnapshot.exists
      && existingRequestSnapshot.data()?.status === MOVE_REQUEST_STATUS_PENDING
    ) {
      throw new HttpsError('already-exists', 'A pending move request already exists for this shortcut and folder.');
    }

    const ownerUserSnapshot = await db.collection('users').doc(targetFolderOwnerUid).get();
    const ownerData = ownerUserSnapshot.exists ? ownerUserSnapshot.data() || {} : {};
    const ownerEmail = normalizeEmail(ownerData.email);

    const institutionId = targetFolderInstitutionId || shortcutInstitutionId || requesterInstitutionId || null;
    const folderName = String(targetFolderData.name || 'carpeta compartida');
    const actorLabel = requesterEmail || 'Un usuario';

    const ownerNotificationRef = db
      .collection('notifications')
      .doc(`shortcut_move_request_owner_${requestId}`);

    const batch = db.batch();

    batch.set(requestRef, {
      requesterUid,
      requesterEmail,
      requesterInstitutionId: requesterInstitutionId || null,
      shortcutId,
      shortcutType,
      targetId: shortcutData.targetId,
      targetFolderId,
      targetFolderName: folderName,
      targetFolderOwnerUid,
      institutionId,
      status: MOVE_REQUEST_STATUS_PENDING,
      resolution: null,
      resolvedAt: null,
      resolvedByUid: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(ownerNotificationRef, {
      userId: targetFolderOwnerUid,
      institutionId,
      read: false,
      type: 'shortcut_move_request',
      shortcutMoveRequestId: requestId,
      shortcutMoveRequestStatus: MOVE_REQUEST_STATUS_PENDING,
      shortcutId,
      shortcutType,
      targetId: shortcutData.targetId,
      targetFolderId,
      targetFolderName: folderName,
      requesterUid,
      requesterEmail,
      title: 'Solicitud de movimiento pendiente',
      message: `${actorLabel} solicita mover un elemento original a "${folderName}".`,
      createdAt: FieldValue.serverTimestamp(),
    });

    if (shouldQueueShortcutMoveOwnerMail({ ownerEmail, ownerData })) {
      const ownerMailRef = db.collection('mail').doc(`shortcut_move_request_owner_mail_${requestId}`);
      batch.set(ownerMailRef, createMailQueuePayload({
        to: ownerEmail,
        subject: 'Nueva solicitud de movimiento en carpeta compartida',
        title: 'Tienes una solicitud pendiente',
        bodyText: `${actorLabel} solicita mover un elemento original a "${folderName}". Revisa la notificacion en DLP Academy para aprobar o rechazar.`,
        metadata: {
          type: 'shortcut_move_request',
          requestId,
          requesterUid,
          targetFolderOwnerUid,
          institutionId,
        },
      }));
    }

    await batch.commit();

    return {
      success: true,
      requestId,
      status: MOVE_REQUEST_STATUS_PENDING,
      targetFolderOwnerUid,
    };
  }
);

export const resolveShortcutMoveRequest = onCall(
  {
    region: 'europe-west1',
    invoker: 'public',
  },
  async (request) => {
    const actorUid = requireAuthUid(request);
    const requestId = assertNonEmptyString(request.data?.requestId, 'requestId');
    const resolution = String(request.data?.resolution || '').trim().toLowerCase();

    if (resolution !== MOVE_REQUEST_STATUS_APPROVED && resolution !== MOVE_REQUEST_STATUS_REJECTED) {
      throw new HttpsError('invalid-argument', 'resolution must be approve or reject.');
    }

    const actorSnapshot = await db.collection('users').doc(actorUid).get();
    if (!actorSnapshot.exists) {
      throw new HttpsError('failed-precondition', 'Actor profile not found.');
    }

    const actorData = actorSnapshot.data() || {};
    const actorRole = normalizeRoleClaim(actorData.role);
    const actorInstitutionId = normalizeInstitutionClaim(actorData.institutionId);

    const requestRef = db.collection('shortcutMoveRequests').doc(requestId);
    const requestSnapshot = await requestRef.get();
    if (!requestSnapshot.exists) {
      throw new HttpsError('not-found', 'Move request not found.');
    }

    const moveRequest = requestSnapshot.data() || {};
    const requestInstitutionId = normalizeInstitutionClaim(moveRequest.institutionId);

    const canResolveAsOwner = moveRequest.targetFolderOwnerUid === actorUid;
    const canResolveAsGlobalAdmin = actorRole === 'admin';
    const canResolveAsInstitutionAdmin = actorRole === 'institutionadmin'
      && actorInstitutionId
      && requestInstitutionId
      && actorInstitutionId === requestInstitutionId;

    if (!canResolveAsOwner && !canResolveAsGlobalAdmin && !canResolveAsInstitutionAdmin) {
      throw new HttpsError('permission-denied', 'Only folder owner or admins can resolve this move request.');
    }

    if (moveRequest.status !== MOVE_REQUEST_STATUS_PENDING) {
      throw new HttpsError('failed-precondition', 'Move request is already resolved.');
    }

    const requesterUid = assertNonEmptyString(moveRequest.requesterUid, 'requesterUid');
    const shortcutType = normalizeShortcutType(moveRequest.shortcutType);
    const targetId = assertNonEmptyString(moveRequest.targetId, 'targetId');
    const targetFolderId = assertNonEmptyString(moveRequest.targetFolderId, 'targetFolderId');

    if (!shortcutType) {
      throw new HttpsError('failed-precondition', 'Move request shortcut type is invalid.');
    }

    const targetFolderSnapshot = await db.collection('folders').doc(targetFolderId).get();
    if (!targetFolderSnapshot.exists) {
      throw new HttpsError('not-found', 'Target folder no longer exists.');
    }

    const targetFolderData = targetFolderSnapshot.data() || {};
    if (targetFolderData.isShared !== true) {
      throw new HttpsError('failed-precondition', 'Target folder is no longer shared.');
    }

    const targetFolderOwnerUid = String(targetFolderData.ownerId || targetFolderData.uid || '').trim();
    if (!targetFolderOwnerUid) {
      throw new HttpsError('failed-precondition', 'Target folder owner is missing.');
    }

    const { sharedWith, sharedWithUids } = extractFolderShareSnapshot(targetFolderData, targetFolderOwnerUid);
    const institutionId = normalizeInstitutionClaim(targetFolderData.institutionId)
      || normalizeInstitutionClaim(moveRequest.institutionId)
      || null;

    const operations = [];

    if (resolution === MOVE_REQUEST_STATUS_APPROVED) {
      if (shortcutType === 'subject') {
        const sourceSubjectRef = db.collection('subjects').doc(targetId);
        const sourceSubjectSnapshot = await sourceSubjectRef.get();
        if (!sourceSubjectSnapshot.exists) {
          throw new HttpsError('not-found', 'Source subject no longer exists.');
        }

        const sourceSubjectData = sourceSubjectSnapshot.data() || {};
        const mergedSharedWithUids = mergeSharedWithUids(sourceSubjectData.sharedWithUids || [], sharedWithUids);
        const mergedSharedWith = dedupeSharedWithEntries([
          ...(Array.isArray(sourceSubjectData.sharedWith) ? sourceSubjectData.sharedWith : []),
          ...sharedWith,
        ]);

        operations.push((batch) => {
          batch.update(sourceSubjectRef, {
            folderId: targetFolderId,
            isShared: mergedSharedWithUids.length > 0,
            sharedWithUids: mergedSharedWithUids,
            sharedWith: mergedSharedWith,
            updatedAt: FieldValue.serverTimestamp(),
          });
        });
      }

      if (shortcutType === 'folder') {
        const sourceFolderRef = db.collection('folders').doc(targetId);
        const sourceFolderSnapshot = await sourceFolderRef.get();
        if (!sourceFolderSnapshot.exists) {
          throw new HttpsError('not-found', 'Source folder no longer exists.');
        }

        await ensureFolderMoveDoesNotCreateCycle({
          sourceFolderId: targetId,
          targetFolderId,
        });

        const folderSubtreeIds = await collectFolderSubtreeIds(targetId);

        for (const folderId of folderSubtreeIds) {
          const folderSnapshot = await db.collection('folders').doc(folderId).get();
          if (!folderSnapshot.exists) continue;

          const folderData = folderSnapshot.data() || {};
          const mergedFolderSharedWithUids = mergeSharedWithUids(folderData.sharedWithUids || [], sharedWithUids);
          const mergedFolderSharedWith = dedupeSharedWithEntries([
            ...(Array.isArray(folderData.sharedWith) ? folderData.sharedWith : []),
            ...sharedWith,
          ]);

          const folderUpdatePayload = {
            ...(folderId === targetId ? { parentId: targetFolderId } : {}),
            isShared: mergedFolderSharedWithUids.length > 0,
            sharedWithUids: mergedFolderSharedWithUids,
            sharedWith: mergedFolderSharedWith,
            updatedAt: FieldValue.serverTimestamp(),
          };

          operations.push((batch) => {
            batch.update(db.collection('folders').doc(folderId), folderUpdatePayload);
          });

          const subjectsSnapshot = await db
            .collection('subjects')
            .where('folderId', '==', folderId)
            .get();

          subjectsSnapshot.docs.forEach((subjectDoc) => {
            const subjectData = subjectDoc.data() || {};
            const mergedSubjectSharedWithUids = mergeSharedWithUids(subjectData.sharedWithUids || [], sharedWithUids);
            const mergedSubjectSharedWith = dedupeSharedWithEntries([
              ...(Array.isArray(subjectData.sharedWith) ? subjectData.sharedWith : []),
              ...sharedWith,
            ]);

            operations.push((batch) => {
              batch.update(subjectDoc.ref, {
                isShared: mergedSubjectSharedWithUids.length > 0,
                sharedWithUids: mergedSubjectSharedWithUids,
                sharedWith: mergedSubjectSharedWith,
                updatedAt: FieldValue.serverTimestamp(),
              });
            });
          });
        }
      }
    }

    const ownerNotificationRef = db
      .collection('notifications')
      .doc(`shortcut_move_request_owner_${requestId}`);
    const requesterNotificationRef = db
      .collection('notifications')
      .doc(`shortcut_move_request_requester_${requestId}`);

    operations.push((batch) => {
      batch.update(requestRef, {
        status: resolution,
        resolution,
        resolvedAt: FieldValue.serverTimestamp(),
        resolvedByUid: actorUid,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    operations.push((batch) => {
      batch.set(ownerNotificationRef, {
        read: true,
        shortcutMoveRequestStatus: resolution,
        resolvedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    operations.push((batch) => {
      batch.set(requesterNotificationRef, {
        userId: requesterUid,
        institutionId,
        read: false,
        type: resolution === MOVE_REQUEST_STATUS_APPROVED
          ? 'shortcut_move_request_approved'
          : 'shortcut_move_request_rejected',
        shortcutMoveRequestId: requestId,
        shortcutMoveRequestStatus: resolution,
        shortcutId: moveRequest.shortcutId || null,
        shortcutType,
        targetId,
        targetFolderId,
        targetFolderName: String(targetFolderData.name || moveRequest.targetFolderName || 'carpeta compartida'),
        title: resolution === MOVE_REQUEST_STATUS_APPROVED
          ? 'Solicitud aprobada'
          : 'Solicitud rechazada',
        message: resolution === MOVE_REQUEST_STATUS_APPROVED
          ? 'El propietario movio el elemento original a la carpeta compartida.'
          : 'El propietario rechazo la solicitud de movimiento.',
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    let requesterEmail = normalizeEmail(moveRequest.requesterEmail);
    let requesterProfileData = null;

    const requesterProfileSnapshot = await db.collection('users').doc(requesterUid).get();
    if (requesterProfileSnapshot.exists) {
      requesterProfileData = requesterProfileSnapshot.data() || {};
      requesterEmail = normalizeEmail(requesterProfileData.email) || requesterEmail;
    }

    if (shouldQueueShortcutMoveRequesterMail({
      requesterEmail,
      requesterData: requesterProfileData,
    })) {
      const requesterMailRef = db.collection('mail').doc(`shortcut_move_request_requester_mail_${requestId}_${resolution}`);
      operations.push((batch) => {
        batch.set(requesterMailRef, createMailQueuePayload({
          to: requesterEmail,
          subject: resolution === MOVE_REQUEST_STATUS_APPROVED
            ? 'Tu solicitud de movimiento fue aprobada'
            : 'Tu solicitud de movimiento fue rechazada',
          title: resolution === MOVE_REQUEST_STATUS_APPROVED
            ? 'Solicitud aprobada'
            : 'Solicitud rechazada',
          bodyText: resolution === MOVE_REQUEST_STATUS_APPROVED
            ? 'El propietario movio el elemento original a la carpeta compartida solicitada.'
            : 'El propietario rechazo la solicitud de movimiento del elemento original.',
          metadata: {
            type: 'shortcut_move_request_resolution',
            requestId,
            resolution,
            requesterUid,
            resolverUid: actorUid,
            institutionId,
          },
        }));
      });
    }

    await commitOperationsInChunks(operations);

    return {
      success: true,
      requestId,
      status: resolution,
    };
  }
);
