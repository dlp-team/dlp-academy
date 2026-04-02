// src/utils/academicYearLifecycleUtils.ts
import { getNormalizedRole } from './permissionUtils';

const ACADEMIC_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

const SCORE_PATHS = [
    ['finalGrade'],
    ['grade'],
    ['averageGrade'],
    ['averageScore'],
    ['score'],
    ['subjectGrade'],
    ['gradePercentage'],
    ['grades', 'final'],
    ['stats', 'averageScore'],
    ['lifecycle', 'grade']
];

const PASSED_PATHS = [
    ['passed'],
    ['isPassed'],
    ['approved'],
    ['isApproved'],
    ['hasPassed'],
    ['lifecycle', 'passed']
];

const getNestedValue = (source: any, path: string[] = []) => {
    let currentValue = source;
    for (let index = 0; index < path.length; index += 1) {
        if (!currentValue || typeof currentValue !== 'object') return undefined;
        currentValue = currentValue[path[index]];
    }
    return currentValue;
};

const toFiniteNumber = (value: any): number | null => {
    const parsedNumber = Number(value);
    return Number.isFinite(parsedNumber) ? parsedNumber : null;
};

const toBoolean = (value: any): boolean | null => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', 'yes', 'si', 'aprobado', 'approved', 'passed'].includes(normalized)) return true;
        if (['false', 'no', 'suspendido', 'failed', 'reprobado'].includes(normalized)) return false;
    }
    return null;
};

const normalizeScoreToPercent = (rawScore: number | null): number | null => {
    if (rawScore === null) return null;
    if (rawScore < 0) return null;

    if (rawScore <= 1) {
        return Math.min(100, rawScore * 100);
    }

    if (rawScore <= 10) {
        return rawScore * 10;
    }

    if (rawScore <= 100) {
        return rawScore;
    }

    return null;
};

export const getAcademicYearStartYear = (value: any): number | null => {
    const normalizedValue = String(value || '').trim();
    const match = normalizedValue.match(ACADEMIC_YEAR_PATTERN);
    if (!match) return null;

    const startYear = Number(match[1]);
    const endYear = Number(match[2]);
    if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) return null;
    if (endYear !== startYear + 1) return null;

    return startYear;
};

export const normalizeAcademicYear = (value: any): string => {
    const normalizedValue = String(value || '').trim();
    return getAcademicYearStartYear(normalizedValue) === null ? '' : normalizedValue;
};

export const getCurrentAcademicYear = (referenceDate = new Date()): string => {
    const currentYear = referenceDate.getFullYear();
    const monthIndex = referenceDate.getMonth();

    const startYear = monthIndex >= 6 ? currentYear : currentYear - 1;
    return `${startYear}-${startYear + 1}`;
};

export const isSubjectCurrentAcademicYear = (academicYear: any, referenceDate = new Date()): boolean => {
    const normalizedYear = normalizeAcademicYear(academicYear);

    // Legacy records without academic year remain visible as current.
    if (!normalizedYear) return true;

    return normalizedYear === getCurrentAcademicYear(referenceDate);
};

export const isSubjectEndedAcademicYear = (academicYear: any, referenceDate = new Date()): boolean => {
    const normalizedYear = normalizeAcademicYear(academicYear);
    if (!normalizedYear) return false;

    return normalizedYear !== getCurrentAcademicYear(referenceDate);
};

export const getSubjectScorePercent = (subject: any): number | null => {
    if (!subject || typeof subject !== 'object') return null;

    for (let index = 0; index < SCORE_PATHS.length; index += 1) {
        const rawValue = getNestedValue(subject, SCORE_PATHS[index]);
        const numericValue = toFiniteNumber(rawValue);
        const normalizedScore = normalizeScoreToPercent(numericValue);
        if (normalizedScore !== null) return normalizedScore;
    }

    return null;
};

export const getSubjectPassedState = (subject: any): boolean | null => {
    if (!subject || typeof subject !== 'object') return null;

    for (let index = 0; index < PASSED_PATHS.length; index += 1) {
        const rawValue = getNestedValue(subject, PASSED_PATHS[index]);
        const parsedBoolean = toBoolean(rawValue);
        if (parsedBoolean !== null) return parsedBoolean;
    }

    const scorePercent = getSubjectScorePercent(subject);
    if (scorePercent === null) return null;
    return scorePercent >= 50;
};

const getStudentEndedBadgeClassName = (scorePercent: number | null, passed: boolean | null) => {
    if (scorePercent !== null) {
        if (scorePercent >= 85) {
            return 'bg-emerald-100/95 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-400/25';
        }
        if (scorePercent >= 70) {
            return 'bg-lime-100/95 dark:bg-lime-500/20 text-lime-700 dark:text-lime-300 border border-lime-200 dark:border-lime-400/25';
        }
        if (scorePercent >= 50) {
            return 'bg-amber-100/95 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/25';
        }
        if (scorePercent >= 35) {
            return 'bg-orange-100/95 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-400/25';
        }
        return 'bg-rose-100/95 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-400/25';
    }

    if (passed === true) {
        return 'bg-emerald-100/95 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-400/25';
    }

    if (passed === false) {
        return 'bg-rose-100/95 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-400/25';
    }

    return 'bg-amber-100/95 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/25';
};

export const getEndedSubjectBadge = ({
    subject,
    user,
    referenceDate = new Date()
}: {
    subject: any;
    user: any;
    referenceDate?: Date;
}) => {
    if (!isSubjectEndedAcademicYear(subject?.academicYear, referenceDate)) {
        return null;
    }

    const normalizedRole = getNormalizedRole(user);

    if (normalizedRole === 'student') {
        const scorePercent = getSubjectScorePercent(subject);
        const passed = getSubjectPassedState(subject);
        const roundedScore = scorePercent === null ? null : Math.round(scorePercent);

        let label = 'Finalizada';
        if (roundedScore !== null) {
            label = `Finalizada · ${roundedScore}%`;
        } else if (passed === true) {
            label = 'Finalizada · Aprobada';
        } else if (passed === false) {
            label = 'Finalizada · Pendiente';
        }

        return {
            label,
            className: getStudentEndedBadgeClassName(scorePercent, passed)
        };
    }

    return {
        label: 'Finalizada',
        className: 'bg-amber-100/95 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/25'
    };
};
