// src/utils/badgeUtils.ts
export const ACADEMIC_EXCELLENCE_BADGE_KEY: string = 'academic_excellence';

export const MANUAL_BADGE_KEYS: string[] = ['top_student', 'participacion', 'esfuerzo'];  

const ACADEMIC_LEVELS = [
  { level: 3, minAverage: 9.5 },
  { level: 2, minAverage: 9.0 },
  { level: 1, minAverage: 8.5 },
];

export interface BadgeEntry {
  key: string;
  level: number;
  source: string;
  awardedBy: string;
  averageTenScale?: number;
  earnedAt: Date;
}

export type BadgesByCourse = Record<string, BadgeEntry[]>;

export const normalizeCourseKey = (courseId: string | null | undefined): string => {
  const raw = String(courseId || '').trim();
  return raw || 'general';
};

export const normalizeBadgesByCourse = (badgesByCourse: any): BadgesByCourse => {
  if (!badgesByCourse || typeof badgesByCourse !== 'object') {
    return {};
  }

  return Object.entries(badgesByCourse).reduce((acc: BadgesByCourse, [courseKey, badges]) => {  
    acc[normalizeCourseKey(courseKey)] = Array.isArray(badges) ? badges : [];   
    return acc;
  }, {});
};

export const getActiveCourseBadges = (badgesByCourse: any, activeCourseId: string | null | undefined): BadgeEntry[] => {      
  const normalized = normalizeBadgesByCourse(badgesByCourse);
  const activeCourseKey = normalizeCourseKey(activeCourseId);
  return Array.isArray(normalized[activeCourseKey]) ? normalized[activeCourseKey] : [];
};

export const getAcademicExcellenceLevel = (averageTenScale: number | string): number | null => {
  const normalizedAverage = Number(averageTenScale);
  if (!Number.isFinite(normalizedAverage)) return null;

  const matched = ACADEMIC_LEVELS.find(({ minAverage }) => normalizedAverage >= minAverage);
  return matched ? matched.level : null;
};

export const buildAcademicExcellenceBadge = ({ averageTenScale, level, awardedBy = 'system' }: { averageTenScale?: number | string; level: number; awardedBy?: string }): BadgeEntry => ({
  key: ACADEMIC_EXCELLENCE_BADGE_KEY,
  level,
  source: 'system-auto',
  awardedBy,
  averageTenScale: Number(Number(averageTenScale || 0).toFixed(2)),
  earnedAt: new Date(),
});

export const buildManualBadge = ({ badgeKey, awardedBy }: { badgeKey: string; awardedBy: string }): BadgeEntry => ({
  key: badgeKey,
  level: 1,
  source: 'teacher-manual',
  awardedBy,
  earnedAt: new Date(),
});

export const upsertCourseBadge = ({ badgesByCourse, courseId, badge }: { badgesByCourse: any; courseId: string | null | undefined; badge: BadgeEntry }): { changed: boolean; courseKey: string; badgesByCourse: BadgesByCourse } => {     
  const courseKey = normalizeCourseKey(courseId);
  const normalized = normalizeBadgesByCourse(badgesByCourse);
  const currentCourseBadges = Array.isArray(normalized[courseKey]) ? [...normalized[courseKey]] : [];

  const existingIndex = currentCourseBadges.findIndex((entry) => entry?.key === badge?.key);
  if (existingIndex < 0) {
    currentCourseBadges.push(badge);
    return {
      changed: true,
      courseKey,
      badgesByCourse: {
        ...normalized,
        [courseKey]: currentCourseBadges,
      },
    };
  }

  const existingBadge = currentCourseBadges[existingIndex];

  if (badge?.key !== ACADEMIC_EXCELLENCE_BADGE_KEY) {
    return {
      changed: false,
      courseKey,
      badgesByCourse: normalized,
    };
  }

  const previousLevel = Number(existingBadge?.level || 0);
  const nextLevel = Math.max(previousLevel, Number(badge?.level || 0));

  const previousAverage = Number(existingBadge?.averageTenScale || 0);
  const nextAverage = Math.max(previousAverage, Number(badge?.averageTenScale || 0));

  if (nextLevel === previousLevel && nextAverage === previousAverage) {
    return {
      changed: false,
      courseKey,
      badgesByCourse: normalized,
    };
  }

  currentCourseBadges[existingIndex] = {
    ...existingBadge,
    ...badge,
    level: nextLevel,
    averageTenScale: Number(nextAverage.toFixed(2)),
    earnedAt: existingBadge?.earnedAt || badge?.earnedAt,
  };

  return {
    changed: true,
    courseKey,
    badgesByCourse: {
      ...normalized,
      [courseKey]: currentCourseBadges,
    },
  };
};

// --- Phase 08: Grade Computation & Auto-Badge Style System ---

export type BadgeStyleLevel = 'threshold' | 'mid' | 'high' | 'near-perfect' | 'perfect';

export interface BadgeStyleConfig {
  gradient: string;
  glow: string;
  label: string;
  isPerfect: boolean;
  level: BadgeStyleLevel;
}

/**
 * Returns the default institution badge threshold (8 out of 10).
 */
export const getDefaultBadgeThreshold = (): number => 8;

/**
 * Compute style level based on score relative to threshold.
 * threshold (e.g. 8) → 'threshold'
 * threshold+0.5 (e.g. 8.5) → 'mid'
 * threshold+1.0 (e.g. 9) → 'high'
 * threshold+1.5 (e.g. 9.5) → 'near-perfect'
 * 10 (perfect) → 'perfect'
 */
export const computeBadgeStyleLevel = (score: number, threshold: number = 8): BadgeStyleLevel => {
  if (score >= 10) return 'perfect';
  if (score >= threshold + 1.5) return 'near-perfect';
  if (score >= threshold + 1.0) return 'high';
  if (score >= threshold + 0.5) return 'mid';
  return 'threshold';
};

/**
 * Returns Tailwind gradient and glow classes for a given style level.
 */
export const getBadgeStyleColors = (level: BadgeStyleLevel): BadgeStyleConfig => {
  switch (level) {
    case 'perfect':
      return {
        gradient: 'from-yellow-300 to-amber-400',
        glow: 'shadow-yellow-400/50',
        label: 'Perfecto',
        isPerfect: true,
        level,
      };
    case 'near-perfect':
      return {
        gradient: 'from-orange-400 to-amber-500',
        glow: 'shadow-orange-400/40',
        label: 'Casi perfecto',
        isPerfect: false,
        level,
      };
    case 'high':
      return {
        gradient: 'from-amber-400 to-yellow-500',
        glow: 'shadow-amber-400/40',
        label: 'Excelente',
        isPerfect: false,
        level,
      };
    case 'mid':
      return {
        gradient: 'from-lime-400 to-green-500',
        glow: 'shadow-lime-400/40',
        label: 'Notable',
        isPerfect: false,
        level,
      };
    default: // threshold
      return {
        gradient: 'from-green-400 to-emerald-500',
        glow: 'shadow-green-400/40',
        label: 'Sobresaliente',
        isPerfect: false,
        level: 'threshold',
      };
  }
};

/**
 * Compute style config for a given score and threshold.
 */
export const getStyleForScore = (score: number, threshold: number = 8): BadgeStyleConfig => {
  const level = computeBadgeStyleLevel(score, threshold);
  return getBadgeStyleColors(level);
};

/**
 * Compute arithmetic mean from an array of numbers.
 * Returns NaN for empty arrays.
 */
export const computeGradeMean = (grades: number[]): number => {
  if (!grades || grades.length === 0) return NaN;
  const validGrades = grades.filter((g) => Number.isFinite(g));
  if (validGrades.length === 0) return NaN;
  return validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length;
};

/**
 * Determine if a score is eligible for an enhanced (auto) badge.
 */
export const isEligibleForAutoBadge = (score: number, threshold: number = 8): boolean => {
  return Number.isFinite(score) && score >= threshold;
};
