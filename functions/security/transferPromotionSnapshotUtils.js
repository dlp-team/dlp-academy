// functions/security/transferPromotionSnapshotUtils.js
import { createHash } from 'node:crypto';
import { toUniqueIds } from './transferPromotionPlanUtils.js';

export const TRANSFER_SNAPSHOT_SCHEMA_VERSION = 2;
export const TRANSFER_SNAPSHOT_INLINE_ENTRY_LIMIT = 120;
export const TRANSFER_SNAPSHOT_CHUNK_SIZE = 120;

const normalizeStudentState = (entry = {}) => ({
  studentId: String(entry?.studentId || '').trim(),
  courseId: entry?.courseId || null,
  courseIds: toUniqueIds(entry?.courseIds || []),
  enrolledCourseIds: toUniqueIds(entry?.enrolledCourseIds || []),
});

const normalizeClassMembershipState = (entry = {}) => ({
  classId: String(entry?.classId || '').trim(),
  studentIds: toUniqueIds(entry?.studentIds || []),
});

export const normalizeExecutionSnapshot = (snapshot = {}) => {
  const normalizedMode = String(snapshot?.mode || 'promote').trim().toLowerCase() === 'transfer'
    ? 'transfer'
    : 'promote';

  return {
    mode: normalizedMode,
    institutionId: String(snapshot?.institutionId || '').trim(),
    requestId: String(snapshot?.requestId || '').trim(),
    createdCourseIds: toUniqueIds(snapshot?.createdCourseIds || []),
    createdClassIds: toUniqueIds(snapshot?.createdClassIds || []),
    studentStates: Array.isArray(snapshot?.studentStates)
      ? snapshot.studentStates
        .map(normalizeStudentState)
        .filter((entry) => entry.studentId)
      : [],
    classMembershipStates: Array.isArray(snapshot?.classMembershipStates)
      ? snapshot.classMembershipStates
        .map(normalizeClassMembershipState)
        .filter((entry) => entry.classId)
      : [],
  };
};

export const getExecutionSnapshotEntryCount = (executionSnapshot = {}) => {
  const normalized = normalizeExecutionSnapshot(executionSnapshot);
  return (
    normalized.createdCourseIds.length
    + normalized.createdClassIds.length
    + normalized.studentStates.length
    + normalized.classMembershipStates.length
  );
};

export const buildExecutionSnapshotChecksum = (executionSnapshot = {}) => {
  const normalized = normalizeExecutionSnapshot(executionSnapshot);
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
};

const chunkArray = (entries = [], chunkSize = TRANSFER_SNAPSHOT_CHUNK_SIZE) => {
  const safeChunkSize = Number.isInteger(chunkSize) && chunkSize > 0
    ? chunkSize
    : TRANSFER_SNAPSHOT_CHUNK_SIZE;

  const chunks = [];
  for (let index = 0; index < entries.length; index += safeChunkSize) {
    chunks.push(entries.slice(index, index + safeChunkSize));
  }
  return chunks;
};

const buildSnapshotChunks = ({ executionSnapshot, chunkSize = TRANSFER_SNAPSHOT_CHUNK_SIZE }) => {
  const normalized = normalizeExecutionSnapshot(executionSnapshot);
  const chunkDocs = [];

  const fieldDefinitions = [
    { key: 'createdCourseIds', values: normalized.createdCourseIds },
    { key: 'createdClassIds', values: normalized.createdClassIds },
    { key: 'studentStates', values: normalized.studentStates },
    { key: 'classMembershipStates', values: normalized.classMembershipStates },
  ];

  fieldDefinitions.forEach(({ key, values }) => {
    const valueChunks = chunkArray(values, chunkSize);
    valueChunks.forEach((chunkValues, keyChunkIndex) => {
      const chunkIndex = chunkDocs.length;
      const chunkId = `${String(chunkIndex).padStart(4, '0')}-${key}`;
      chunkDocs.push({
        chunkId,
        chunkIndex,
        key,
        keyChunkIndex,
        values: chunkValues,
      });
    });
  });

  return chunkDocs;
};

export const buildSnapshotPersistencePlan = ({
  executionSnapshot,
  inlineEntryLimit = TRANSFER_SNAPSHOT_INLINE_ENTRY_LIMIT,
  chunkSize = TRANSFER_SNAPSHOT_CHUNK_SIZE,
}) => {
  const normalizedSnapshot = normalizeExecutionSnapshot(executionSnapshot);
  const entryCount = getExecutionSnapshotEntryCount(normalizedSnapshot);
  const safeInlineEntryLimit = Number.isInteger(inlineEntryLimit) && inlineEntryLimit >= 0
    ? inlineEntryLimit
    : TRANSFER_SNAPSHOT_INLINE_ENTRY_LIMIT;

  const snapshotChecksum = buildExecutionSnapshotChecksum(normalizedSnapshot);

  if (entryCount <= safeInlineEntryLimit) {
    return {
      snapshotStorageMode: 'inline',
      snapshotSchemaVersion: TRANSFER_SNAPSHOT_SCHEMA_VERSION,
      snapshotChecksum,
      snapshotEntryCount: entryCount,
      snapshotChunkCount: 0,
      snapshotChunkIds: [],
      executionSnapshot: normalizedSnapshot,
      snapshotChunks: [],
    };
  }

  const snapshotChunks = buildSnapshotChunks({
    executionSnapshot: normalizedSnapshot,
    chunkSize,
  });

  return {
    snapshotStorageMode: 'chunked',
    snapshotSchemaVersion: TRANSFER_SNAPSHOT_SCHEMA_VERSION,
    snapshotChecksum,
    snapshotEntryCount: entryCount,
    snapshotChunkCount: snapshotChunks.length,
    snapshotChunkIds: snapshotChunks.map((chunk) => chunk.chunkId),
    executionSnapshot: null,
    snapshotChunks,
  };
};

export const rebuildExecutionSnapshotFromChunks = ({
  baseSnapshot,
  chunkDocs = [],
}) => {
  const base = normalizeExecutionSnapshot(baseSnapshot);
  const rebuilt = {
    ...base,
    createdCourseIds: [],
    createdClassIds: [],
    studentStates: [],
    classMembershipStates: [],
  };

  const orderedChunks = [...chunkDocs]
    .filter((entry) => entry && typeof entry === 'object')
    .sort((left, right) => Number(left?.chunkIndex ?? 0) - Number(right?.chunkIndex ?? 0));

  orderedChunks.forEach((chunk) => {
    const key = String(chunk?.key || '').trim();
    const values = Array.isArray(chunk?.values) ? chunk.values : [];

    if (key === 'createdCourseIds') {
      rebuilt.createdCourseIds = toUniqueIds([...rebuilt.createdCourseIds, ...values]);
      return;
    }

    if (key === 'createdClassIds') {
      rebuilt.createdClassIds = toUniqueIds([...rebuilt.createdClassIds, ...values]);
      return;
    }

    if (key === 'studentStates') {
      rebuilt.studentStates = [
        ...rebuilt.studentStates,
        ...values.map(normalizeStudentState).filter((entry) => entry.studentId),
      ];
      return;
    }

    if (key === 'classMembershipStates') {
      rebuilt.classMembershipStates = [
        ...rebuilt.classMembershipStates,
        ...values.map(normalizeClassMembershipState).filter((entry) => entry.classId),
      ];
    }
  });

  return normalizeExecutionSnapshot(rebuilt);
};
