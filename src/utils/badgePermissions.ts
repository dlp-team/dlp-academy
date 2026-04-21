// src/utils/badgePermissions.ts

/**
 * Permission utilities for badge operations.
 * Follows the same pattern as permissionUtils.ts for consistency.
 */

type UserRole = 'admin' | 'institutionAdmin' | 'teacher' | 'student' | string;

interface UserContext {
  uid: string;
  role?: UserRole;
  institutionId?: string;
}

/**
 * Check if user can manage (create/edit/delete) subject-scoped badge templates.
 * Only the subject owner or an editor can manage badges for that subject.
 */
export const canManageSubjectBadges = (
  user: UserContext | null | undefined,
  subject: { ownerId?: string; editorUids?: string[] } | null | undefined
): boolean => {
  if (!user?.uid || !subject) return false;
  if (subject.ownerId === user.uid) return true;
  if (Array.isArray(subject.editorUids) && subject.editorUids.includes(user.uid)) return true;
  return false;
};

/**
 * Check if user can manage general (institution-wide) badge templates.
 * Only admin or institutionAdmin roles can manage general badges.
 */
export const canManageGeneralBadges = (
  user: UserContext | null | undefined
): boolean => {
  if (!user?.uid || !user.role) return false;
  return user.role === 'admin' || user.role === 'institutionAdmin';
};

/**
 * Check if user can view a student's badges.
 * Same institution membership is required.
 */
export const canViewBadges = (
  user: UserContext | null | undefined,
  studentInstitutionId: string | null | undefined
): boolean => {
  if (!user?.uid || !user.institutionId || !studentInstitutionId) return false;
  return user.institutionId === studentInstitutionId;
};

/**
 * Check if user can award a badge to a student.
 * For subject-scoped badges: must be subject owner/editor.
 * For general badges: must be admin/institutionAdmin.
 */
export const canAwardBadge = (
  user: UserContext | null | undefined,
  badgeScope: 'subject' | 'general',
  subject?: { ownerId?: string; editorUids?: string[] } | null
): boolean => {
  if (!user?.uid) return false;
  if (badgeScope === 'general') return canManageGeneralBadges(user);
  if (badgeScope === 'subject') return canManageSubjectBadges(user, subject);
  return false;
};

/**
 * Check if user can revoke a badge.
 * Only the original awarder or a higher role can revoke.
 */
export const canRevokeBadge = (
  user: UserContext | null | undefined,
  badge: { awardedBy?: string; type?: string } | null | undefined
): boolean => {
  if (!user?.uid || !badge) return false;
  // System auto-badges cannot be revoked manually
  if (badge.type === 'auto') return false;
  // Original awarder can revoke
  if (badge.awardedBy === user.uid) return true;
  // Admin/institutionAdmin can revoke any manual badge
  if (user.role === 'admin' || user.role === 'institutionAdmin') return true;
  return false;
};
