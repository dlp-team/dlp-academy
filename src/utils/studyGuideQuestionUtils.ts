// src/utils/studyGuideQuestionUtils.ts
const DEFAULT_GUIDE_TITLE = 'Guia de estudio';
const DIRECT_MESSAGE_MAX_LENGTH = 700;

const normalizeInlineText = (value: any) => String(value || '').replace(/\s+/g, ' ').trim();

const truncateWithEllipsis = (value: string, maxLength: number) => {
  if (!Number.isFinite(maxLength) || maxLength <= 0) return '';
  if (value.length <= maxLength) return value;
  if (maxLength === 1) return '…';
  return `${value.slice(0, maxLength - 1)}…`;
};

export const isTeacherLikeRole = (roleValue: any) => {
  const normalizedRole = normalizeInlineText(roleValue).toLowerCase();
  return normalizedRole === 'teacher'
    || normalizedRole === 'institutionadmin'
    || normalizedRole === 'admin';
};

export const buildTeacherCandidateUidsFromSubject = (subjectData: any) => {
  const candidateUids = new Set<string>();

  const ownerUid = normalizeInlineText(subjectData?.ownerId);
  if (ownerUid) {
    candidateUids.add(ownerUid);
  }

  if (Array.isArray(subjectData?.editorUids)) {
    subjectData.editorUids.forEach((uid: any) => {
      const normalizedUid = normalizeInlineText(uid);
      if (normalizedUid) {
        candidateUids.add(normalizedUid);
      }
    });
  }

  if (Array.isArray(subjectData?.sharedWith)) {
    subjectData.sharedWith.forEach((entry: any) => {
      const normalizedUid = normalizeInlineText(entry?.uid);
      if (!normalizedUid) return;

      const canEdit = entry?.canEdit === true || normalizeInlineText(entry?.role).toLowerCase() === 'editor';
      if (canEdit) {
        candidateUids.add(normalizedUid);
      }
    });
  }

  return Array.from(candidateUids);
};

export const composeStudyGuideQuestionMessage = ({
  guideTitle,
  selectedText,
  selectionType,
  question,
  maxLength = DIRECT_MESSAGE_MAX_LENGTH,
}: {
  guideTitle?: any;
  selectedText?: any;
  selectionType?: any;
  question?: any;
  maxLength?: number;
}) => {
  const normalizedMaxLength = Number.isFinite(Number(maxLength))
    ? Math.max(160, Number(maxLength))
    : DIRECT_MESSAGE_MAX_LENGTH;

  const safeGuideTitle = normalizeInlineText(guideTitle) || DEFAULT_GUIDE_TITLE;
  const headerLine = `Duda sobre la guia "${safeGuideTitle}"`;

  const normalizedQuestion = normalizeInlineText(question);
  const questionBudget = normalizedQuestion
    ? Math.min(280, Math.max(80, Math.floor(normalizedMaxLength * 0.35)))
    : 0;
  const questionLine = normalizedQuestion
    ? `Pregunta: ${truncateWithEllipsis(normalizedQuestion, questionBudget)}`
    : '';

  const prefixLines = [headerLine];
  if (questionLine) {
    prefixLines.push(questionLine);
  }

  const normalizedSelectionType = normalizeInlineText(selectionType).toLowerCase();
  const selectionLabelPrefix = normalizedSelectionType === 'formula'
    ? 'Formula seleccionada: "'
    : 'Fragmento seleccionado: "';
  const selectionLabelSuffix = '"';
  const reservedCharacters = `${prefixLines.join('\n')}\n${selectionLabelPrefix}${selectionLabelSuffix}`.length;
  const selectionBudget = Math.max(80, normalizedMaxLength - reservedCharacters);

  const normalizedSelection = normalizeInlineText(selectedText);
  const safeSelection = truncateWithEllipsis(normalizedSelection || 'No se detecto texto seleccionado.', selectionBudget);
  const selectionLine = `${selectionLabelPrefix}${safeSelection}${selectionLabelSuffix}`;

  const message = [...prefixLines, selectionLine].join('\n');
  return truncateWithEllipsis(message, normalizedMaxLength);
};

export const buildStudyGuideQuestionReference = ({
  subjectId,
  topicId,
  guideId,
  guideTitle,
  selectionSnippet,
  selectionType,
}: {
  subjectId?: any;
  topicId?: any;
  guideId?: any;
  guideTitle?: any;
  selectionSnippet?: any;
  selectionType?: any;
}) => {
  const normalizedSubjectId = normalizeInlineText(subjectId);
  const normalizedTopicId = normalizeInlineText(topicId);
  const normalizedGuideId = normalizeInlineText(guideId);

  if (!normalizedSubjectId || !normalizedTopicId || !normalizedGuideId) {
    return null;
  }

  const normalizedGuideTitle = normalizeInlineText(guideTitle) || DEFAULT_GUIDE_TITLE;
  const normalizedSelectionSnippet = truncateWithEllipsis(normalizeInlineText(selectionSnippet), 280) || null;
  const normalizedSelectionType = normalizeInlineText(selectionType).toLowerCase() || null;

  return {
    subjectId: normalizedSubjectId,
    subjectName: null,
    topicId: normalizedTopicId,
    resourceType: 'resumen',
    resourceId: normalizedGuideId,
    resourceName: normalizedGuideTitle,
    label: `Guia: ${normalizedGuideTitle}`,
    route: `/home/subject/${normalizedSubjectId}/topic/${normalizedTopicId}/resumen/${normalizedGuideId}`,
    selectionSnippet: normalizedSelectionSnippet,
    selectionType: normalizedSelectionType,
  };
};
