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

const PREVIEW_MOCK_STUDY_GUIDE_SECTIONS = [
  {
    title: 'DESCRIPCIONES LAGRANGIANA Y EULERIANA',
    content: 'Teoria fundamental: La descripcion lagrangiana sigue la trayectoria de cada particula y la euleriana describe el campo de velocidades por posicion y tiempo.',
    formulas: ['\\vec{x}=\\vec{x}_{T}(\\vec{x}_{0},t_{0};t)', '\\vec{v}=\\frac{d\\vec{x}_{T}}{dt}', '\\vec{v}(\\vec{x},t)'],
  },
  {
    title: 'TRAYECTORIAS Y SENDAS',
    content: 'Para determinar trayectorias desde la descripcion euleriana se integra el campo de velocidades. La senda se obtiene eliminando el tiempo de la trayectoria.',
    formulas: ['\\frac{d\\vec{x}}{dt}=\\vec{v}(\\vec{x},t)', '\\vec{x}(t=t_{0})=\\vec{x}_{0}'],
  },
  {
    title: 'LINEAS DE TRAZA Y LINEAS DE CORRIENTE',
    content: 'En regimen estacionario las lineas de traza coinciden con las sendas y las lineas de corriente.',
    formulas: ['\\frac{dx}{v_{x}}=\\frac{dy}{v_{y}}=\\frac{dz}{v_{z}}'],
  },
];

const PREVIEW_MOCK_EXAM_QUESTIONS = [
  {
    question: '1. Una maquina tiene un coste de adquisicion de 150000 EUR y vida util de 8 anos con interes del 4% anual. Calcula el coste horario de amortizacion y el coste por pieza para 1.2 h de uso.',
    result: 'a) 6.86 EUR/h b) 8.23 EUR/pieza',
    detailedAnswer: {
      procedure: 'Proceso: E actualizado = 150000 * (1 + 0.04)^8 = 205285.35. Coste horario = 205285.35 / (8 * 2200 * 2 * 0.85) = 6.86 EUR/h. Coste por pieza = 6.86 * 1.2 = 8.23 EUR/pieza.',
    },
  },
  {
    question: '2. Para un lote de 100 piezas se usan 2 kg de material X a 10 EUR/kg y 1.5 m de material Y a 8 EUR/m. Incluye 5% de aranceles, 50 EUR de transporte y 5% de desperdicio del material X.',
    result: 'a) 3510 EUR por lote b) 35.10 EUR/unidad',
    detailedAnswer: {
      procedure: 'Proceso: Coste bruto por pieza = 20 + 12 = 32. Lote bruto = 3200. Aranceles = 160. Transporte = 50. Perdida de material X = 100. Total lote = 3510. Coste unitario = 3510 / 100 = 35.10.',
    },
  },
  {
    question: '3. En una produccion de 500 unidades: Cm=15, Co=10, Cu=2, Ch=1, Camort=5 y costes generales del 40% sobre coste de fabricacion. Calcula Cf por unidad y Ct del lote.',
    result: 'a) 33 EUR/unidad b) 23100 EUR por lote',
    detailedAnswer: {
      procedure: 'Proceso: Cf unidad = 15 + 10 + 2 + 1 + 5 = 33. Cf lote = 33 * 500 = 16500. Cg = 0.40 * 16500 = 6600. Ct = 16500 + 6600 = 23100.',
    },
  },
];

const PREVIEW_MOCK_TOPIC_DETAIL_OVERRIDES_BY_ID: Record<string, any> = {
  'preview-topic-math-1': {
    pdfs: [
      {
        ...makeMockDoc({
          id: 'mock-study-guide-costes',
          topicId: 'preview-topic-math-1',
          subjectId: 'preview-subject-1',
          name: 'GUIA DE ESTUDIO Y FORMULAR',
          type: 'summary',
        }),
        subtitle: 'DLP ACADEMY Departamento de Ciencias',
        studyGuide: JSON.stringify(PREVIEW_MOCK_STUDY_GUIDE_SECTIONS),
        formulas: JSON.stringify(PREVIEW_MOCK_STUDY_GUIDE_SECTIONS.flatMap((section: any) => section.formulas || [])),
      },
      {
        ...makeMockDoc({
          id: 'mock-formulario-costes',
          topicId: 'preview-topic-math-1',
          subjectId: 'preview-subject-1',
          name: 'Formulario de costes',
          type: 'formulas',
        }),
        studyGuide: JSON.stringify(PREVIEW_MOCK_STUDY_GUIDE_SECTIONS),
      },
      {
        ...makeMockDoc({
          id: 'mock-exam-pdf-costes',
          topicId: 'preview-topic-math-1',
          subjectId: 'preview-subject-1',
          name: 'Examen DETERMINACION DE COSTES - Modelo 4',
          type: 'exam',
        }),
      },
    ],
    quizzes: [
      {
        id: 'mock-quiz-costes-basico',
        topicId: 'preview-topic-math-1',
        subjectId: 'preview-subject-1',
        title: 'Quiz de costes - Nivel basico',
        name: 'Quiz de costes - Nivel basico',
        level: 'Basico',
        type: 'basic',
        questions: [
          {
            question: 'Que coste cambia directamente con el volumen de produccion?',
            options: ['Coste variable', 'Coste fijo', 'Amortizacion lineal', 'Coste financiero'],
            correctIndex: 0,
          },
          {
            question: 'Si aumenta la produccion y los costes fijos se mantienen, que pasa con el coste fijo unitario?',
            options: ['Disminuye', 'Aumenta', 'No cambia', 'Se duplica'],
            correctIndex: 0,
          },
        ],
        formulas: ['C_{unitario}=\\frac{C_{total}}{n}'],
        isAssignment: true,
        assignmentStartAt: '2026-04-10T08:00:00.000Z',
        assignmentDueAt: '2026-04-20T20:00:00.000Z',
        createdAt: '2026-04-10T16:58:29.000Z',
        updatedAt: '2026-04-10T16:58:29.000Z',
      },
      {
        id: 'mock-quiz-costes-intermedio',
        topicId: 'preview-topic-math-1',
        subjectId: 'preview-subject-1',
        title: 'Quiz de costes - Nivel intermedio',
        name: 'Quiz de costes - Nivel intermedio',
        level: 'Intermedio',
        type: 'intermediate',
        questions: [
          {
            question: 'Con E=150000, i=4% y n=8, cual es E actualizado?',
            options: ['205285.35', '184000', '192500', '210900'],
            correctIndex: 0,
          },
          {
            question: 'Que expresion calcula el coste de amortizacion por pieza?',
            options: ['A_h * tiempo', 'C_f + C_g', 'E / n', 'Cm + Co'],
            correctIndex: 0,
          },
        ],
        formulas: ['E\' = E(1+i)^n', 'C_{amort}=A_h\\cdot t'],
        createdAt: '2026-04-10T16:58:29.000Z',
        updatedAt: '2026-04-10T16:58:29.000Z',
      },
      {
        id: 'mock-quiz-costes-avanzado',
        topicId: 'preview-topic-math-1',
        subjectId: 'preview-subject-1',
        title: 'Quiz de costes - Nivel avanzado',
        name: 'Quiz de costes - Nivel avanzado',
        level: 'Avanzado',
        type: 'advanced',
        questions: [
          {
            question: 'Si C_f(lote)=16500 y C_g es 40%, cual es C_T?',
            options: ['23100', '19800', '22500', '24500'],
            correctIndex: 0,
          },
          {
            question: 'Que variable afecta al coste unitario cuando sube el volumen?',
            options: ['Reparto de costes fijos', 'Tipo de cambio', 'Numero de sedes', 'Formato del examen'],
            correctIndex: 0,
          },
        ],
        formulas: ['C_T=C_f+C_g', 'C_g=0.40\\cdot C_f'],
        createdAt: '2026-04-10T16:58:29.000Z',
        updatedAt: '2026-04-10T16:58:29.000Z',
      },
    ],
    exams: [
      {
        id: 'mock-exam-costes-1',
        topicId: 'preview-topic-math-1',
        subjectId: 'preview-subject-1',
        title: 'Examen: DETERMINACION DE COSTES - MODELO 4',
        questions: PREVIEW_MOCK_EXAM_QUESTIONS,
        createdAt: '2026-04-10T16:58:29.000Z',
        updatedAt: '2026-04-10T16:58:29.000Z',
      },
    ],
  },
};

const PREVIEW_MOCK_ASSIGNMENTS_BY_TOPIC: Record<string, any[]> = {
  'preview-topic-math-1': [
    {
      id: 'mock-assignment-costes-1',
      title: 'Actividad 1: amortizacion horaria',
      description: 'Calcula el coste horario y el coste por pieza con los datos del tema. Adjunta desarrollo completo.',
      dueAt: '2026-04-19T20:00:00.000Z',
      visibleToStudents: true,
      allowLateDelivery: false,
      instructionFiles: [
        { name: 'enunciado-actividad-1.pdf', url: '#', size: 248000 },
      ],
      previewSubmissionCount: 14,
    },
    {
      id: 'mock-assignment-costes-2',
      title: 'Actividad 2: comparativa de maquinas',
      description: 'Compara dos alternativas de produccion y justifica cual reduce mejor el coste de amortizacion por pieza.',
      dueAt: '2026-04-24T20:00:00.000Z',
      visibleToStudents: true,
      allowLateDelivery: true,
      instructionFiles: [
        { name: 'rubrica-comparativa.docx', url: '#', size: 184000 },
      ],
      previewSubmissionCount: 9,
    },
  ],
  'preview-topic-science-1': [
    {
      id: 'mock-assignment-science-1',
      title: 'Actividad de laboratorio guiada',
      description: 'Prepara el informe del experimento y sube una conclusion con evidencia fotografica.',
      dueAt: '2026-04-22T18:30:00.000Z',
      visibleToStudents: true,
      allowLateDelivery: false,
      instructionFiles: [
        { name: 'plantilla-informe-lab.pdf', url: '#', size: 132000 },
      ],
      previewSubmissionCount: 11,
    },
  ],
};

const PREVIEW_MOCK_QUIZ_RESULTS_BY_TOPIC: Record<string, any[]> = {
  'preview-topic-math-1': [
    {
      id: 'mock-quiz-result-1',
      quizId: 'mock-quiz-costes-basico',
      userId: 'preview-student-1',
      userName: 'Alumno Uno',
      userEmail: 'alumno1@preview.local',
      score: 84,
      completedAt: '2026-04-12T10:00:00.000Z',
    },
    {
      id: 'mock-quiz-result-2',
      quizId: 'mock-quiz-costes-intermedio',
      userId: 'preview-student-1',
      userName: 'Alumno Uno',
      userEmail: 'alumno1@preview.local',
      score: 76,
      completedAt: '2026-04-12T10:25:00.000Z',
    },
    {
      id: 'mock-quiz-result-3',
      quizId: 'mock-quiz-costes-avanzado',
      userId: 'preview-student-2',
      userName: 'Alumno Dos',
      userEmail: 'alumno2@preview.local',
      score: 91,
      completedAt: '2026-04-12T11:10:00.000Z',
    },
  ],
};

const PREVIEW_MOCK_QUIZ_SCORE_REVIEWS_BY_TOPIC: Record<string, any[]> = {
  'preview-topic-math-1': [
    {
      id: 'mock-quiz-review-1',
      quizId: 'mock-quiz-costes-intermedio',
      userId: 'preview-student-1',
      subjectId: 'preview-subject-1',
      topicId: 'preview-topic-math-1',
      overrideScore: 82,
      reviewedBy: 'preview-teacher',
      updatedAt: '2026-04-12T12:00:00.000Z',
    },
  ],
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

  const detail = {
    ...(PREVIEW_MOCK_TOPIC_DETAILS_BY_ID[topic.id] || {}),
    ...(PREVIEW_MOCK_TOPIC_DETAIL_OVERRIDES_BY_ID[topic.id] || {}),
  };

  return {
    ...topic,
    subjectId: topic.subjectId || subjectId || null,
    pdfs: Array.isArray(detail.pdfs) ? detail.pdfs.map((entry: any) => ({ ...entry })) : [],
    uploads: Array.isArray(detail.uploads) ? detail.uploads.map((entry: any) => ({ ...entry })) : [],
    quizzes: Array.isArray(detail.quizzes) ? detail.quizzes.map((entry: any) => ({ ...entry })) : [],
    exams: Array.isArray(detail.exams) ? detail.exams.map((entry: any) => ({ ...entry })) : [],
    assignments: getPreviewMockAssignmentsByTopicId(topic.id),
  };
};

export const getPreviewMockAssignmentsByTopicId = (topicId: any) => {
  const normalizedTopicId = String(topicId || '').trim();
  return Array.isArray(PREVIEW_MOCK_ASSIGNMENTS_BY_TOPIC[normalizedTopicId])
    ? PREVIEW_MOCK_ASSIGNMENTS_BY_TOPIC[normalizedTopicId].map((assignment: any) => ({ ...assignment }))
    : [];
};

export const getPreviewMockQuizResultsByTopicId = (topicId: any) => {
  const normalizedTopicId = String(topicId || '').trim();
  return Array.isArray(PREVIEW_MOCK_QUIZ_RESULTS_BY_TOPIC[normalizedTopicId])
    ? PREVIEW_MOCK_QUIZ_RESULTS_BY_TOPIC[normalizedTopicId].map((result: any) => ({ ...result }))
    : [];
};

export const getPreviewMockQuizScoreReviewsByTopicId = (topicId: any) => {
  const normalizedTopicId = String(topicId || '').trim();
  return Array.isArray(PREVIEW_MOCK_QUIZ_SCORE_REVIEWS_BY_TOPIC[normalizedTopicId])
    ? PREVIEW_MOCK_QUIZ_SCORE_REVIEWS_BY_TOPIC[normalizedTopicId].map((review: any) => ({ ...review }))
    : [];
};
