// src/utils/coursePeriodScheduleUtils.ts
import {
  buildSubjectPeriodTimeline,
  normalizePeriodBoundaryDate,
} from './subjectPeriodLifecycleUtils';

export const DEFAULT_COURSE_PERIOD_MODE = 'trimester';

export const normalizeCoursePeriodMode = (value: any) => {
  if (value === 'trimester' || value === 'cuatrimester' || value === 'custom') {
    return value;
  }

  return DEFAULT_COURSE_PERIOD_MODE;
};

export const buildCoursePeriodDefinitions = ({
  periodMode,
  customPeriodLabel,
}: any) => {
  const normalizedMode = normalizeCoursePeriodMode(periodMode);
  const normalizedCustomLabel = String(customPeriodLabel || '').trim();

  if (normalizedMode === 'cuatrimester') {
    return [
      { periodIndex: 1, periodLabel: 'Cuatrimestre 1' },
      { periodIndex: 2, periodLabel: 'Cuatrimestre 2' },
    ];
  }

  if (normalizedMode === 'custom') {
    const baseLabel = normalizedCustomLabel || 'Periodo';
    return [
      { periodIndex: 1, periodLabel: `${baseLabel} 1` },
    ];
  }

  return [
    { periodIndex: 1, periodLabel: 'Trimestre 1' },
    { periodIndex: 2, periodLabel: 'Trimestre 2' },
    { periodIndex: 3, periodLabel: 'Trimestre 3' },
  ];
};

const toComparableDateValue = (value: any) => {
  const normalized = normalizePeriodBoundaryDate(value);
  return normalized || '';
};

const normalizeSchedulePeriodEntry = (entry: any, fallbackLabel: string) => {
  const normalizedPeriodIndex = Number(entry?.periodIndex ?? entry?.index);
  if (!Number.isFinite(normalizedPeriodIndex)) {
    return null;
  }

  const periodIndex = Math.max(1, Math.floor(normalizedPeriodIndex));
  const periodStartAt = normalizePeriodBoundaryDate(entry?.periodStartAt || entry?.startDate);
  const periodEndAt = normalizePeriodBoundaryDate(entry?.periodEndAt || entry?.endDate);
  const periodLabel = String(entry?.periodLabel || entry?.label || fallbackLabel || '').trim();

  if (!periodStartAt || !periodEndAt) {
    return null;
  }

  if (toComparableDateValue(periodEndAt) < toComparableDateValue(periodStartAt)) {
    return null;
  }

  return {
    periodIndex,
    periodLabel,
    periodStartAt,
    periodEndAt,
  };
};

export const normalizeCoursePeriodSchedule = ({
  coursePeriodSchedule,
  periodMode,
  customPeriodLabel,
}: any) => {
  if (!coursePeriodSchedule || typeof coursePeriodSchedule !== 'object') {
    return null;
  }

  const fallbackMode = normalizeCoursePeriodMode(periodMode);
  const normalizedMode = normalizeCoursePeriodMode(
    coursePeriodSchedule?.periodType || coursePeriodSchedule?.mode || coursePeriodSchedule?.type || fallbackMode
  );

  const normalizedCustomLabel = String(
    coursePeriodSchedule?.customLabel || customPeriodLabel || ''
  ).trim();

  const definitions = buildCoursePeriodDefinitions({
    periodMode: normalizedMode,
    customPeriodLabel: normalizedCustomLabel,
  });

  const sourcePeriods = Array.isArray(coursePeriodSchedule?.periods)
    ? coursePeriodSchedule.periods
    : [];

  const normalizedPeriods = definitions.map((definition: any) => {
    const matchingPeriod = sourcePeriods.find((entry: any) => (
      Number(entry?.periodIndex ?? entry?.index) === definition.periodIndex
    ));

    return normalizeSchedulePeriodEntry(matchingPeriod, definition.periodLabel);
  });

  if (normalizedPeriods.some((entry: any) => !entry)) {
    return null;
  }

  const sortedPeriods: any[] = (normalizedPeriods
    .filter((entry: any) => Boolean(entry)) as any[])
    .sort((left: any, right: any) => left.periodIndex - right.periodIndex);

  if (sortedPeriods.length === 0) {
    return null;
  }

  for (let index = 1; index < sortedPeriods.length; index += 1) {
    const previousPeriod = sortedPeriods[index - 1] as any;
    const currentPeriod = sortedPeriods[index] as any;
    if (toComparableDateValue(currentPeriod.periodStartAt) < toComparableDateValue(previousPeriod.periodEndAt)) {
      return null;
    }
  }

  const lastPeriod = sortedPeriods[sortedPeriods.length - 1] as any;
  const explicitExtraordinaryEnd = normalizePeriodBoundaryDate(
    coursePeriodSchedule?.extraordinaryEndDate || coursePeriodSchedule?.periodExtraordinaryEndAt
  );

  const extraordinaryEndDate = explicitExtraordinaryEnd && toComparableDateValue(explicitExtraordinaryEnd) >= toComparableDateValue(lastPeriod.periodEndAt)
    ? explicitExtraordinaryEnd
    : lastPeriod.periodEndAt;

  return {
    periodType: normalizedMode,
    customLabel: normalizedMode === 'custom' ? normalizedCustomLabel : '',
    periods: sortedPeriods,
    extraordinaryEndDate,
  };
};

export const buildDefaultCoursePeriodSchedule = ({
  academicYear,
  periodMode,
  customPeriodLabel,
  academicCalendar,
}: any) => {
  const normalizedMode = normalizeCoursePeriodMode(periodMode);
  const definitions = buildCoursePeriodDefinitions({
    periodMode: normalizedMode,
    customPeriodLabel,
  });

  const periods = definitions.map((definition: any) => {
    const timeline = buildSubjectPeriodTimeline({
      academicYear,
      periodType: normalizedMode,
      periodIndex: definition.periodIndex,
      academicCalendar,
    });

    return {
      periodIndex: definition.periodIndex,
      periodLabel: definition.periodLabel,
      periodStartAt: timeline?.periodStartAt || '',
      periodEndAt: timeline?.periodEndAt || '',
    };
  });

  const lastPeriodWithExtraordinary = definitions.reduce((accumulator: any, definition: any) => {
    const timeline = buildSubjectPeriodTimeline({
      academicYear,
      periodType: normalizedMode,
      periodIndex: definition.periodIndex,
      academicCalendar,
    });

    if (!timeline?.periodExtraordinaryEndAt) {
      return accumulator;
    }

    return timeline.periodExtraordinaryEndAt;
  }, '');

  return {
    periodType: normalizedMode,
    customLabel: normalizedMode === 'custom' ? String(customPeriodLabel || '').trim() : '',
    periods,
    extraordinaryEndDate: lastPeriodWithExtraordinary,
  };
};
