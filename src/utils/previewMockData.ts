// src/utils/previewMockData.ts

export const PREVIEW_MOCK_INSTITUTION_ID = 'preview-institution';

export const PREVIEW_MOCK_FOLDERS = [
  {
    id: 'preview-folder-1',
    name: 'Fisica ESO',
    tags: ['fisica', 'eso'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    parentId: null,
    color: 'from-violet-400 to-violet-600',
    isShared: true,
  },
  {
    id: 'preview-folder-2',
    name: 'Departamento Ciencias',
    tags: ['ciencias', 'compartido'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    parentId: null,
    color: 'from-emerald-400 to-emerald-600',
    isShared: true,
  },
];

export const PREVIEW_MOCK_SUBJECTS = [
  // Root-level subjects (visible to both teachers and students)
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
    folderId: null,
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
    tags: ['laboratorio', 'ciencias'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-emerald-400 to-emerald-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#10b981',
    completed: false,
    folderId: 'preview-folder-2',
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-15',
    topicCount: 2,
  },
  {
    id: 'preview-subject-4',
    name: 'Lengua y Literatura',
    course: '3 ESO',
    level: 'ESO',
    grade: '3',
    tags: ['lectura', 'escritura'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-rose-400 to-rose-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#f43f5e',
    completed: false,
    folderId: null,
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-22',
    topicCount: 1,
  },
  // Subjects inside "Fisica ESO" folder (teacher-only via folder)
  {
    id: 'preview-subject-5',
    name: 'Fisica',
    course: '2 ESO',
    level: 'ESO',
    grade: '2',
    tags: ['fisica', 'eso'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-violet-400 to-violet-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#8b5cf6',
    completed: false,
    folderId: 'preview-folder-1',
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-18',
    topicCount: 1,
  },
  {
    id: 'preview-subject-6',
    name: 'Fisica',
    course: '3 ESO',
    level: 'ESO',
    grade: '3',
    tags: ['fisica', 'eso'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-violet-400 to-violet-600',
    icon: 'book',
    cardStyle: 'modern',
    modernFillColor: '#8b5cf6',
    completed: false,
    folderId: 'preview-folder-1',
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-19',
    topicCount: 1,
  },
  {
    id: 'preview-subject-7',
    name: 'Fisica',
    course: '4 ESO',
    level: 'ESO',
    grade: '4',
    tags: ['fisica', 'eso'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-violet-400 to-violet-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#8b5cf6',
    completed: false,
    folderId: 'preview-folder-1',
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-21',
    topicCount: 1,
  },
  // Student-visible copy of Ciencias 2 ESO (simulates course assignment visible at root for students)
  {
    id: 'preview-subject-student-ciencias',
    name: 'Ciencias',
    course: '2 ESO',
    level: 'ESO',
    grade: '2',
    tags: ['laboratorio', 'ciencias'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-emerald-400 to-emerald-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#10b981',
    completed: false,
    folderId: null,
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-15',
    topicCount: 2,
    _studentOnly: true,
  },
  // Student-visible copy of Fisica 2 ESO (simulates shortcut/course assignment)
  {
    id: 'preview-subject-student-fisica',
    name: 'Fisica',
    course: '2 ESO',
    level: 'ESO',
    grade: '2',
    tags: ['fisica', 'eso'],
    ownerId: 'preview-teacher',
    institutionId: PREVIEW_MOCK_INSTITUTION_ID,
    color: 'from-violet-400 to-violet-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#8b5cf6',
    completed: false,
    folderId: null,
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-18',
    topicCount: 1,
    _studentOnly: true,
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
  'preview-subject-4': [
    {
      id: 'preview-topic-lengua-1',
      subjectId: 'preview-subject-4',
      name: 'Analisis sintactico',
      title: 'Analisis sintactico',
      description: 'Oraciones simples y compuestas, funciones sintacticas.',
      number: '01',
      order: 1,
      status: 'completed',
      isVisible: true,
      color: 'from-rose-400 to-rose-600',
    },
  ],
  'preview-subject-5': [
    {
      id: 'preview-topic-physics-2eso-1',
      subjectId: 'preview-subject-5',
      name: 'Fuerzas y movimiento',
      title: 'Fuerzas y movimiento',
      description: 'Leyes de Newton y problemas de dinamica basica.',
      number: '01',
      order: 1,
      status: 'completed',
      isVisible: true,
      color: 'from-violet-400 to-violet-600',
    },
  ],
  'preview-subject-6': [
    {
      id: 'preview-topic-physics-3eso-1',
      subjectId: 'preview-subject-6',
      name: 'Energia y trabajo',
      title: 'Energia y trabajo',
      description: 'Conservacion de la energia y teoremas energeticos.',
      number: '01',
      order: 1,
      status: 'completed',
      isVisible: true,
      color: 'from-violet-400 to-violet-600',
    },
  ],
  'preview-subject-7': [
    {
      id: 'preview-topic-physics-4eso-1',
      subjectId: 'preview-subject-7',
      name: 'Ondas y sonido',
      title: 'Ondas y sonido',
      description: 'Propagacion de ondas mecanicas y acustica.',
      number: '01',
      order: 1,
      status: 'completed',
      isVisible: true,
      color: 'from-violet-400 to-violet-600',
    },
  ],
  'preview-subject-student-ciencias': [
    {
      id: 'preview-topic-science-student-1',
      subjectId: 'preview-subject-student-ciencias',
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
      id: 'preview-topic-science-student-2',
      subjectId: 'preview-subject-student-ciencias',
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
  'preview-subject-student-fisica': [
    {
      id: 'preview-topic-physics-2eso-1',
      subjectId: 'preview-subject-student-fisica',
      name: 'Fuerzas y movimiento',
      title: 'Fuerzas y movimiento',
      description: 'Leyes de Newton y problemas de dinamica basica.',
      number: '01',
      order: 1,
      status: 'completed',
      isVisible: true,
      color: 'from-violet-400 to-violet-600',
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
  type: 'basic',
  isShared: false,
  editorUids: [],
  sharedWith: [],
  sharedWithUids: [],
  viewerUids: [],
  studentId: null,
  questions: [
    {
      correctIndex: 0,
      formula: '$G = \\rho (\\vec{v} - \\vec{v}_c) \\cdot \\vec{A}$',
      options: [
        '$3.6 \\text{ kg/s}$',
        '$7.2 \\text{ kg/s}$',
        '$1.2 \\text{ kg/s}$',
        '$6.0 \\text{ kg/s}$',
      ],
      question: 'Considere un flujo uniforme e incompresible de aire (densidad $\\rho = 1.2 \\text{ kg/m}^3$) con un campo de velocidad $\\vec{v} = (3\\vec{e}_x + 4\\vec{e}_y) \\text{ m/s}$. Calcule el gasto másico $G$ a través de una superficie plana de $3 \\text{ m}^2$ perpendicular al eje $x$.',
      rationale: 'El gasto másico se calcula como la densidad multiplicada por el producto escalar de la velocidad relativa del fluido con respecto a la superficie y el vector área.',
    },
    {
      correctIndex: 0,
      formula: '$p_0 - p_\\infty = \\frac{1}{2}\\rho v_\\infty^2 = \\rho_m g h$',
      options: [
        '$v_\\infty = \\sqrt{\\frac{2\\rho_m g h}{\\rho}}$',
        '$v_\\infty = \\sqrt{\\frac{2\\rho g h}{\\rho_m}}$',
        '$v_\\infty = \\frac{\\rho_m g h}{\\rho}$',
        '$v_\\infty = \\sqrt{2g h}$',
      ],
      question: 'Un tubo de Pitot se utiliza para medir la velocidad $v_\\infty$ de una corriente de aire de densidad $\\rho$. ¿Cuál es la expresión correcta para $v_\\infty$?',
      rationale: 'Aplicando la ecuación de Bernoulli entre el punto de corriente libre y el punto de estancamiento.',
    },
  ],
  formulas: [{ display: '$G = \\rho (\\vec{v} - \\vec{v}_c) \\cdot \\vec{A}$' }],
  createdAt: '2026-04-10T16:58:29.000Z',
  updatedAt: '2026-04-10T16:58:29.000Z',
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
  content: null,
  url: null,
  isShared: false,
  editorUids: [],
  sharedWith: [],
  sharedWithUids: [],
  viewerUids: [],
  institutionId: PREVIEW_MOCK_INSTITUTION_ID,
  ownerId: 'preview-teacher',
  createdAt: '2026-04-10T16:58:29.000Z',
  updatedAt: '2026-04-10T16:58:29.000Z',
});

const makeMockExam = ({ id, topicId, subjectId, title }: any) => ({
  id,
  topicId,
  subjectId,
  subjectid: subjectId,
  title,
  fecha: null,
  questions: [
    {
      question: '1. Una máquina tiene un coste de adquisición (E) de 150 000\\euro. Se amortiza en 8 años (n) con un interés (i) del 4\\% anual.\n a) Calcule el coste horario de amortización (A_h).',
      result: 'a) 6,86\\euro/h',
      detailedAnswer: {
        procedure: 'a) Proceso: Coste actualizado E\' = 150000\\euro \\cdot (1 + 0,04)^8 = 205285,35\\euro.',
      },
    },
    {
      question: '2. Para fabricar un producto, se necesitan dos materiales: 2 kg del Material X a 10\\euro/kg y 1.5 m del Material Y a 8\\euro/m.\n a) Calcule el coste total de materia prima por lote.',
      result: 'a) 3510\\euro',
      detailedAnswer: {
        procedure: 'a) Proceso: Coste Material X (bruto) = 2 kg \\cdot 10\\euro/kg = 20\\euro.',
      },
    },
  ],
  createdAt: '2026-04-10T16:58:29.000Z',
  updatedAt: '2026-04-10T16:58:29.000Z',
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
  'preview-topic-lengua-1': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-lengua-1', topicId: 'preview-topic-lengua-1', subjectId: 'preview-subject-4', title: 'Quiz analisis sintactico', level: 'Intermedio' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-lengua-1', topicId: 'preview-topic-lengua-1', subjectId: 'preview-subject-4', name: 'Resumen tipos de oraciones', type: 'summary' }),
    ],
    uploads: [],
    exams: [
      makeMockExam({ id: 'mock-exam-lengua-1', topicId: 'preview-topic-lengua-1', subjectId: 'preview-subject-4', title: 'Examen analisis sintactico' }),
    ],
  },
  'preview-topic-physics-2eso-1': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-physics-2eso-1', topicId: 'preview-topic-physics-2eso-1', subjectId: 'preview-subject-5', title: 'Quiz fuerzas y movimiento', level: 'Basico' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-physics-2eso-1', topicId: 'preview-topic-physics-2eso-1', subjectId: 'preview-subject-5', name: 'Resumen cinematica basica', type: 'summary' }),
    ],
    uploads: [],
    exams: [
      makeMockExam({ id: 'mock-exam-physics-2eso-1', topicId: 'preview-topic-physics-2eso-1', subjectId: 'preview-subject-5', title: 'Examen cinematica 2 ESO' }),
    ],
  },
  'preview-topic-physics-3eso-1': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-physics-3eso-1', topicId: 'preview-topic-physics-3eso-1', subjectId: 'preview-subject-6', title: 'Quiz energia y trabajo', level: 'Intermedio' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-physics-3eso-1', topicId: 'preview-topic-physics-3eso-1', subjectId: 'preview-subject-6', name: 'Resumen energia mecanica', type: 'summary' }),
    ],
    uploads: [],
    exams: [
      makeMockExam({ id: 'mock-exam-physics-3eso-1', topicId: 'preview-topic-physics-3eso-1', subjectId: 'preview-subject-6', title: 'Examen energia 3 ESO' }),
    ],
  },
  'preview-topic-physics-4eso-1': {
    quizzes: [
      makeMockQuiz({ id: 'mock-quiz-physics-4eso-1', topicId: 'preview-topic-physics-4eso-1', subjectId: 'preview-subject-7', title: 'Quiz ondas y sonido', level: 'Avanzado' }),
    ],
    pdfs: [
      makeMockDoc({ id: 'mock-summary-physics-4eso-1', topicId: 'preview-topic-physics-4eso-1', subjectId: 'preview-subject-7', name: 'Resumen ondas mecanicas', type: 'summary' }),
      makeMockDoc({ id: 'mock-formula-physics-4eso-1', topicId: 'preview-topic-physics-4eso-1', subjectId: 'preview-subject-7', name: 'Formulario ondas', type: 'formulas' }),
    ],
    uploads: [],
    exams: [
      makeMockExam({ id: 'mock-exam-physics-4eso-1', topicId: 'preview-topic-physics-4eso-1', subjectId: 'preview-subject-7', title: 'Examen ondas 4 ESO' }),
    ],
  },
};

const PREVIEW_MOCK_STUDY_GUIDE_SECTIONS = [
  {
    title: 'DESCRIPCIONES LAGRANGIANA Y EULERIANA',
    content: 'Teoría Fundamental\n* **Lagrangiana**: La descripción de un flujo se realiza especificando el movimiento de cada una de sus partículas fluidas. La variable fundamental en esta formulación es la trayectoria $\\vec{x}_{T}(\\vec{x}_{0}, t_{0}; t)$.\n* **Euleriana**: Consiste en considerar la posición $\\vec{x}$ y el tiempo $t$ como variables independientes y especificar el campo de velocidades $\\vec{v}(\\vec{x}, t)$ como variable fundamental.\n* **Nota de Uso**: Se utilizará la descripción Euleriana.\nMétodos y Fórmulas\n**Formulación Lagrangiana**\nTrayectoria:\nVelocidad:\nAceleración:\n**Formulación Euleriana**\nCampo de velocidades:\nConcepto: $\\vec{v}(\\vec{x}, t)$ debe entenderse como la velocidad de la partícula fluida que en el instante $t$ se encuentra en la posición $\\vec{x}$.',
    formulas: ['\\vec{x} = \\vec{x}_{T}(\\vec{x}_{0}, t_{0}; t)', '\\vec{v} = \\frac{d\\vec{x}_{T}}{dt}', '\\vec{a} = \\frac{d^{2}\\vec{x}_{T}}{dt^{2}}', '\\vec{v}(\\vec{x}, t)'],
  },
  {
    title: 'MOVIMIENTO UNIFORME Y ESTACIONARIO, PUNTOS DE REMANSO',
    content: 'Teoría Fundamental\n* **Movimiento uniforme**: Sin variaciones espaciales de las variables fluidas.\n* **Movimiento estacionario**: Sin variaciones temporales de las variables fluidas.\n* **Punto de remanso**: Un punto en el que la velocidad es nula.\n* **Nota**: Los puntos de remanso dependen del sistema de referencia elegido.\nMétodos y Fórmulas\nCampo de Velocidad Uniforme\nCampo de Velocidad Estacionario\nCondición para Punto de Remanso',
    formulas: ['\\vec{v} = \\vec{v}(t)', '\\vec{v} = \\vec{v}(\\vec{x})', '\\vec{v}(\\vec{x}, t) = \\vec{0}'],
  },
  {
    title: 'TRAYECTORIAS Y SENDAS',
    content: 'Teoría Fundamental\n* **Trayectoria**: Es la posición de una partícula fluida en función del tiempo y contiene información sobre el camino recorrido por la partícula y la rapidez con la que lo recorre.\n* **Senda**: Es el camino que recorre la partícula, sin información del tiempo. Es una curva fija en el espacio.\nMétodos y Fórmulas\n**Determinación de la Trayectoria (desde la descripción euleriana)** Se determina por integración de:\ncon la condición inicial:\nLa solución es:\n**Determinación de la Senda** Pasos / Procedimiento:\n1. Obtener la expresión de la trayectoria $\\vec{x} = \\vec{x}_{T}(\\vec{x}_{0}, t_{0}; t)$.\n2. Eliminar el tiempo $t$ en la expresión de la trayectoria para obtener la senda.',
    formulas: ['\\frac{d\\vec{x}}{dt} = \\vec{v}(\\vec{x}, t)', '\\vec{x}(t = t_{0}) = \\vec{x}_{0}', '\\vec{x} = \\vec{x}_{T}(\\vec{x}_{0}, t_{0}; t)'],
  },
  {
    title: 'LÍNEAS DE TRAZA',
    content: 'Teoría Fundamental\n* **Línea de traza**: Es el lugar geométrico de las partículas que en instantes anteriores pasaron por un punto dado.\n* **Propiedad (Flujo Estacionario)**: En un flujo estacionario, las líneas de traza coinciden con las sendas.\n* **Visualización Experimental**: Se visualizan experimentalmente inyectando de forma continua partículas marcadas en un punto dado.\nMétodos y Fórmulas\n**Determinación de la Línea de Traza** Para cada partícula, se resuelve:\ncon la condición de que en un instante anterior $\\tau \\le t$, la partícula estaba en el punto dado $\\vec{x}_{0}$:\nLa solución para la posición de esta partícula en el instante $t$ es:\nPasos / Procedimiento para obtener la línea de traza:\n1. Obtener la expresión $\\vec{x} = \\vec{x}_{T}(\\vec{x}_{0}, \\tau; t)$.\n2. La línea de traza es una curva fija en el espacio para cada instante de tiempo $t$, obtenida al variar el instante de paso $\\tau$ (los instantes en que las partículas pasaron por $\\vec{x}_{0}$).',
    formulas: ['\\frac{d\\vec{x}}{dt} = \\vec{v}(\\vec{x}, t)', '\\vec{x}(\\tau) = \\vec{x}_{0}', '\\vec{x} = \\vec{x}_{T}(\\vec{x}_{0}, \\tau; t)'],
  },
  {
    title: 'LÍNEAS, SUPERFICIES Y TUBOS DE CORRIENTE',
    content: 'Teoría Fundamental\n* **Línea de corriente**: Es tangente en cada uno de sus puntos al vector velocidad local.\n* **Superficie de corriente**: Está formada por todas las líneas de corriente que se apoyan sobre una línea arbitraria.\n* **Tubo de corriente**: Si la línea sobre la que se apoya la superficie de corriente es cerrada, la superficie de corriente forma un tubo de corriente.\n* **Propiedad (Intersección)**: Las líneas de corriente sólo pueden cruzarse en un punto de remanso.\n* **Propiedad (Flujo Estacionario)**: Coinciden con las sendas cuando el flujo es estacionario.\nMétodos y Fórmulas\n**Ecuación de la Línea de Corriente**\nNota: La constante de integración se determina fijando un punto de la línea de corriente.',
    formulas: ['\\frac{dx}{v_{x}} = \\frac{dy}{v_{y}} = \\frac{dz}{v_{z}}'],
  },
  {
    title: 'LÍNEAS, SUPERFICIES Y VOLÚMENES FLUIDOS',
    content: 'Teoría Fundamental\n* **Línea fluida**: Si $\\vec{v}(\\vec{x}, t)$ es continua, las partículas fluidas que se encuentran en el instante inicial a lo largo de una línea $\\vec{x} = \\vec{x}_{L}(\\lambda)$ ($\\lambda$ es un parámetro) seguirán formando una línea en su movimiento posterior.\n* **Superficie fluida**: Análogamente, las partículas que se encuentren en el instante inicial sobre una superficie $\\vec{x} = \\vec{x}_{S}(\\alpha, \\beta)$ ($\\alpha$ y $\\beta$ son parámetros) seguirán formando una superficie en su movimiento posterior.\n* **Volumen fluido (Sistema Cerrado)**: Una superficie fluida cerrada se mantiene cerrada, limitando un volumen fluido. Es, simplemente, una porción definida de fluido y, por tanto, un sistema cerrado.\n* **Utilidad del Volumen Fluido**: El concepto de volumen fluido será útil en la aplicación de los principios de conservación que gobiernan el movimiento fluido.\nMétodos y Fórmulas\n**Posición posterior de una Línea Fluida**\n**Posición posterior de una Superficie Fluida**',
    formulas: ['\\vec{x} = \\vec{x}_{T}(\\vec{x}_{L}(\\lambda); t)', '\\vec{x} = \\vec{x}_{T}(\\vec{x}_{S}(\\alpha, \\beta); t)'],
  },
];

const PREVIEW_MOCK_EXAM_QUESTIONS = [
  {
    question: '1. Una máquina tiene un coste de adquisición (E) de 150 000\\euro. Se amortiza en 8 años (n) con un interés (i) del 4\\% anual. Trabaja 2200 horas al año (HA) en 2 turnos (NT) y tiene un índice de ocupación (I_o) del 0.85.\n a) Calcule el coste horario de amortización (A_h).\n b) Si un producto requiere 1.2 horas de uso de esta máquina, ¿cuál es el coste de amortización por pieza (C_{amort})?',
    result: 'a) 6,86\\euro/h b) 8,23\\euro/pieza',
    detailedAnswer: {
      procedure: 'a) Proceso: Coste actualizado E\' = 150000\\euro \\cdot (1 + 0,04)^8 = 150000\\euro \\cdot 1,368569 = 205285,35\\euro.\n A_h = E\'/(n \\cdot HA \\cdot NT \\cdot I_o) = 205285,35\\euro/(8 años \\cdot 2200 h/año \\cdot 2 turnos \\cdot 0,85) = 205285,35/29920\nb) Proceso: C_{amort}(\\euro/pieza) = A_h \\cdot tiempo de uso = 6,86\\euro/h \\cdot 1,2 h',
    },
  },
  {
    question: '2. Para fabricar un producto, se necesitan dos materiales: 2 kg del Material X a 10\\euro/kg y 1.5 m del Material Y a 8\\euro/m. Hay un coste de transporte de 50\\euro para el lote de 100 piezas y aranceles del 5\\% sobre el coste bruto de los materiales. Además, el 5\\% del Material X se pierde como desperdicio no recuperable.\n a) Calcule el coste total de materia prima por lote.\n b) Determine el coste de materia prima por unidad, considerando todos los factores.',
    result: 'a) 3510\\euro b) 35,10\\euro/unidad',
    detailedAnswer: {
      procedure: 'a) Proceso: Coste Material X (bruto) = 2 kg \\cdot 10\\euro/kg = 20\\euro. Coste Material Y = 1,5 m \\cdot 8\\euro/m = 12\\euro.\n Coste total material bruto por pieza = 20 + 12 = 32\\euro/pieza. Coste bruto materiales lote = 32\\euro/pieza \\cdot 100 piezas = 3200\\euro. Aranceles = 3200\\euro \\cdot 0,05 = 160\\euro.\n Transporte = 50\\euro. Coste total bruto = 3200 + 160 + 50 = 3410\\euro. Pérdida de material X = 2 kg/pieza \\cdot 100 piezas \\cdot 0,05 = 10 kg. Coste pérdida = 10 kg \\cdot 10\\euro/kg = 100\\euro.\n Coste neto total lote = 3410\\euro + 100\\euro (se suma la pérdida)\nb) Proceso: Coste por unidad = 3510\\euro/100 piezas',
    },
  },
  {
    question: '3. Un equipo de 4 operarios trabaja en un proyecto: un supervisor (15 h a 25\\euro/h), dos técnicos (cada uno 20 h a 18\\euro/h) y un ayudante (25 h a 12\\euro/h). Se estima un 10\\% adicional de tiempo en concepto de maniobras y preparaciones sobre el tiempo de transformación directo. Las cargas sociales son del 35\\% del salario.\n a) Calcule el coste de mano de obra directa total (incluyendo cargas sociales) para el proyecto.\n b) Si el proyecto dura 40 horas efectivas de transformación, ¿cuál es el coste horario promedio por operario para este proyecto (incluyendo cargas sociales)?',
    result: 'a) 1883,25\\euro b) 23,54\\euro/h',
    detailedAnswer: {
      procedure: 'a) Proceso: Salario Supervisor = 15 \\cdot 25 = 375\\euro. Salario Técnicos = 2 \\cdot 20 \\cdot 18 = 720\\euro.\n Salario Ayudante = 25 \\cdot 12 = 300\\euro. Total Salario Directo = 375 + 720 + 300 = 1395\\euro.\n Tiempo adicional = 10\\% del tiempo de transformación, esto es para el cálculo del coste por hora, no del salario directo. El ejercicio pide el coste total de mano de obra, incluyendo cargas sociales. Coste total M.O. = 1395\\euro \\cdot (1 + 0,35)\nb) Proceso: Horas totales = 15 + 20 + 20 + 25 = 80 horas. Coste total M.O. = 1883,25\\euro.\n Coste horario promedio (por operario) = 1883,25\\euro/80 horas',
    },
  },
  {
    question: '4. Para una producción de 500 unidades, se tienen los siguientes datos: Coste materia prima por unidad C_m = 15\\euro/unidad. Coste mano de obra directa por unidad C_o = 10\\euro/unidad. Coste de utillajes especiales C_u = 2\\euro/unidad. Coste de herramientas C_h = 1\\euro/unidad. La amortización de la máquina flexible es de 5\\euro/unidad. Los costes generales (C_g) son un 40\\% del coste de fabricación.\n a) Calcule el coste de fabricación (C_f) por unidad.\n b) Calcule el coste total (C_T) por unidad del nuevo producto.',
    result: 'a) 33\\euro/unidad b) 23 100\\euro',
    detailedAnswer: {
      procedure: 'a) Proceso: C_f(unidad) = C_m + C_o + C_u + C_h + C_{amort} = 15 + 10 + 2 + 1 + 5\\euro\nb) Proceso: C_f(lote) = C_f(unidad) \\cdot 500 unidades = 16500\\euro. C_g = 0,40 \\cdot C_f(lote) = 0,40 \\cdot 16500 = 6600\\euro.\n C_T = C_f(lote) + C_g = 16500 + 6600\\euro',
    },
  },
  {
    question: '5. Una empresa debe elegir entre dos máquinas para producir 20 000 piezas al año. Máquina A (específica): coste 200 000\\euro, vida útil 10 años, produce 200 piezas/hora. Máquina B (flexible): coste 150 000\\euro, vida útil 8 años, coste horario de amortización 18\\euro/h (considerando interés y ocupación), produce 150 piezas/hora. Interés bancario para Máquina A es 5\\%.\n a) Calcule el coste de amortización por pieza para la Máquina A.\n b) Calcule el coste de amortización por pieza para la Máquina B. ¿Cuál máquina ofrece un menor coste de amortización por pieza para este volumen de producción?',
    result: 'a) 1,63\\euro/pieza b) 1,20\\euro/pieza',
    detailedAnswer: {
      procedure: 'a) Proceso: Piezas totales en 10 años = 20000 piezas/año \\cdot 10 años = 200000 piezas. C_{amort}A = E\' / 200000 piezas = 325778,9/200000\nb) Proceso: Producción anual = 20000 piezas. Horas necesarias = 20000 piezas/150 piezas/h = 133,33 horas. C_{amort}B = 18\\euro/h \\cdot 133,33 h/20000 piezas',
    },
  },
  {
    question: '6. La producción de un producto a gran escala implica diferentes tipos de costes.\n a) Explique la diferencia entre costes fijos y costes variables en el contexto de la producción de un gran volumen.\n b) ¿Cómo afecta el volumen de producción al coste unitario total de un producto, considerando tanto los costes fijos como los variables?',
    result: 'a) Fijos: no varían con volumen. Variables: varían con volumen. b) A mayor volumen, menor coste unitario (los fijos se diluyen).',
    detailedAnswer: {
      procedure: 'a) Proceso: Costes fijos: No varían con el volumen de producción (ej. alquiler de fábrica, salario de administración). Costes variables: Varían directamente con el volumen de producción (ej. materia prima, mano de obra directa por pieza).\nb) Proceso: Al aumentar el volumen de producción, el coste unitario total tiende a disminuir porque los costes fijos se reparten entre un mayor número de unidades, reduciendo el coste fijo por unidad. Los costes variables por unidad permanecen constantes.',
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
          name: 'GUÍA DE ESTUDIO Y FORMULAR',
          type: 'summary',
        }),
        content: null,
        subtitle: 'DLP ACADEMY Departamento de Ciencias',
        origin: 'AI',
        isShared: false,
        editorUids: [],
        sharedWith: [],
        sharedWithUids: [],
        viewerUids: [],
        url: null,
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
        id: 'mock-quiz-cinematica',
        topicId: 'preview-topic-math-1',
        subjectId: 'preview-subject-1',
        title: 'Test: Cinematica',
        name: 'Test: Cinematica',
        level: 'Intermedio',
        type: 'basic',
        isShared: false,
        editorUids: [],
        sharedWith: [],
        sharedWithUids: [],
        viewerUids: [],
        studentId: null,
        questions: [
          {
            correctIndex: 0,
            formula: '$G = \\rho (\\vec{v} - \\vec{v}_c) \\cdot \\vec{A}$',
            options: [
              '$3.6 \\text{ kg/s}$',
              '$7.2 \\text{ kg/s}$',
              '$1.2 \\text{ kg/s}$',
              '$6.0 \\text{ kg/s}$',
            ],
            question: 'Considere un flujo uniforme e incompresible de aire (densidad $\\rho = 1.2 \\text{ kg/m}^3$) con un campo de velocidad $\\vec{v} = (3\\vec{e}_x + 4\\vec{e}_y) \\text{ m/s}$. Calcule el gasto másico $G$ a través de una superficie plana de $3 \\text{ m}^2$ perpendicular al eje $x$ que se mueve con una velocidad $\\vec{v}_c = (2\\vec{e}_x) \\text{ m/s}$.',
            rationale: 'El gasto másico se calcula como la densidad multiplicada por el producto escalar de la velocidad relativa del fluido con respecto a la superficie y el vector área. En este caso, la velocidad relativa es $(1\\vec{e}_x + 4\\vec{e}_y) \\text{ m/s}$ y el vector área es $(3\\vec{e}_x) \\text{ m}^2$, dando un producto escalar de $3 \\text{ m}^3/s$.',
          },
          {
            correctIndex: 0,
            formula: '$p_0 - p_\\infty = \\frac{1}{2}\\rho v_\\infty^2 = \\rho_m g h$',
            options: [
              '$v_\\infty = \\sqrt{\\frac{2\\rho_m g h}{\\rho}}$',
              '$v_\\infty = \\sqrt{\\frac{2\\rho g h}{\\rho_m}}$',
              '$v_\\infty = \\frac{\\rho_m g h}{\\rho}$',
              '$v_\\infty = \\sqrt{2g h}$',
            ],
            question: 'Un tubo de Pitot se utiliza para medir la velocidad $v_\\infty$ de una corriente de aire de densidad $\\rho$. Si un manómetro diferencial con fluido manométrico de densidad $\\rho_m \\gg \\rho$ mide una diferencia de alturas $h$, ¿cuál es la expresión correcta para $v_\\infty$?',
            rationale: 'Aplicando la ecuación de Bernoulli entre el punto de corriente libre y el punto de estancamiento, se tiene que la diferencia de presión dinámica es $\\frac{1}{2}\\rho v_\\infty^2$. Esta diferencia de presión es medida por el manómetro como $\\rho_m g h$.',
          },
          {
            correctIndex: 0,
            formula: '$F_x = A (p_1 - p_2 \\cos \\theta) - \\dot{m}(v \\cos \\theta - v)$',
            options: [
              '$A (p_1 - p_2 \\cos \\theta + \\rho v^2 (1 - \\cos \\theta))$',
              '$A (p_1 - p_2 \\cos \\theta - \\rho v^2 \\cos \\theta)$',
              '$A (p_1 + p_2 \\cos \\theta + \\rho v^2 (1 + \\cos \\theta))$',
              '$A (p_1 + p_2 \\cos \\theta - \\rho v^2 \\sin \\theta)$',
            ],
            question: 'Agua con densidad $\\rho$ y velocidad $v$ fluye a través de un codo de tubería circular de área $A$ que desvía el flujo un ángulo $\\theta$. Las presiones a la entrada y salida son $p_1$ y $p_2$ respectivamente. Si la entrada está en la dirección $x$ y la salida forma un ángulo $\\theta$ con el eje $x$, ¿cuál es la componente $x$ de la fuerza ejercida por el fluido sobre el codo?',
            rationale: 'La fuerza se determina aplicando la ecuación integral de cantidad de movimiento en la dirección $x$ a un volumen de control que abarca el codo, considerando las fuerzas de presión y el cambio en el momento del fluido.',
          },
          {
            correctIndex: 0,
            formula: '$\\dot{W}_{pump} = Q [(p_2 - p_1) + \\frac{1}{2}\\rho (v_2^2 - v_1^2)]$',
            options: [
              '$5.19 \\text{ kW}$',
              '$3.25 \\text{ kW}$',
              '$8.36 \\text{ kW}$',
              '$6.72 \\text{ kW}$',
            ],
            question: 'Una bomba horizontal descarga agua a $20 \\text{ °C}$ (densidad $\\rho \\approx 1000 \\text{ kg/m}^3$) con un caudal de $57 \\text{ m}^3/h$. La tubería de entrada tiene un diámetro $D_1 = 9 \\text{ cm}$ y una presión $p_1 = 120 \\text{ kPa}$. La tubería de salida tiene un diámetro $D_2 = 3 \\text{ cm}$ y una presión $p_2 = 200 \\text{ kPa}$. Despreciando las pérdidas, ¿qué potencia proporciona la bomba al agua?',
            rationale: 'La potencia de la bomba se calcula a partir de la ecuación de energía, considerando los cambios en la presión y la energía cinética del fluido entre la entrada y la salida de la bomba, sin pérdidas.',
          },
          {
            correctIndex: 0,
            formula: '$\\frac{d}{dt} (\\rho V) = \\dot{m}_{in} - \\dot{m}_{out}$',
            options: [
              '$\\rho A_1 \\frac{dh}{dt} + \\rho A_2 \\sqrt{2g(h - h_s)} = G$',
              '$\\rho A_1 \\frac{dh}{dt} = G + \\rho A_2 \\sqrt{2g(h - h_s)}$',
              '$\\rho A_1 \\frac{dh}{dt} - \\rho A_2 \\sqrt{2g(h - h_s)} = G$',
              '$\\rho A_1 \\frac{dh}{dt} = G - \\frac{1}{2}\\rho A_2 (h - h_s)^2$',
            ],
            question: 'Un depósito con área de base $A_1$ tiene un caudal másico constante de entrada $G$ y un orificio de salida de área $A_2 \\ll A_1$ por donde el agua se vacía por gravedad. Si el nivel del agua es $h(t)$ y la salida está a una altura $h_s$ desde el fondo, ¿cuál es la ecuación diferencial que gobierna la evolución de $h(t)$? Asuma flujo incompresible e ideal.',
            rationale: 'Se aplica la ecuación de conservación de la masa a un volumen de control que incluye el agua en el depósito. El caudal de salida se obtiene de la ecuación de Bernoulli para un vaciado por orificio bajo gravedad, y el caudal de entrada es $G$.',
          },
        ],
        formulas: [
          { display: '$G = \\rho (\\vec{v} - \\vec{v}_c) \\cdot \\vec{A}$' },
          { display: '$p_0 - p_\\infty = \\frac{1}{2}\\rho v_\\infty^2 = \\rho_m g h$' },
        ],
        createdAt: '2026-04-10T16:58:29.000Z',
        updatedAt: '2026-04-10T16:58:29.000Z',
      },
    ],
    exams: [
      {
        id: 'mock-exam-costes-1',
        topicId: 'preview-topic-math-1',
        subjectId: 'preview-subject-1',
        subjectid: 'preview-subject-1',
        title: 'Examen: DETERMINACIÓN DE COSTES - MODELO 4',
        fecha: null,
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
      id: 'mock-assignment-1',
      title: 'Tarao',
      description: '',
      dueAt: null,
      visibleToStudents: true,
      allowLateDelivery: false,
      instructionFiles: [],
      createdBy: 'preview-teacher',
      ownerId: 'preview-teacher',
      institutionId: PREVIEW_MOCK_INSTITUTION_ID,
      subjectId: 'preview-subject-1',
      topicId: 'preview-topic-math-1',
      createdAt: '2026-04-02T21:22:41.000Z',
      updatedAt: '2026-04-02T21:22:41.000Z',
    },
  ],
  'preview-topic-science-1': [
    {
      id: 'mock-assignment-science-1',
      title: 'Práctica de laboratorio',
      description: '',
      dueAt: null,
      visibleToStudents: true,
      allowLateDelivery: false,
      instructionFiles: [],
      createdBy: 'preview-teacher',
      ownerId: 'preview-teacher',
      institutionId: PREVIEW_MOCK_INSTITUTION_ID,
      subjectId: 'preview-subject-3',
      topicId: 'preview-topic-science-1',
      createdAt: '2026-04-02T21:22:41.000Z',
      updatedAt: '2026-04-02T21:22:41.000Z',
    },
  ],
};

const PREVIEW_MOCK_QUIZ_RESULTS_BY_TOPIC: Record<string, any[]> = {
  'preview-topic-math-1': [
    {
      id: 'mock-quiz-result-1',
      quizId: 'mock-quiz-cinematica',
      userId: 'preview-student-1',
      userName: 'Alumno Uno',
      userEmail: 'alumno1@preview.local',
      score: 84,
      completedAt: '2026-04-12T10:00:00.000Z',
    },
    {
      id: 'mock-quiz-result-2',
      quizId: 'mock-quiz-cinematica',
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
      quizId: 'mock-quiz-cinematica',
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
