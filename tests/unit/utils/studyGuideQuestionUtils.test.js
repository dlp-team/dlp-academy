// tests/unit/utils/studyGuideQuestionUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildStudyGuideQuestionReference,
  buildTeacherCandidateUidsFromSubject,
  composeStudyGuideQuestionMessage,
  isTeacherLikeRole,
} from '../../../src/utils/studyGuideQuestionUtils';

describe('studyGuideQuestionUtils', () => {
  it('detects teacher-like roles', () => {
    expect(isTeacherLikeRole('teacher')).toBe(true);
    expect(isTeacherLikeRole('institutionadmin')).toBe(true);
    expect(isTeacherLikeRole('admin')).toBe(true);
    expect(isTeacherLikeRole('student')).toBe(false);
  });

  it('builds unique candidate uids from subject owner/editors', () => {
    const candidateUids = buildTeacherCandidateUidsFromSubject({
      ownerId: 'owner-1',
      editorUids: ['editor-1', 'owner-1'],
      sharedWith: [
        { uid: 'editor-2', canEdit: true },
        { uid: 'viewer-1', canEdit: false },
        { uid: 'editor-3', role: 'editor' },
      ],
    });

    expect(candidateUids).toContain('owner-1');
    expect(candidateUids).toContain('editor-1');
    expect(candidateUids).toContain('editor-2');
    expect(candidateUids).toContain('editor-3');
    expect(candidateUids).not.toContain('viewer-1');
    expect(new Set(candidateUids).size).toBe(candidateUids.length);
  });

  it('composes a direct message with question and selected fragment', () => {
    const message = composeStudyGuideQuestionMessage({
      guideTitle: 'Introduccion a limites',
      selectedText: 'Cuando x tiende a infinito, la funcion f(x) converge.',
      question: 'No entiendo por que converge en este caso.',
    });

    expect(message).toContain('Duda sobre la guia');
    expect(message).toContain('Pregunta:');
    expect(message).toContain('Fragmento seleccionado:');
    expect(message.length).toBeLessThanOrEqual(700);
  });

  it('uses formula label when selection type is formula', () => {
    const message = composeStudyGuideQuestionMessage({
      guideTitle: 'Algebra',
      selectedText: 'x^2 + y^2 = z^2',
      selectionType: 'formula',
      question: 'Que significa esta igualdad aqui?',
    });

    expect(message).toContain('Formula seleccionada:');
  });

  it('truncates very long selected text to fit direct-message limits', () => {
    const message = composeStudyGuideQuestionMessage({
      guideTitle: 'Tema extenso',
      selectedText: 'texto '.repeat(500),
      question: 'Explicame este bloque por favor.',
    });

    expect(message.length).toBeLessThanOrEqual(700);
    expect(message).toContain('Fragmento seleccionado:');
  });

  it('builds a study-guide reference payload', () => {
    const reference = buildStudyGuideQuestionReference({
      subjectId: 'subject-1',
      topicId: 'topic-1',
      guideId: 'guide-1',
      guideTitle: 'Guia de Algebra',
      selectionSnippet: 'x^2 + y^2 = z^2',
      selectionType: 'formula',
    });

    expect(reference).toEqual({
      subjectId: 'subject-1',
      subjectName: null,
      topicId: 'topic-1',
      resourceType: 'resumen',
      resourceId: 'guide-1',
      resourceName: 'Guia de Algebra',
      label: 'Guia: Guia de Algebra',
      route: '/home/subject/subject-1/topic/topic-1/resumen/guide-1',
      selectionSnippet: 'x^2 + y^2 = z^2',
      selectionType: 'formula',
    });
  });

  it('keeps full formula snippet without truncation', () => {
    const longFormula = '\\frac{a+b}{c+d}'.repeat(80);
    const reference = buildStudyGuideQuestionReference({
      subjectId: 'subject-1',
      topicId: 'topic-1',
      guideId: 'guide-2',
      guideTitle: 'Guia de Formula Larga',
      selectionSnippet: longFormula,
      selectionType: 'formula',
    });

    expect(reference?.selectionSnippet).toBe(longFormula);
  });
});
