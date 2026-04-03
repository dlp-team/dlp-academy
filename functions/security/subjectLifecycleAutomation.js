// functions/security/subjectLifecycleAutomation.js
const ISO_DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DEFAULT_POST_COURSE_POLICY = 'retain_all_no_join';
const VALID_POST_COURSE_POLICIES = new Set([
  'delete',
  'retain_all_no_join',
  'retain_teacher_only',
]);
const SUBJECT_LIFECYCLE_AUTOMATION_VERSION = 1;
const SUBJECT_UNKNOWN_PASS_STATE_POLICY = 'treat_as_pending_until_extraordinary_end';

const normalizePostCoursePolicy = (value) => {
  const normalizedValue = String(value || '').trim();
  return VALID_POST_COURSE_POLICIES.has(normalizedValue)
    ? normalizedValue
    : DEFAULT_POST_COURSE_POLICY;
};

const parseDateOnlyToMs = (value, { endOfDay = true } = {}) => {
  const normalizedValue = String(value || '').trim();
  const match = normalizedValue.match(ISO_DATE_ONLY_PATTERN);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return Date.UTC(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  );
};

export const resolveSubjectLifecyclePhase = ({ subject = {}, referenceDate = new Date() } = {}) => {
  const ordinaryBoundaryMs = parseDateOnlyToMs(subject?.periodEndAt, { endOfDay: true });
  let extraordinaryBoundaryMs = parseDateOnlyToMs(
    subject?.periodExtraordinaryEndAt || subject?.periodEndAt,
    { endOfDay: true },
  );

  if (ordinaryBoundaryMs === null) {
    return null;
  }

  if (extraordinaryBoundaryMs === null || extraordinaryBoundaryMs < ordinaryBoundaryMs) {
    extraordinaryBoundaryMs = ordinaryBoundaryMs;
  }

  const referenceMs = referenceDate.getTime();

  if (referenceMs <= ordinaryBoundaryMs) {
    return 'active';
  }

  if (referenceMs <= extraordinaryBoundaryMs) {
    return 'extraordinary';
  }

  return 'post_extraordinary';
};

const resolveLifecycleVisibility = ({ lifecyclePhase, postCoursePolicy }) => {
  if (lifecyclePhase !== 'post_extraordinary') {
    return 'all';
  }

  if (postCoursePolicy === 'delete') {
    return 'hidden';
  }

  if (postCoursePolicy === 'retain_teacher_only') {
    return 'teacher_only';
  }

  return 'all_no_join';
};

const assignIfChanged = (updates, subjectData, key, nextValue) => {
  if (subjectData?.[key] !== nextValue) {
    updates[key] = nextValue;
  }
};

export const buildSubjectLifecycleAutomationUpdate = ({ subject = {}, referenceDate = new Date() } = {}) => {
  const lifecyclePhase = resolveSubjectLifecyclePhase({ subject, referenceDate });
  if (!lifecyclePhase) {
    return null;
  }

  const postCoursePolicy = normalizePostCoursePolicy(subject?.postCoursePolicy);
  const lifecyclePostCourseVisibility = resolveLifecycleVisibility({
    lifecyclePhase,
    postCoursePolicy,
  });

  const updates = {};

  assignIfChanged(updates, subject, 'lifecyclePhase', lifecyclePhase);
  assignIfChanged(updates, subject, 'lifecyclePostCourseVisibility', lifecyclePostCourseVisibility);
  assignIfChanged(updates, subject, 'lifecycleUnknownPassStatePolicy', SUBJECT_UNKNOWN_PASS_STATE_POLICY);
  assignIfChanged(updates, subject, 'lifecycleAutomationVersion', SUBJECT_LIFECYCLE_AUTOMATION_VERSION);

  if (lifecyclePhase === 'post_extraordinary') {
    if (subject?.inviteCodeEnabled !== false) {
      updates.inviteCodeEnabled = false;
    }
    if (subject?.inviteCodeDisabledByLifecycle !== true) {
      updates.inviteCodeDisabledByLifecycle = true;
    }
  }

  return {
    lifecyclePhase,
    lifecyclePostCourseVisibility,
    postCoursePolicy,
    shouldUpdate: Object.keys(updates).length > 0,
    updates,
  };
};

export {
  SUBJECT_LIFECYCLE_AUTOMATION_VERSION,
  SUBJECT_UNKNOWN_PASS_STATE_POLICY,
};
