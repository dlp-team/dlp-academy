// src/utils/courseLabelUtils.ts
import { normalizeAcademicYear } from './academicYearLifecycleUtils';

const normalizeCourseName = (value: any): string => String(value || '').trim();

export const getCourseDisplayLabelFromValues = (courseName: any, academicYear: any): string => {
    const normalizedName = normalizeCourseName(courseName);
    const normalizedAcademicYear = normalizeAcademicYear(academicYear);

    if (!normalizedName && !normalizedAcademicYear) return 'Curso';
    if (!normalizedName) return `Curso (${normalizedAcademicYear})`;
    return normalizedAcademicYear ? `${normalizedName} (${normalizedAcademicYear})` : normalizedName;
};

export const getCourseDisplayLabel = (course: any): string => (
    getCourseDisplayLabelFromValues(course?.name, course?.academicYear)
);
