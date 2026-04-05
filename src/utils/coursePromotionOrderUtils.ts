// src/utils/coursePromotionOrderUtils.ts
const normalizeCourseLabel = (value: any): string => String(value || '').trim().replace(/\s+/g, ' ');

const foldCourseLabel = (value: string): string => (
  normalizeCourseLabel(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
);

const getCourseStageRank = (foldedLabel: string): number => {
  if (foldedLabel.includes('bachiller')) return 40;
  if (/(^|\s)eso(\s|$)/.test(foldedLabel)) return 30;
  if (foldedLabel.includes('primaria')) return 20;
  if (foldedLabel.includes('infantil')) return 10;
  return 0;
};

const getCourseLevelNumber = (foldedLabel: string): number | null => {
  const levelMatch = foldedLabel.match(/(^|\s)(\d{1,2})(?:\s*[º°oa])?(?:\s|$)/);
  if (!levelMatch) return null;

  const parsedLevel = Number(levelMatch[2]);
  return Number.isFinite(parsedLevel) ? parsedLevel : null;
};

const compareCourseLabelsByPromotionPriority = (leftLabel: string, rightLabel: string): number => {
  const leftFolded = foldCourseLabel(leftLabel);
  const rightFolded = foldCourseLabel(rightLabel);

  const leftStageRank = getCourseStageRank(leftFolded);
  const rightStageRank = getCourseStageRank(rightFolded);
  if (leftStageRank !== rightStageRank) {
    return rightStageRank - leftStageRank;
  }

  const leftLevel = getCourseLevelNumber(leftFolded);
  const rightLevel = getCourseLevelNumber(rightFolded);
  if (leftLevel !== rightLevel) {
    if (leftLevel === null) return 1;
    if (rightLevel === null) return -1;
    return rightLevel - leftLevel;
  }

  return leftLabel.localeCompare(rightLabel, 'es', { sensitivity: 'base' });
};

const dedupeCourseLabels = (labels: any[] = []): string[] => {
  const uniqueByFoldedLabel = new Map<string, string>();

  labels.forEach((label) => {
    const normalizedLabel = normalizeCourseLabel(label);
    if (!normalizedLabel) return;

    const foldedLabel = foldCourseLabel(normalizedLabel);
    if (!foldedLabel || uniqueByFoldedLabel.has(foldedLabel)) return;

    uniqueByFoldedLabel.set(foldedLabel, normalizedLabel);
  });

  return Array.from(uniqueByFoldedLabel.values());
};

export const normalizeCoursePromotionOrder = (labels: any[] = []): string[] => (
  dedupeCourseLabels(Array.isArray(labels) ? labels : [])
);

export const buildDefaultCoursePromotionOrder = (courseNames: any[] = []): string[] => (
  dedupeCourseLabels(Array.isArray(courseNames) ? courseNames : [])
    .sort(compareCourseLabelsByPromotionPriority)
);

export const mergeCoursePromotionOrderWithCourseNames = ({
  courseNames = [],
  persistedOrder = [],
}: any): string[] => {
  const availableCourseLabels = dedupeCourseLabels(Array.isArray(courseNames) ? courseNames : []);
  if (availableCourseLabels.length === 0) return [];

  const defaults = buildDefaultCoursePromotionOrder(availableCourseLabels);
  const availableByFoldedLabel = new Map(
    availableCourseLabels.map((label) => [foldCourseLabel(label), label])
  );

  const normalizedPersisted = normalizeCoursePromotionOrder(Array.isArray(persistedOrder) ? persistedOrder : []);
  const nextOrder: string[] = [];
  const usedFoldedLabels = new Set<string>();

  normalizedPersisted.forEach((label) => {
    const foldedLabel = foldCourseLabel(label);
    const availableLabel = availableByFoldedLabel.get(foldedLabel);
    if (!availableLabel || usedFoldedLabels.has(foldedLabel)) return;

    nextOrder.push(availableLabel);
    usedFoldedLabels.add(foldedLabel);
  });

  defaults.forEach((label) => {
    const foldedLabel = foldCourseLabel(label);
    if (usedFoldedLabels.has(foldedLabel)) return;
    nextOrder.push(label);
    usedFoldedLabels.add(foldedLabel);
  });

  return nextOrder;
};
