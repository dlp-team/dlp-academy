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

// --- Enhanced Badge System (Phase 07) ---

import type { BadgeStyleLevel, InstitutionBadgeConfig } from '../types/badges';

const DEFAULT_BADGE_THRESHOLD = 8;
const DEFAULT_PERFECT_SCORE = 10;

export const getDefaultBadgeThreshold = (config?: InstitutionBadgeConfig | null): number => {
    if (config && Number.isFinite(config.gradeThreshold) && config.gradeThreshold > 0) {
        return config.gradeThreshold;
    }
    return DEFAULT_BADGE_THRESHOLD;
};

export const computeBadgeStyleLevel = (
    score: number,
    threshold: number = DEFAULT_BADGE_THRESHOLD,
    perfectScore: number = DEFAULT_PERFECT_SCORE,
): BadgeStyleLevel => {
    if (!Number.isFinite(score) || !Number.isFinite(threshold) || !Number.isFinite(perfectScore)) {
        return null;
    }
    if (score < threshold) return null;
    if (score >= perfectScore) return 'perfect';

    const range = perfectScore - threshold;
    if (range <= 0) return score >= threshold ? 'perfect' : null;

    const ratio = (score - threshold) / range;
    if (ratio <= 0) return 'threshold';
    if (ratio < 0.4) return 'mid';
    if (ratio < 0.75) return 'high';
    if (ratio < 1) return 'near-perfect';
    return 'perfect';
};

export const getBadgeStyleColors = (level: BadgeStyleLevel): { gradient: string; glow: string } => {
    switch (level) {
        case 'threshold':
            return { gradient: 'from-green-400 to-green-600', glow: 'shadow-green-200' };
        case 'mid':
            return { gradient: 'from-lime-400 to-lime-600', glow: 'shadow-lime-200' };
        case 'high':
            return { gradient: 'from-amber-400 to-amber-600', glow: 'shadow-amber-200' };
        case 'near-perfect':
            return { gradient: 'from-orange-400 to-orange-600', glow: 'shadow-orange-200' };
        case 'perfect':
            return { gradient: 'from-yellow-300 to-yellow-500', glow: 'shadow-yellow-200' };
        default:
            return { gradient: 'from-gray-300 to-gray-400', glow: 'shadow-gray-100' };
    }
};

export const computeGradeMean = (grades: number[]): number => {
    if (!Array.isArray(grades) || grades.length === 0) return NaN;
    const valid = grades.filter((g) => Number.isFinite(g));
    if (valid.length === 0) return NaN;
    return valid.reduce((sum, g) => sum + g, 0) / valid.length;
};

export const isEligibleForEnhancedBadge = (mean: number, threshold: number): boolean => {
    if (!Number.isFinite(mean) || !Number.isFinite(threshold)) return false;
    return mean >= threshold;
};

export const getDefaultBadgeTemplates = (): Array<{
    name: string;
    description: string;
    icon: string;
    type: 'auto' | 'manual';
    scope: 'general' | 'subject';
    category: string;
    isDefault: true;
}> => [
    {
        name: 'Excelencia académica',
        description: 'Rendimiento sobresaliente en la asignatura',
        icon: 'Award',
        type: 'auto',
        scope: 'subject',
        category: 'grades',
        isDefault: true,
    },
    {
        name: 'Participación destacada',
        description: 'Contribución activa en clase',
        icon: 'Hand',
        type: 'manual',
        scope: 'subject',
        category: 'participation',
        isDefault: true,
    },
    {
        name: 'Buena conducta',
        description: 'Comportamiento ejemplar',
        icon: 'Star',
        type: 'manual',
        scope: 'general',
        category: 'behavior',
        isDefault: true,
    },
    {
        name: 'Esfuerzo continuo',
        description: 'Dedicación y constancia en el aprendizaje',
        icon: 'TrendingUp',
        type: 'manual',
        scope: 'general',
        category: 'custom',
        isDefault: true,
    },
];
