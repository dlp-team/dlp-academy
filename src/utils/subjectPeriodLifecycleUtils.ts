// src/utils/subjectPeriodLifecycleUtils.ts
import { getNormalizedRole } from './permissionUtils';
import {
    getAcademicYearStartYear,
    isSubjectCurrentAcademicYear,
    getSubjectPassedState
} from './academicYearLifecycleUtils';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const DEFAULT_START_MONTH_DAY = { month: 9, day: 1 };
const DEFAULT_ORDINARY_END_MONTH_DAY = { month: 6, day: 30 };
const DEFAULT_EXTRAORDINARY_END_MONTH_DAY = { month: 7, day: 15 };
const DEFAULT_POST_COURSE_POLICY = 'retain_all_no_join';
export const UNKNOWN_PASS_STATE_EXTRAORDINARY_POLICY = 'treat_as_pending_until_extraordinary_end';
const LIFECYCLE_PHASE_VALUES = new Set(['active', 'extraordinary', 'post_extraordinary']);
const LIFECYCLE_VISIBILITY_VALUES = new Set(['all', 'all_no_join', 'teacher_only', 'hidden']);

const normalizePostCoursePolicy = (value: any) => {
    const normalizedValue = String(value || '').trim();
    if (normalizedValue === 'delete' || normalizedValue === 'retain_all_no_join' || normalizedValue === 'retain_teacher_only') {
        return normalizedValue;
    }

    return DEFAULT_POST_COURSE_POLICY;
};

const normalizeLifecyclePhase = (value: any) => {
    const normalizedValue = String(value || '').trim().toLowerCase();
    return LIFECYCLE_PHASE_VALUES.has(normalizedValue) ? normalizedValue : '';
};

const normalizeLifecycleVisibility = (value: any) => {
    const normalizedValue = String(value || '').trim().toLowerCase();
    return LIFECYCLE_VISIBILITY_VALUES.has(normalizedValue) ? normalizedValue : '';
};

const normalizePeriodType = (value: any) => {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (normalizedValue === 'trimester' || normalizedValue === 'cuatrimester' || normalizedValue === 'custom') {
        return normalizedValue;
    }

    return '';
};

const normalizePeriodIndex = (value: any) => {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) return null;

    const normalizedValue = Math.floor(parsedValue);
    return normalizedValue > 0 ? normalizedValue : null;
};

const getPeriodCount = (periodType: any) => {
    if (periodType === 'cuatrimester') return 2;
    if (periodType === 'custom') return 1;
    return 3;
};

const clampDay = (year: number, month: number, day: number) => {
    const monthMaxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return Math.min(Math.max(1, day), monthMaxDay);
};

const buildUtcDate = (year: number, month: number, day: number, endOfDay = false) => {
    const safeDay = clampDay(year, month, day);
    return new Date(
        Date.UTC(
            year,
            month - 1,
            safeDay,
            endOfDay ? 23 : 0,
            endOfDay ? 59 : 0,
            endOfDay ? 59 : 0,
            endOfDay ? 999 : 0
        )
    );
};

const parseIsoDate = (value: any) => {
    const normalizedValue = String(value || '').trim();
    const match = normalizedValue.match(ISO_DATE_PATTERN);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return null;
    }

    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    return { year, month, day };
};

const formatDateOnly = (value: Date) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;

    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseMonthDay = (value: any, fallbackValue: { month: number; day: number }) => {
    const parsedDate = parseIsoDate(value);
    if (!parsedDate) return fallbackValue;

    return {
        month: parsedDate.month,
        day: parsedDate.day
    };
};

const resolveAcademicYearDate = ({
    academicYear,
    month,
    day,
    startMonth,
    endOfDay = false
}: any) => {
    const startYear = getAcademicYearStartYear(academicYear);
    if (startYear === null) return null;

    const endYear = startYear + 1;
    const targetYear = month >= startMonth ? startYear : endYear;

    return buildUtcDate(targetYear, month, day, endOfDay);
};

export const normalizePeriodBoundaryDate = (value: any) => {
    const parsed = parseIsoDate(value);
    if (!parsed) return null;

    return formatDateOnly(buildUtcDate(parsed.year, parsed.month, parsed.day));
};

export const buildSubjectPeriodTimeline = ({
    academicYear,
    periodType,
    periodIndex,
    academicCalendar = {}
}: any) => {
    const normalizedPeriodType = normalizePeriodType(periodType);
    const normalizedPeriodIndex = normalizePeriodIndex(periodIndex);
    if (!normalizedPeriodType || normalizedPeriodIndex === null) {
        return null;
    }

    const periodCount = getPeriodCount(normalizedPeriodType);
    if (normalizedPeriodIndex > periodCount) {
        return null;
    }

    const normalizedAcademicYear = String(academicYear || '').trim();
    if (getAcademicYearStartYear(normalizedAcademicYear) === null) {
        return null;
    }

    const startMonthDay = parseMonthDay(academicCalendar?.startDate, DEFAULT_START_MONTH_DAY);
    const ordinaryEndMonthDay = parseMonthDay(academicCalendar?.ordinaryEndDate, DEFAULT_ORDINARY_END_MONTH_DAY);
    const extraordinaryEndMonthDay = parseMonthDay(
        academicCalendar?.extraordinaryEndDate,
        DEFAULT_EXTRAORDINARY_END_MONTH_DAY
    );

    const startDate = resolveAcademicYearDate({
        academicYear: normalizedAcademicYear,
        month: startMonthDay.month,
        day: startMonthDay.day,
        startMonth: startMonthDay.month,
        endOfDay: false
    });
    const ordinaryEndDate = resolveAcademicYearDate({
        academicYear: normalizedAcademicYear,
        month: ordinaryEndMonthDay.month,
        day: ordinaryEndMonthDay.day,
        startMonth: startMonthDay.month,
        endOfDay: true
    });

    if (!startDate || !ordinaryEndDate) {
        return null;
    }

    let extraordinaryEndDate = resolveAcademicYearDate({
        academicYear: normalizedAcademicYear,
        month: extraordinaryEndMonthDay.month,
        day: extraordinaryEndMonthDay.day,
        startMonth: startMonthDay.month,
        endOfDay: true
    });

    if (!extraordinaryEndDate || extraordinaryEndDate.getTime() < ordinaryEndDate.getTime()) {
        extraordinaryEndDate = ordinaryEndDate;
    }

    const startMs = startDate.getTime();
    const ordinaryEndMs = ordinaryEndDate.getTime();
    const totalWindowMs = Math.max(0, ordinaryEndMs - startMs);

    const periodStartMs = totalWindowMs === 0
        ? startMs
        : startMs + Math.floor((totalWindowMs * (normalizedPeriodIndex - 1)) / periodCount);
    const periodEndMs = totalWindowMs === 0
        ? ordinaryEndMs
        : normalizedPeriodIndex === periodCount
            ? ordinaryEndMs
            : startMs + Math.floor((totalWindowMs * normalizedPeriodIndex) / periodCount);

    const periodStartAt = formatDateOnly(new Date(periodStartMs));
    const periodEndAt = formatDateOnly(new Date(periodEndMs));
    const periodExtraordinaryEndAt = formatDateOnly(extraordinaryEndDate);

    if (!periodStartAt || !periodEndAt || !periodExtraordinaryEndAt) {
        return null;
    }

    return {
        periodStartAt,
        periodEndAt,
        periodExtraordinaryEndAt
    };
};

const parseBoundaryDate = (value: any, endOfDay = false) => {
    const parsedDate = parseIsoDate(value);
    if (!parsedDate) return null;
    return buildUtcDate(parsedDate.year, parsedDate.month, parsedDate.day, endOfDay);
};

export const shouldStudentRemainActiveDuringExtraordinaryWindow = ({
    subject
}: {
    subject: any;
}) => {
    const passedState = getSubjectPassedState(subject);
    if (passedState === true) {
        return false;
    }

    // Unknown pass state is treated as pending until extraordinary closes.
    return true;
};

export const isSubjectActiveInPeriodLifecycle = ({
    subject,
    user,
    referenceDate = new Date()
}: {
    subject: any;
    user: any;
    referenceDate?: Date;
}) => {
    const lifecyclePhase = normalizeLifecyclePhase(subject?.lifecyclePhase);
    if (lifecyclePhase) {
        if (lifecyclePhase === 'active') {
            return true;
        }

        if (lifecyclePhase === 'extraordinary') {
            const normalizedRole = getNormalizedRole(user);
            if (normalizedRole === 'student') {
                return shouldStudentRemainActiveDuringExtraordinaryWindow({ subject });
            }

            return true;
        }

        return false;
    }

    const ordinaryBoundary = parseBoundaryDate(subject?.periodEndAt, true);
    let extraordinaryBoundary = parseBoundaryDate(subject?.periodExtraordinaryEndAt || subject?.periodEndAt, true);

    if (!ordinaryBoundary) {
        return isSubjectCurrentAcademicYear(subject?.academicYear, referenceDate);
    }

    if (!extraordinaryBoundary || extraordinaryBoundary.getTime() < ordinaryBoundary.getTime()) {
        extraordinaryBoundary = ordinaryBoundary;
    }

    const nowMs = referenceDate.getTime();
    if (nowMs <= ordinaryBoundary.getTime()) {
        return true;
    }

    if (nowMs <= extraordinaryBoundary.getTime()) {
        const normalizedRole = getNormalizedRole(user);
        if (normalizedRole === 'student') {
            return shouldStudentRemainActiveDuringExtraordinaryWindow({ subject });
        }

        return true;
    }

    return false;
};

export const isSubjectVisibleByPostCoursePolicy = ({
    subject,
    user,
    referenceDate = new Date()
}: {
    subject: any;
    user: any;
    referenceDate?: Date;
}) => {
    const lifecycleVisibility = normalizeLifecycleVisibility(subject?.lifecyclePostCourseVisibility);
    if (lifecycleVisibility) {
        if (lifecycleVisibility === 'hidden') {
            return false;
        }

        if (lifecycleVisibility === 'teacher_only') {
            return getNormalizedRole(user) !== 'student';
        }

        return true;
    }

    const lifecyclePhase = normalizeLifecyclePhase(subject?.lifecyclePhase);
    if (lifecyclePhase === 'active' || lifecyclePhase === 'extraordinary') {
        return true;
    }

    if (lifecyclePhase === 'post_extraordinary') {
        const postCoursePolicyFromLifecyclePhase = normalizePostCoursePolicy(subject?.postCoursePolicy);
        if (postCoursePolicyFromLifecyclePhase === 'delete') {
            return false;
        }

        if (postCoursePolicyFromLifecyclePhase === 'retain_teacher_only') {
            return getNormalizedRole(user) !== 'student';
        }

        return true;
    }

    const extraordinaryBoundary = parseBoundaryDate(subject?.periodExtraordinaryEndAt || subject?.periodEndAt, true);
    if (!extraordinaryBoundary) {
        return true;
    }

    if (referenceDate.getTime() <= extraordinaryBoundary.getTime()) {
        return true;
    }

    const postCoursePolicy = normalizePostCoursePolicy(subject?.postCoursePolicy);
    if (postCoursePolicy === 'delete') {
        return false;
    }

    if (postCoursePolicy === 'retain_teacher_only') {
        return getNormalizedRole(user) !== 'student';
    }

    return true;
};
