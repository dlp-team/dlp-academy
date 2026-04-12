// src/utils/directMessageUtils.ts
const normalizeUid = (value: any) => String(value || '').trim();

export const buildConversationKey = (uidA: any, uidB: any) => {
  const first = normalizeUid(uidA);
  const second = normalizeUid(uidB);
  if (!first || !second) return '';
  return [first, second].sort().join('__');
};

export const resolveConversationParticipantUid = (message: any, currentUid: any) => {
  const normalizedCurrentUid = normalizeUid(currentUid);
  const senderUid = normalizeUid(message?.senderUid);
  const recipientUid = normalizeUid(message?.recipientUid);

  if (!normalizedCurrentUid || !senderUid || !recipientUid) return '';
  if (senderUid === normalizedCurrentUid) return recipientUid;
  if (recipientUid === normalizedCurrentUid) return senderUid;
  return '';
};

export const timestampToMillis = (value: any) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') {
    const date = value.toDate();
    return Number.isNaN(date?.getTime?.()) ? 0 : date.getTime();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const listIncludesUid = (listValue: any, uid: string) => Array.isArray(listValue) && listValue.includes(uid);

export const isUserLinkedToSubject = (subjectData: any, uid: any) => {
  const normalizedUid = normalizeUid(uid);
  if (!normalizedUid || !subjectData) return false;

  return (
    normalizeUid(subjectData?.ownerId) === normalizedUid
    || normalizeUid(subjectData?.uid) === normalizedUid
    || listIncludesUid(subjectData?.sharedWithUids, normalizedUid)
    || listIncludesUid(subjectData?.enrolledStudentUids, normalizedUid)
  );
};
