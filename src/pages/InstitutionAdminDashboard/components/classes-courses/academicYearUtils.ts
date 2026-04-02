// src/pages/InstitutionAdminDashboard/components/classes-courses/academicYearUtils.ts

const ACADEMIC_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

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

export const isValidAcademicYear = (value: any): boolean => getAcademicYearStartYear(value) !== null;

export const normalizeAcademicYear = (value: any): string => {
  const normalizedValue = String(value || '').trim();
  return isValidAcademicYear(normalizedValue) ? normalizedValue : '';
};

export const getDefaultAcademicYear = (referenceDate = new Date()): string => {
  const currentYear = referenceDate.getFullYear();
  const monthIndex = referenceDate.getMonth();

  // July-December -> currentYear/currentYear+1. January-June -> previous/current.
  const startYear = monthIndex >= 6 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
};

export const buildAcademicYearRange = ({
  referenceDate = new Date(),
  minOffset = -20,
  maxOffset = 10,
}: {
  referenceDate?: Date;
  minOffset?: number;
  maxOffset?: number;
} = {}): string[] => {
  const defaultStartYear = getAcademicYearStartYear(getDefaultAcademicYear(referenceDate));
  if (defaultStartYear === null) return [];

  const range: string[] = [];
  for (let offset = maxOffset; offset >= minOffset; offset -= 1) {
    const startYear = defaultStartYear + offset;
    range.push(`${startYear}-${startYear + 1}`);
  }

  return range;
};
