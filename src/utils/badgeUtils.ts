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
