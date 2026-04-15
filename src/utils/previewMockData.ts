// src/utils/previewMockData.ts

export const PREVIEW_MOCK_INSTITUTION_ID = 'preview-institution';

export const PREVIEW_MOCK_FOLDERS = [
  {
    id: 'preview-folder-1',
    name: 'Planificacion semanal',
    tags: ['planificacion'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    parentId: null,
    color: 'from-indigo-400 to-indigo-600',
    isShared: false,
  },
  {
    id: 'preview-folder-2',
    name: 'Evaluaciones',
    tags: ['evaluacion'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    parentId: null,
    color: 'from-emerald-400 to-emerald-600',
    isShared: false,
  },
  {
    id: 'preview-folder-3',
    name: 'Laboratorio',
    tags: ['laboratorio'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    parentId: 'preview-folder-1',
    color: 'from-sky-400 to-sky-600',
    isShared: false,
  },
];

export const PREVIEW_MOCK_SUBJECTS = [
  {
    id: 'preview-subject-1',
    name: 'Matematicas',
    course: '3 ESO',
    level: 'ESO',
    grade: '3',
    tags: ['algebra', 'evaluacion'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-sky-400 to-sky-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#0ea5e9',
    completed: false,
    folderId: null,
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-20',
    topicCount: 2,
  },
  {
    id: 'preview-subject-2',
    name: 'Historia',
    course: '3 ESO',
    level: 'ESO',
    grade: '3',
    tags: ['lectura'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-amber-400 to-amber-600',
    icon: 'book',
    cardStyle: 'modern',
    modernFillColor: '#f59e0b',
    completed: false,
    folderId: 'preview-folder-1',
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-17',
    topicCount: 1,
  },
  {
    id: 'preview-subject-3',
    name: 'Ciencias',
    course: '2 ESO',
    level: 'ESO',
    grade: '2',
    tags: ['laboratorio'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-emerald-400 to-emerald-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#10b981',
    completed: false,
    folderId: 'preview-folder-3',
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-15',
    topicCount: 2,
  },
];

export const PREVIEW_MOCK_TOPICS_BY_SUBJECT: Record<string, any[]> = {
  'preview-subject-1': [
    {
      id: 'preview-topic-math-1',
      subjectId: 'preview-subject-1',
      name: 'Ecuaciones lineales',
      title: 'Ecuaciones lineales',
      description: 'Resolucion paso a paso y modelado de problemas.',
      number: '01',
      order: 1,
      status: 'completed',
      isVisible: true,
      color: 'from-sky-400 to-sky-600',
    },
    {
      id: 'preview-topic-math-2',
      subjectId: 'preview-subject-1',
      name: 'Sistemas de ecuaciones',
      title: 'Sistemas de ecuaciones',
      description: 'Metodos de sustitucion, igualacion y reduccion.',
      number: '02',
      order: 2,
      status: 'completed',
      isVisible: true,
      color: 'from-sky-400 to-sky-600',
    },
  ],
  'preview-subject-2': [
    {
      id: 'preview-topic-history-1',
      subjectId: 'preview-subject-2',
      name: 'Ilustracion y revolucion',
      title: 'Ilustracion y revolucion',
      description: 'Ideas clave y cambios politicos.',
      number: '01',
      order: 1,
      status: 'completed',
      isVisible: true,
      color: 'from-amber-400 to-amber-600',
    },
  ],
  'preview-subject-3': [
    {
      id: 'preview-topic-science-1',
      subjectId: 'preview-subject-3',
      name: 'Metodo cientifico',
      title: 'Metodo cientifico',
      description: 'Diseño experimental y analisis de resultados.',
      number: '01',
      order: 1,
      status: 'completed',
      isVisible: true,
      color: 'from-emerald-400 to-emerald-600',
    },
    {
      id: 'preview-topic-science-2',
      subjectId: 'preview-subject-3',
      name: 'Enlace quimico',
      title: 'Enlace quimico',
      description: 'Tipos de enlace y representaciones estructurales.',
      number: '02',
      order: 2,
      status: 'completed',
      isVisible: true,
      color: 'from-emerald-400 to-emerald-600',
    },
  ],
};

const makeMockQuiz = ({ id, topicId, subjectId, title, level }: any) => ({
  id,
  topicId,
  subjectId,
  title,
  name: title,
  level,
  type: level,
  questions: [
    {
      question: 'Pregunta de ejemplo 1',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    },
    {
      question: 'Pregunta de ejemplo 2',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 1,
    },
  ],
  formulas: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const makeMockDoc = ({ id, topicId, subjectId, name, type = 'summary' }: any) => ({
  id,
  topicId,
  subjectId,
  name,
  title: name,
  type,
  fileCategory: type === 'summary' ? 'material-teorico' : 'ejercicios',
  origin: 'AI',
  _collection: 'resumen',
  url: '#',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const makeMockExam = ({ id, topicId, subjectId, title }: any) => ({
  id,
  topicId,
  subjectId,
  title,
  questions: [
    { id: `${id}-q1`, question: 'Pregunta de examen 1' },
    { id: `${id}-q2`, question: 'Pregunta de examen 2' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const PREVIEW_MOCK_TOPIC_DETAILS_BY_ID: Record<string, any> = {
  'preview-topic-math-1': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-math-1', topicId: 'preview-topic-math-1', subjectId: 'preview-subject-1', title: 'Quiz de algebra', level: 'Intermedio' }),
      makeMockQuiz({ id: 'mock-quiz-math-2', topicId: 'preview-topic-math-1', subjectId: 'preview-subject-1', title: 'Quiz de repaso', level: 'Basico' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-math-1', topicId: 'preview-topic-math-1', subjectId: 'preview-subject-1', name: 'Guia de ecuaciones', type: 'summary' }),
      makeMockDoc({ id: 'mock-formula-math-1', topicId: 'preview-topic-math-1', subjectId: 'preview-subject-1', name: 'Formulario algebra', type: 'formulas' }),
    ],
    uploads: [
      makeMockDoc({ id: 'mock-upload-math-1', topicId: 'preview-topic-math-1', subjectId: 'preview-subject-1', name: 'Ficha de ejercicios', type: 'material' }),
    ],
    exams: [
      makeMockExam({ id: 'mock-exam-math-1', topicId: 'preview-topic-math-1', subjectId: 'preview-subject-1', title: 'Examen parcial de ecuaciones' }),
    ],
  },
  'preview-topic-math-2': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-math-3', topicId: 'preview-topic-math-2', subjectId: 'preview-subject-1', title: 'Quiz sistemas', level: 'Intermedio' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-math-2', topicId: 'preview-topic-math-2', subjectId: 'preview-subject-1', name: 'Guia de sistemas', type: 'summary' }),
    ],
    uploads: [],
    exams: [],
  },
  'preview-topic-history-1': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-history-1', topicId: 'preview-topic-history-1', subjectId: 'preview-subject-2', title: 'Quiz de historia', level: 'Basico' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-history-1', topicId: 'preview-topic-history-1', subjectId: 'preview-subject-2', name: 'Resumen ilustracion', type: 'summary' }),
    ],
    uploads: [],
    exams: [],
  },
  'preview-topic-science-1': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-science-1', topicId: 'preview-topic-science-1', subjectId: 'preview-subject-3', title: 'Quiz metodo cientifico', level: 'Intermedio' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-science-1', topicId: 'preview-topic-science-1', subjectId: 'preview-subject-3', name: 'Guia de laboratorio', type: 'summary' }),
    ],
    uploads: [
      makeMockDoc({ id: 'mock-upload-science-1', topicId: 'preview-topic-science-1', subjectId: 'preview-subject-3', name: 'Practica guiada', type: 'material' }),
    ],
    exams: [
      makeMockExam({ id: 'mock-exam-science-1', topicId: 'preview-topic-science-1', subjectId: 'preview-subject-3', title: 'Examen metodo cientifico' }),
    ],
  },
  'preview-topic-science-2': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-science-2', topicId: 'preview-topic-science-2', subjectId: 'preview-subject-3', title: 'Quiz enlace quimico', level: 'Avanzado' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-science-2', topicId: 'preview-topic-science-2', subjectId: 'preview-subject-3', name: 'Resumen enlace quimico', type: 'summary' }),
      makeMockDoc({ id: 'mock-formula-science-2', topicId: 'preview-topic-science-2', subjectId: 'preview-subject-3', name: 'Formulario quimico', type: 'formulas' }),
    ],
    uploads: [],
    exams: [
      makeMockExam({ id: 'mock-exam-science-2', topicId: 'preview-topic-science-2', subjectId: 'preview-subject-3', title: 'Examen enlace quimico' }),
    ],
  },
};

export const getPreviewMockSubjectById = (subjectId: any) => {
  const normalizedId = String(subjectId || '').trim();
  return PREVIEW_MOCK_SUBJECTS.find((subject) => subject.id === normalizedId) || null;
};

export const getPreviewMockTopicsBySubjectId = (subjectId: any) => {
  const normalizedId = String(subjectId || '').trim();
  return Array.isArray(PREVIEW_MOCK_TOPICS_BY_SUBJECT[normalizedId])
    ? PREVIEW_MOCK_TOPICS_BY_SUBJECT[normalizedId].map((topic) => ({ ...topic }))
    : [];
};

export const getPreviewMockTopicById = (topicId: any) => {
  const normalizedTopicId = String(topicId || '').trim();
  for (const topics of Object.values(PREVIEW_MOCK_TOPICS_BY_SUBJECT)) {
    const match = (topics || []).find((topic: any) => topic.id === normalizedTopicId);
    if (match) return { ...match };
  }
  return null;
};

export const getPreviewMockTopicDetail = (topicId: any, subjectId: any) => {
  const topic = getPreviewMockTopicById(topicId);
  if (!topic) return null;

  const detail = PREVIEW_MOCK_TOPIC_DETAILS_BY_ID[topic.id] || {};

  return {
    ...topic,
    subjectId: topic.subjectId || subjectId || null,
    pdfs: Array.isArray(detail.pdfs) ? detail.pdfs.map((entry: any) => ({ ...entry })) : [],
    uploads: Array.isArray(detail.uploads) ? detail.uploads.map((entry: any) => ({ ...entry })) : [],
    quizzes: Array.isArray(detail.quizzes) ? detail.quizzes.map((entry: any) => ({ ...entry })) : [],
    exams: Array.isArray(detail.exams) ? detail.exams.map((entry: any) => ({ ...entry })) : [],
  };
};
