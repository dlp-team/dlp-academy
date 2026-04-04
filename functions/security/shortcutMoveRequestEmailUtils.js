// functions/security/shortcutMoveRequestEmailUtils.js

const normalizeEmailCandidate = (value) => String(value || '').trim();

export const isEmailNotificationEnabled = (userData = {}) => userData?.notifications?.email !== false;

export const shouldQueueShortcutMoveOwnerMail = ({ ownerEmail, ownerData = {} }) => (
  normalizeEmailCandidate(ownerEmail).length > 0
  && isEmailNotificationEnabled(ownerData)
);

export const shouldQueueShortcutMoveRequesterMail = ({ requesterEmail, requesterData = null }) => {
  if (normalizeEmailCandidate(requesterEmail).length === 0) {
    return false;
  }

  // Preserve existing fallback behavior: if profile is missing, email notifications default to enabled.
  if (!requesterData) {
    return true;
  }

  return isEmailNotificationEnabled(requesterData);
};
