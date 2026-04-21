// src/hooks/useBadgeAutoComputation.ts
import { useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  computeGradeMean,
  isEligibleForAutoBadge,
  computeBadgeStyleLevel,
  getDefaultBadgeThreshold,
  upsertCourseBadge,
  buildAcademicExcellenceBadge,
  getAcademicExcellenceLevel,
  ACADEMIC_EXCELLENCE_BADGE_KEY,
} from '../utils/badgeUtils';

interface UseBadgeAutoComputationParams {
  institutionId: string | null | undefined;
  threshold?: number;
}

/**
 * Hook for automatic badge computation.
 * Provides functions to evaluate and award/revoke auto-badges
 * based on student grade means.
 */
export const useBadgeAutoComputation = ({
  institutionId,
  threshold,
}: UseBadgeAutoComputationParams) => {
  const effectiveThreshold = threshold ?? getDefaultBadgeThreshold();

  /**
   * Evaluate a student's grades for a specific course and award/revoke the
   * academic excellence badge accordingly.
   *
   * @param studentId - The student's UID
   * @param courseId - The course/subject identifier
   * @param grades - Array of numeric grades (0-10 scale)
   * @returns Object with the result of the evaluation
   */
  const evaluateAndUpdateBadge = useCallback(
    async (
      studentId: string,
      courseId: string,
      grades: number[]
    ): Promise<{
      awarded: boolean;
      revoked: boolean;
      mean: number;
      styleLevel: string | null;
    }> => {
      if (!institutionId || !studentId) {
        return { awarded: false, revoked: false, mean: NaN, styleLevel: null };
      }

      const mean = computeGradeMean(grades);
      const eligible = isEligibleForAutoBadge(mean, effectiveThreshold);

      // Read the student's current badgesByCourse from their profile
      const studentRef = doc(db, 'institutionUsers', studentId);
      const studentSnap = await getDoc(studentRef);
      const studentData = studentSnap.exists() ? studentSnap.data() : {};
      const currentBadgesByCourse = studentData?.badgesByCourse || {};

      if (eligible) {
        // Award or upgrade the badge
        const level = getAcademicExcellenceLevel(mean) || 1;
        const badge = buildAcademicExcellenceBadge({
          averageTenScale: mean,
          level,
          awardedBy: 'system',
        });

        const result = upsertCourseBadge({
          badgesByCourse: currentBadgesByCourse,
          courseId,
          badge,
        });

        if (result.changed) {
          await setDoc(
            studentRef,
            {
              badgesByCourse: result.badgesByCourse,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        const styleLevel = computeBadgeStyleLevel(mean, effectiveThreshold);
        return { awarded: result.changed, revoked: false, mean, styleLevel };
      } else {
        // Check if there's an existing auto-badge to revoke
        const courseBadges = Array.isArray(currentBadgesByCourse[courseId])
          ? currentBadgesByCourse[courseId]
          : [];

        const autoIndex = courseBadges.findIndex(
          (b: any) => b?.key === ACADEMIC_EXCELLENCE_BADGE_KEY && b?.source === 'system-auto'
        );

        if (autoIndex >= 0) {
          // Revoke by removing the badge
          const updatedCourseBadges = [...courseBadges];
          updatedCourseBadges.splice(autoIndex, 1);

          await setDoc(
            studentRef,
            {
              badgesByCourse: {
                ...currentBadgesByCourse,
                [courseId]: updatedCourseBadges,
              },
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          return { awarded: false, revoked: true, mean, styleLevel: null };
        }

        return { awarded: false, revoked: false, mean, styleLevel: null };
      }
    },
    [institutionId, effectiveThreshold]
  );

  /**
   * Batch-evaluate multiple courses for a student.
   * Useful for recalculating all badges on profile view.
   */
  const evaluateAllCourses = useCallback(
    async (
      studentId: string,
      courseGrades: Record<string, number[]>
    ): Promise<Record<string, { awarded: boolean; revoked: boolean; mean: number }>> => {
      const results: Record<string, { awarded: boolean; revoked: boolean; mean: number }> = {};

      for (const [courseId, grades] of Object.entries(courseGrades)) {
        const result = await evaluateAndUpdateBadge(studentId, courseId, grades);
        results[courseId] = {
          awarded: result.awarded,
          revoked: result.revoked,
          mean: result.mean,
        };
      }

      return results;
    },
    [evaluateAndUpdateBadge]
  );

  return {
    evaluateAndUpdateBadge,
    evaluateAllCourses,
    threshold: effectiveThreshold,
  };
};
