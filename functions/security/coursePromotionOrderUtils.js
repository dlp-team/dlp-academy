// functions/security/coursePromotionOrderUtils.js
const normalizeCourseLabel = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const foldCourseLabel = (value) => (
  normalizeCourseLabel(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
);

const getCourseStageRank = (foldedLabel) => {
  if (foldedLabel.includes('bachiller')) return 40;
  if (/(^|\s)eso(\s|$)/.test(foldedLabel)) return 30;
  if (foldedLabel.includes('primaria')) return 20;
  if (foldedLabel.includes('infantil')) return 10;
  return 0;
};

const getCourseLevelNumber = (foldedLabel) => {
  const levelMatch = foldedLabel.match(/(^|\s)(\d{1,2})(?:\s*[º°oa])?(?:\s|$)/);
  if (!levelMatch) return null;

  const parsedLevel = Number(levelMatch[2]);
  return Number.isFinite(parsedLevel) ? parsedLevel : null;
};

const compareCourseLabelsByPromotionPriority = (leftLabel, rightLabel) => {
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

const dedupeCourseLabels = (labels = []) => {
  const uniqueByFoldedLabel = new Map();

  labels.forEach((label) => {
    const normalizedLabel = normalizeCourseLabel(label);
    if (!normalizedLabel) return;

    const foldedLabel = foldCourseLabel(normalizedLabel);
    if (!foldedLabel || uniqueByFoldedLabel.has(foldedLabel)) return;

    uniqueByFoldedLabel.set(foldedLabel, normalizedLabel);
  });

  return Array.from(uniqueByFoldedLabel.values());
};

export const normalizeCoursePromotionOrder = (labels = []) => (
  dedupeCourseLabels(Array.isArray(labels) ? labels : [])
);

export const buildDefaultCoursePromotionOrder = (courseNames = []) => (
  dedupeCourseLabels(Array.isArray(courseNames) ? courseNames : [])
    .sort(compareCourseLabelsByPromotionPriority)
);

export const mergeCoursePromotionOrderWithCourseNames = ({
  courseNames = [],
  persistedOrder = [],
} = {}) => {
  const availableCourseLabels = dedupeCourseLabels(Array.isArray(courseNames) ? courseNames : []);
  if (availableCourseLabels.length === 0) return [];

  const defaults = buildDefaultCoursePromotionOrder(availableCourseLabels);
  const availableByFoldedLabel = new Map(
    availableCourseLabels.map((label) => [foldCourseLabel(label), label])
  );

  const normalizedPersisted = normalizeCoursePromotionOrder(Array.isArray(persistedOrder) ? persistedOrder : []);
  const nextOrder = [];
  const usedFoldedLabels = new Set();

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

export const resolvePromotedCourseName = ({ sourceCourseName, promotionOrder = [] } = {}) => {
  const normalizedSourceCourseName = normalizeCourseLabel(sourceCourseName);
  if (!normalizedSourceCourseName) return null;

  const normalizedOrder = normalizeCoursePromotionOrder(Array.isArray(promotionOrder) ? promotionOrder : []);
  if (normalizedOrder.length === 0) return null;

  const sourceFoldedLabel = foldCourseLabel(normalizedSourceCourseName);
  const sourceIndex = normalizedOrder.findIndex((entry) => foldCourseLabel(entry) === sourceFoldedLabel);

  if (sourceIndex <= 0) return null;
  return normalizedOrder[sourceIndex - 1] || null;
};
