// src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CalendarRange,
  ClipboardCheck,
  FileText,
  FlaskConical,
  FolderOpen,
  Link2,
  Paperclip,
  RotateCcw,
  Sigma,
  TestTube2,
  Trash2,
} from 'lucide-react';
import HomeControls from '../../../Home/components/HomeControls';
import HomeContent from '../../../Home/components/HomeContent';
import BreadcrumbNav from '../../../Home/components/BreadcrumbNav';
import SharedView from '../../../Home/components/SharedView';
import CustomizationPreviewHeader from './CustomizationPreviewHeader';
import { HOME_THEME_TOKENS, buildHomeThemeCssVariables } from '../../../../utils/themeTokens';
import { hexToRgba } from './themePreviewUtils';

const noop = () => {};
const HomeControlsComponent: any = HomeControls;
const HomeContentComponent: any = HomeContent;
const BreadcrumbNavComponent: any = BreadcrumbNav;
const SharedViewComponent: any = SharedView;

const PREVIEW_FOLDERS = [
  {
    id: 'preview-folder-1',
    name: 'Planificación semanal',
    tags: ['planificacion'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    parentId: null,
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    id: 'preview-folder-2',
    name: 'Evaluaciones',
    tags: ['evaluacion'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    parentId: null,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'preview-folder-3',
    name: 'Laboratorio',
    tags: ['laboratorio', 'practica'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    parentId: 'preview-folder-1',
    color: 'from-emerald-400 to-emerald-600',
  },
];

const PREVIEW_SUBJECTS = [
  {
    id: 'preview-subject-1',
    name: 'Matemáticas',
    course: '3º ESO',
    level: 'ESO',
    grade: '3º',
    tags: ['algebra', 'evaluacion'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    color: 'from-sky-400 to-sky-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#1d4ed8',
    completed: false,
    folderId: null,
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-20',
  },
  {
    id: 'preview-subject-2',
    name: 'Historia',
    course: '3º ESO',
    level: 'ESO',
    grade: '3º',
    tags: ['lectura'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    color: 'from-amber-400 to-amber-600',
    icon: 'book',
    cardStyle: 'modern',
    modernFillColor: '#f59e0b',
    completed: true,
    folderId: 'preview-folder-1',
    academicYear: '2024-2025',
    isCurrent: false,
    lastActivityAt: '2025-06-12',
  },
  {
    id: 'preview-subject-3',
    name: 'Ciencias',
    course: '2º ESO',
    level: 'ESO',
    grade: '2º',
    tags: ['laboratorio'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    color: 'from-emerald-400 to-emerald-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#10b981',
    completed: false,
    folderId: 'preview-folder-3',
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-18',
  },
  {
    id: 'preview-subject-4',
    name: 'Lengua',
    course: '1º ESO',
    level: 'ESO',
    grade: '1º',
    tags: ['lectura', 'gramatica'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    color: 'from-violet-400 to-violet-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#7c3aed',
    completed: false,
    folderId: null,
    academicYear: '2025-2026',
    isCurrent: true,
    lastActivityAt: '2026-03-11',
  },
  {
    id: 'preview-subject-5',
    name: 'Física y Química',
    course: '4º ESO',
    level: 'ESO',
    grade: '4º',
    tags: ['laboratorio', 'evaluacion'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    color: 'from-rose-400 to-rose-600',
    icon: 'book',
    cardStyle: 'modern',
    modernFillColor: '#e11d48',
    completed: false,
    folderId: 'preview-folder-2',
    academicYear: '2024-2025',
    isCurrent: false,
    lastActivityAt: '2025-05-27',
  },
];

const PREVIEW_SHARED_FOLDERS = [
  {
    id: 'preview-shared-folder-1',
    name: 'Banco compartido de rúbricas',
    tags: ['rubricas', 'evaluacion'],
    ownerId: 'preview-shared-owner',
    institutionId: 'preview-institution',
    parentId: null,
    isShared: true,
  },
];

const PREVIEW_SHARED_SUBJECTS = [
  {
    id: 'preview-shared-subject-1',
    name: 'Geografía compartida',
    course: '2º ESO',
    level: 'ESO',
    grade: '2º',
    tags: ['mapas', 'lectura'],
    ownerId: 'preview-shared-owner',
    institutionId: 'preview-institution',
    isShared: true,
    academicYear: '2025-2026',
    color: 'from-cyan-400 to-cyan-600',
    icon: 'book',
    cardStyle: 'default',
    modernFillColor: '#0891b2',
    completed: false,
  },
];

const PREVIEW_BIN_ITEMS = [
  {
    id: 'preview-bin-folder-1',
    itemType: 'folder',
    name: 'Actividades trimestrales',
    trashedAtLabel: 'hace 3 días',
    daysRemaining: 12,
  },
  {
    id: 'preview-bin-subject-1',
    itemType: 'subject',
    name: 'Tecnología',
    trashedAtLabel: 'hace 8 días',
    daysRemaining: 7,
  },
  {
    id: 'preview-bin-shortcut-1',
    itemType: 'shortcut-subject',
    name: 'Acceso directo: Arte',
    trashedAtLabel: 'hace 1 día',
    daysRemaining: 14,
  },
];

const PREVIEW_TOPICS_BY_SUBJECT = {
  'preview-subject-1': [
    {
      id: 'topic-math-1',
      name: 'Ecuaciones lineales',
      description: 'Resolución paso a paso y modelado de problemas.',
      resources: [
        { id: 'math-quiz-1', type: 'quiz', label: 'Cuestionarios', total: 2 },
        { id: 'math-exam-1', type: 'exam', label: 'Exámenes', total: 1 },
        { id: 'math-test-1', type: 'test', label: 'Tests', total: 3 },
        { id: 'math-material-1', type: 'material', label: 'Materiales', total: 5 },
        { id: 'math-file-1', type: 'file', label: 'Archivos', total: 4 },
        { id: 'math-formula-1', type: 'formula', label: 'Fórmulas', total: 8 },
        { id: 'math-guide-1', type: 'guide', label: 'Guías de estudio', total: 1 },
      ],
    },
    {
      id: 'topic-math-2',
      name: 'Sistemas de ecuaciones',
      description: 'Métodos de sustitución, igualación y reducción.',
      resources: [
        { id: 'math-quiz-2', type: 'quiz', label: 'Cuestionarios', total: 1 },
        { id: 'math-material-2', type: 'material', label: 'Materiales', total: 3 },
        { id: 'math-formula-2', type: 'formula', label: 'Fórmulas', total: 4 },
      ],
    },
  ],
  'preview-subject-2': [
    {
      id: 'topic-history-1',
      name: 'Ilustración y revolución',
      description: 'Ideas clave y conexión con cambios políticos.',
      resources: [
        { id: 'history-test-1', type: 'test', label: 'Tests', total: 2 },
        { id: 'history-material-1', type: 'material', label: 'Materiales', total: 4 },
        { id: 'history-guide-1', type: 'guide', label: 'Guías de estudio', total: 2 },
      ],
    },
  ],
  'preview-subject-3': [
    {
      id: 'topic-science-1',
      name: 'El método científico',
      description: 'Diseño experimental y análisis de resultados.',
      resources: [
        { id: 'science-quiz-1', type: 'quiz', label: 'Cuestionarios', total: 2 },
        { id: 'science-exam-1', type: 'exam', label: 'Exámenes', total: 1 },
        { id: 'science-material-1', type: 'material', label: 'Materiales', total: 6 },
      ],
    },
  ],
  'preview-subject-4': [
    {
      id: 'topic-language-1',
      name: 'Texto narrativo',
      description: 'Estructura, técnicas narrativas y práctica guiada.',
      resources: [
        { id: 'language-test-1', type: 'test', label: 'Tests', total: 2 },
        { id: 'language-material-1', type: 'material', label: 'Materiales', total: 4 },
      ],
    },
  ],
  'preview-subject-5': [
    {
      id: 'topic-physics-1',
      name: 'Enlace químico',
      description: 'Tipos de enlace y representaciones estructurales.',
      resources: [
        { id: 'physics-quiz-1', type: 'quiz', label: 'Cuestionarios', total: 1 },
        { id: 'physics-exam-1', type: 'exam', label: 'Exámenes', total: 1 },
        { id: 'physics-formula-1', type: 'formula', label: 'Fórmulas', total: 3 },
      ],
    },
  ],
  'preview-shared-subject-1': [
    {
      id: 'topic-shared-1',
      name: 'Cartografía básica',
      description: 'Lectura de mapas y orientación espacial.',
      resources: [
        { id: 'shared-guide-1', type: 'guide', label: 'Guías de estudio', total: 1 },
        { id: 'shared-material-1', type: 'material', label: 'Materiales', total: 3 },
      ],
    },
  ],
};

const RESOURCE_ICON_MAP = {
  exam: ClipboardCheck,
  test: TestTube2,
  quiz: FlaskConical,
  material: FileText,
  file: Paperclip,
  formula: Sigma,
  guide: BookOpen,
};

const RESOURCE_DESCRIPTION_MAP = {
  exam: 'Evaluaciones finales o parciales del tema.',
  test: 'Pruebas cortas de comprobación continua.',
  quiz: 'Actividades interactivas autocorregibles.',
  material: 'Documentos, apuntes y recursos didácticos.',
  file: 'Archivos descargables y adjuntos del tema.',
  formula: 'Resumen de fórmulas y relaciones clave.',
  guide: 'Plan de estudio guiado para repaso.',
};

const parseAcademicYearStart = (academicYear: any) => {
  const raw = String(academicYear || '').trim();
  if (!/^\d{4}-\d{4}$/.test(raw)) return null;
  const startYear = Number(raw.slice(0, 4));
  return Number.isFinite(startYear) ? startYear : null;
};

const normalizeText = (value: any) => String(value || '').trim().toLowerCase();

const matchesSearchTerm = (entity: any, query: any) => {
  if (!query) return true;
  const searchable = [
    entity?.name,
    entity?.course,
    entity?.academicYear,
    ...(Array.isArray(entity?.tags) ? entity.tags : []),
  ].join(' ').toLowerCase();
  return searchable.includes(query);
};

const getFolderLineage = (folder: any, allFolders: any[]) => {
  const lineage = [] as any[];
  const folderById = new Map((allFolders || []).map((entry: any) => [entry.id, entry]));
  let cursor = folder;
  let guard = 0;

  while (cursor && guard < 30) {
    lineage.unshift(cursor);
    const nextParentId = cursor?.parentId || null;
    cursor = nextParentId ? folderById.get(nextParentId) : null;
    guard += 1;
  }

  return lineage;
};

const CustomizationHomeExactPreview = ({
  form,
  previewRole = 'teacher',
  viewportWidth = '100%',
  activeToken = null,
}: any) => {
  const [viewMode, setViewMode] = useState('grid');
  const [layoutMode, setLayoutMode] = useState('grid');
  const [cardScale, setCardScale] = useState(100);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [sharedSelectedTags, setSharedSelectedTags] = useState<any[]>([]);
  const [sharedScopeSelected, setSharedScopeSelected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<any>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<any>({});
  const [showOnlyCurrentSubjects, setShowOnlyCurrentSubjects] = useState(false);
  const [coursesAcademicYearFilter, setCoursesAcademicYearFilter] = useState({ startYear: '', endYear: '' });
  const [activeMenu, setActiveMenu] = useState<any>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const isStudentRole = previewRole === 'student';
  const normalizedSearch = normalizeText(searchQuery);

  useEffect(() => {
    setCurrentFolder(null);
    setSelectedSubjectId('');
    setSelectedTopicId('');
    setCollapsedGroups({});
  }, [viewMode]);

  const cssVariables = useMemo(() => buildHomeThemeCssVariables({
    primary: form?.primary,
    secondary: form?.secondary,
    accent: form?.accent,
    mutedText: '#6b7280',
    cardBorder: form?.cardBorder,
    cardBackground: '#ffffff',
  }), [form?.primary, form?.secondary, form?.accent, form?.cardBorder]);

  const previewUser = useMemo(() => ({
    uid: isStudentRole ? 'preview-student' : 'preview-teacher',
    role: isStudentRole ? 'student' : 'teacher',
    displayName: isStudentRole ? 'Estudiante demo' : 'Docente demo',
    email: isStudentRole ? 'estudiante@demo.es' : 'docente@demo.es',
    institutionId: 'preview-institution',
  }), [isStudentRole]);

  const allTags = useMemo(() => {
    const uniqueTags = new Set<string>();
    [...PREVIEW_SUBJECTS, ...PREVIEW_FOLDERS, ...PREVIEW_SHARED_SUBJECTS, ...PREVIEW_SHARED_FOLDERS].forEach((entity: any) => {
      (entity?.tags || []).forEach((tag: any) => uniqueTags.add(String(tag)));
    });
    return Array.from(uniqueTags);
  }, []);

  const availableCourseAcademicYears = useMemo(() => {
    const uniqueYears = new Set<string>();
    PREVIEW_SUBJECTS.forEach((subject: any) => {
      if (subject?.academicYear) uniqueYears.add(subject.academicYear);
    });

    return Array.from(uniqueYears).sort((left: any, right: any) => {
      const leftStart = parseAcademicYearStart(left) ?? 0;
      const rightStart = parseAcademicYearStart(right) ?? 0;
      return rightStart - leftStart;
    });
  }, []);

  const isWithinAcademicYearRange = (academicYear: any) => {
    const startFilterYear = parseAcademicYearStart(coursesAcademicYearFilter.startYear);
    const endFilterYear = parseAcademicYearStart(coursesAcademicYearFilter.endYear);

    if (startFilterYear == null && endFilterYear == null) return true;

    const subjectStartYear = parseAcademicYearStart(academicYear);
    if (subjectStartYear == null) return false;

    if (startFilterYear != null && endFilterYear != null) {
      const minYear = Math.min(startFilterYear, endFilterYear);
      const maxYear = Math.max(startFilterYear, endFilterYear);
      return subjectStartYear >= minYear && subjectStartYear <= maxYear;
    }

    if (startFilterYear != null) return subjectStartYear >= startFilterYear;
    return subjectStartYear <= (endFilterYear as number);
  };

  const matchesTagSet = (entity: any, activeTags: any[]) => {
    if (!Array.isArray(activeTags) || activeTags.length === 0) return true;
    const itemTags = Array.isArray(entity?.tags) ? entity.tags : [];
    return activeTags.every((tag: any) => itemTags.includes(tag));
  };

  const manualFolders = useMemo(() => {
    return PREVIEW_FOLDERS.filter((folder: any) => {
      const expectedParentId = currentFolder?.id || null;
      return (folder?.parentId || null) === expectedParentId
        && matchesSearchTerm(folder, normalizedSearch)
        && matchesTagSet(folder, selectedTags);
    });
  }, [currentFolder?.id, normalizedSearch, selectedTags]);

  const manualSubjects = useMemo(() => {
    return PREVIEW_SUBJECTS.filter((subject: any) => {
      const expectedParentId = currentFolder?.id || null;
      const subjectParentId = subject?.folderId || null;
      return subjectParentId === expectedParentId
        && matchesSearchTerm(subject, normalizedSearch)
        && matchesTagSet(subject, selectedTags);
    });
  }, [currentFolder?.id, normalizedSearch, selectedTags]);

  const usageSubjects = useMemo(() => {
    return PREVIEW_SUBJECTS
      .filter((subject: any) => matchesSearchTerm(subject, normalizedSearch))
      .filter((subject: any) => matchesTagSet(subject, selectedTags))
      .filter((subject: any) => (showOnlyCurrentSubjects ? subject?.isCurrent === true : true))
      .sort((left: any, right: any) => {
        const leftDate = new Date(left?.lastActivityAt || 0).getTime();
        const rightDate = new Date(right?.lastActivityAt || 0).getTime();
        return rightDate - leftDate;
      });
  }, [normalizedSearch, selectedTags, showOnlyCurrentSubjects]);

  const coursesGroupedContent = useMemo(() => {
    const grouped = {} as Record<string, any[]>;

    PREVIEW_SUBJECTS
      .filter((subject: any) => matchesSearchTerm(subject, normalizedSearch))
      .filter((subject: any) => matchesTagSet(subject, selectedTags))
      .filter((subject: any) => (showOnlyCurrentSubjects ? subject?.isCurrent === true : true))
      .filter((subject: any) => isWithinAcademicYearRange(subject?.academicYear))
      .forEach((subject: any) => {
        const courseLabel = subject?.course || 'Sin curso';
        const yearLabel = subject?.academicYear || 'Sin año académico';
        const groupKey = `${courseLabel} (${yearLabel})`;
        if (!Array.isArray(grouped[groupKey])) grouped[groupKey] = [];
        grouped[groupKey].push(subject);
      });

    return Object.keys(grouped)
      .sort((left: any, right: any) => {
        const leftYear = parseAcademicYearStart((left.match(/\(([^)]+)\)$/) || [])[1]) ?? 0;
        const rightYear = parseAcademicYearStart((right.match(/\(([^)]+)\)$/) || [])[1]) ?? 0;
        if (leftYear !== rightYear) return rightYear - leftYear;
        return left.localeCompare(right, 'es');
      })
      .reduce((acc: any, groupKey: any) => {
        acc[groupKey] = grouped[groupKey];
        return acc;
      }, {} as Record<string, any[]>);
  }, [normalizedSearch, selectedTags, showOnlyCurrentSubjects, coursesAcademicYearFilter]);

  const sharedFolders = useMemo(() => {
    return PREVIEW_SHARED_FOLDERS.filter((folder: any) => {
      return matchesSearchTerm(folder, normalizedSearch)
        && matchesTagSet(folder, sharedSelectedTags)
        && (sharedScopeSelected ? true : folder?.isShared !== true);
    });
  }, [normalizedSearch, sharedSelectedTags, sharedScopeSelected]);

  const sharedSubjects = useMemo(() => {
    return PREVIEW_SHARED_SUBJECTS.filter((subject: any) => {
      return matchesSearchTerm(subject, normalizedSearch)
        && matchesTagSet(subject, sharedSelectedTags)
        && (sharedScopeSelected ? true : subject?.isShared !== true);
    });
  }, [normalizedSearch, sharedSelectedTags, sharedScopeSelected]);

  const groupedContent = useMemo(() => {
    if (viewMode === 'usage') {
      return {
        'Actividad reciente': usageSubjects,
      };
    }

    if (viewMode === 'courses') {
      return coursesGroupedContent;
    }

    return {
      Manual: manualSubjects,
    };
  }, [viewMode, usageSubjects, coursesGroupedContent, manualSubjects]);

  const selectedSubject = useMemo(() => {
    const combinedSubjects = [...PREVIEW_SUBJECTS, ...PREVIEW_SHARED_SUBJECTS];
    return combinedSubjects.find((subject: any) => subject.id === selectedSubjectId) || null;
  }, [selectedSubjectId]);

  const selectedSubjectTopics = useMemo(() => {
    if (!selectedSubjectId) return [];
    return PREVIEW_TOPICS_BY_SUBJECT[selectedSubjectId] || [];
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!selectedSubjectTopics.length) {
      setSelectedTopicId('');
      return;
    }

    const topicStillExists = selectedSubjectTopics.some((topic: any) => topic.id === selectedTopicId);
    if (!topicStillExists) {
      setSelectedTopicId(selectedSubjectTopics[0].id);
    }
  }, [selectedSubjectTopics, selectedTopicId]);

  const selectedTopic = useMemo(() => {
    return selectedSubjectTopics.find((topic: any) => topic.id === selectedTopicId) || null;
  }, [selectedSubjectTopics, selectedTopicId]);

  const activeFoldersForBreadcrumbs = viewMode === 'shared' ? PREVIEW_SHARED_FOLDERS : PREVIEW_FOLDERS;

  const canShowBreadcrumbs = (viewMode === 'grid' || viewMode === 'shared') && Boolean(currentFolder);

  const closeSubjectDetail = () => {
    setSelectedSubjectId('');
    setSelectedTopicId('');
  };

  const handleSelectSubject = (subjectId: any) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId('');
  };

  const handleOpenFolder = (folder: any) => {
    setCurrentFolder(folder || null);
    closeSubjectDetail();
  };

  const toggleGroup = (groupKey: any, isCollapsed: any) => {
    setCollapsedGroups((previous: any) => ({
      ...previous,
      [groupKey]: !isCollapsed,
    }));
  };

  const currentFolderLineage = useMemo(() => {
    if (!currentFolder) return [];
    return getFolderLineage(currentFolder, activeFoldersForBreadcrumbs);
  }, [currentFolder, activeFoldersForBreadcrumbs]);

  const previewBinItems = useMemo(() => {
    return PREVIEW_BIN_ITEMS.filter((item: any) => matchesSearchTerm(item, normalizedSearch));
  }, [normalizedSearch]);

  const frameStyle = activeToken && form?.[activeToken]
    ? {
        borderColor: form.cardBorder,
        boxShadow: `0 0 0 2px ${hexToRgba(form[activeToken], 0.42)}`,
      }
    : {
        borderColor: form?.cardBorder || '#d1d5db',
      };

  const isSharedView = viewMode === 'shared';
  const isBinView = viewMode === 'bin';

  const activeTagSelection = isSharedView ? sharedSelectedTags : selectedTags;

  const handleTagSelectionChange = (nextTags: any) => {
    if (isSharedView) {
      setSharedSelectedTags(nextTags);
    } else {
      setSelectedTags(nextTags);
    }
  };

  const renderSubjectPreviewDetail = () => {
    if (!selectedSubject) return null;

    return (
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              {selectedSubject.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Curso {selectedSubject.course || 'Sin curso'} · {selectedSubject.academicYear || 'Sin año académico'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeSubjectDetail}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={13} /> Volver a asignaturas
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr]">
          <aside className="border-r border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 px-3 py-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
              Temas de la asignatura
            </p>
            {selectedSubjectTopics.length === 0 ? (
              <p className="text-xs text-slate-400">Esta asignatura no tiene temas simulados.</p>
            ) : (
              selectedSubjectTopics.map((topic: any) => {
                const isActive = topic.id === selectedTopicId;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                      isActive
                        ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-semibold">{topic.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{topic.description}</p>
                  </button>
                );
              })
            )}
          </aside>

          <div className="px-4 py-4">
            {selectedTopic ? (
              <>
                <div className="mb-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedTopic.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedTopic.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {selectedTopic.resources.map((resource: any) => {
                    const Icon = RESOURCE_ICON_MAP[resource.type] || FileText;
                    return (
                      <article
                        key={resource.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Icon size={14} className="text-indigo-500" />
                            {resource.label}
                          </p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                            {resource.total}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          {RESOURCE_DESCRIPTION_MAP[resource.type] || 'Recurso disponible en este tema.'}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona un tema para ver su contenido.</p>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderMockBin = () => {
    const isListLayout = layoutMode === 'list';

    return (
      <section className="space-y-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" />
            Papelera de vista previa
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Esta sección simula restauración y eliminación definitiva sin tocar datos reales.
          </p>
        </div>

        {previewBinItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No hay elementos simulados en papelera para esta búsqueda.
          </div>
        ) : isListLayout ? (
          <div className="space-y-2">
            {previewBinItems.map((item: any) => {
              const isFolder = item.itemType === 'folder';
              const isShortcut = item.itemType.startsWith('shortcut');

              return (
                <article
                  key={item.id}
                  data-testid={`preview-bin-list-item-${item.id}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                        {isFolder ? <FolderOpen size={15} className="text-amber-500" /> : isShortcut ? <Link2 size={15} className="text-sky-500" /> : <BookOpen size={15} className="text-indigo-500" />}
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Eliminado {item.trashedAtLabel}. {item.daysRemaining} días restantes.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.itemType}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      >
                        <RotateCcw size={13} /> Restaurar
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {previewBinItems.map((item: any) => {
              const isFolder = item.itemType === 'folder';
              const isShortcut = item.itemType.startsWith('shortcut');

              return (
                <article
                  key={item.id}
                  data-testid={`preview-bin-grid-item-${item.id}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {isFolder ? <FolderOpen size={15} className="text-amber-500" /> : isShortcut ? <Link2 size={15} className="text-sky-500" /> : <BookOpen size={15} className="text-indigo-500" />}
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Eliminado {item.trashedAtLabel}. {item.daysRemaining} días restantes.
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.itemType}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                    >
                      <RotateCcw size={13} /> Restaurar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                    >
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="home-page rounded-2xl border overflow-hidden transition-all" style={{ ...cssVariables, ...frameStyle }}>
      <div className="p-4 bg-slate-200 dark:bg-slate-950">
        <div
          className="mx-auto rounded-2xl border border-[var(--home-card-border)] bg-slate-50 dark:bg-slate-900 transition-all duration-300"
          style={{ maxWidth: viewportWidth }}
        >
          <CustomizationPreviewHeader
            institutionName={form?.institutionName}
            previewRole={previewRole}
            primaryColor={form?.primary || '#6366f1'}
          />

          <div className="px-4 pt-4">
            <HomeControlsComponent
              viewMode={viewMode}
              setViewMode={setViewMode}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              cardScale={cardScale}
              setCardScale={setCardScale}
              allTags={allTags}
              selectedTags={activeTagSelection}
              setSelectedTags={handleTagSelectionChange}
              currentFolder={currentFolder}
              setFolderModalConfig={noop}
              setCollapsedGroups={setCollapsedGroups}
              setCurrentFolder={setCurrentFolder}
              isDragAndDropEnabled={false}
              draggedItem={null}
              draggedItemType={null}
              onPreferenceChange={noop}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery as any}
              activeFilter="all"
              onFilterOverlayChange={noop}
              onScaleOverlayChange={noop}
              sharedScopeSelected={sharedScopeSelected}
              onSharedScopeChange={setSharedScopeSelected}
              canCreateFolder={!isStudentRole}
              showSharedTab={!isStudentRole}
              hideSharedScopeToggle={isStudentRole || isSharedView}
              studentMode={isStudentRole}
              showOnlyCurrentSubjects={showOnlyCurrentSubjects}
              setShowOnlyCurrentSubjects={setShowOnlyCurrentSubjects}
              coursesAcademicYearFilter={coursesAcademicYearFilter}
              setCoursesAcademicYearFilter={setCoursesAcademicYearFilter}
              availableCourseAcademicYears={availableCourseAcademicYears}
            />
          </div>

          <div className="px-4 pb-4 space-y-4">
            {canShowBreadcrumbs && (
              <BreadcrumbNavComponent
                currentFolder={currentFolder}
                onNavigate={handleOpenFolder}
                allFolders={activeFoldersForBreadcrumbs}
                onDropOnBreadcrumb={noop}
                draggedItem={null}
                draggedItemType={null}
              />
            )}

            {currentFolderLineage.length > 0 && (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CalendarRange size={13} className="text-slate-400" />
                {currentFolderLineage.map((entry: any, index: any) => (
                  <React.Fragment key={entry.id}>
                    {index > 0 && <span>/</span>}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{entry.name}</span>
                  </React.Fragment>
                ))}
              </div>
            )}

            {renderSubjectPreviewDetail()}

            {isSharedView ? (
              <SharedViewComponent
                user={previewUser}
                homeThemeTokens={HOME_THEME_TOKENS}
                sharedFolders={sharedFolders}
                sharedSubjects={sharedSubjects}
                layoutMode={layoutMode}
                cardScale={cardScale}
                currentFolder={currentFolder}
                onOpenFolder={handleOpenFolder}
                onSelectSubject={(subject: any) => handleSelectSubject(subject.id)}
                activeMenu={activeMenu}
                onToggleMenu={setActiveMenu}
                flippedSubjectId={null}
                onFlipSubject={noop}
                allFolders={sharedFolders}
                allSubjects={sharedSubjects}
                onEditFolder={noop}
                onDeleteFolder={noop}
                onShareFolder={noop}
                onEditSubject={noop}
                onDeleteSubject={noop}
                onShareSubject={noop}
                onOpenSubjectClasses={noop}
              />
            ) : isBinView ? (
              renderMockBin()
            ) : (
              <HomeContentComponent
                user={previewUser}
                homeThemeTokens={HOME_THEME_TOKENS}
                viewMode={viewMode}
                layoutMode={layoutMode}
                cardScale={cardScale}
                groupedContent={groupedContent}
                collapsedGroups={collapsedGroups}
                toggleGroup={toggleGroup}
                currentFolder={viewMode === 'grid' ? currentFolder : null}
                orderedFolders={viewMode === 'grid' && !isStudentRole ? manualFolders : []}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                setSubjectModalConfig={noop}
                setFolderModalConfig={noop}
                setDeleteConfig={noop}
                setSubjectCompletion={noop}
                completedSubjectIds={[]}
                handleSelectSubject={handleSelectSubject}
                handleOpenFolder={handleOpenFolder}
                handleDropOnFolder={noop}
                handleNestFolder={noop}
                handlePromoteSubject={noop}
                handlePromoteFolder={noop}
                handleShowFolderContents={noop}
                handleMoveSubjectWithSource={noop}
                handleMoveFolderWithSource={noop}
                onOpenTopics={noop}
                isDragAndDropEnabled={false}
                draggedItem={null}
                draggedItemType={null}
                handleDragStartSubject={noop}
                handleDragStartFolder={noop}
                handleDragEnd={noop}
                handleDragOverSubject={noop}
                handleDragOverFolder={noop}
                handleDropReorderSubject={noop}
                handleDropReorderFolder={noop}
                subjects={PREVIEW_SUBJECTS}
                folders={PREVIEW_FOLDERS}
                resolvedShortcuts={[]}
                navigate={noop}
                onCardFocus={noop}
                getCardVisualState={() => ({ isAnimating: false, isCutPending: false })}
                activeFilter="all"
                selectedTags={selectedTags}
                sharedScopeSelected={sharedScopeSelected}
                filterOverlayOpen={false}
                studentMode={isStudentRole}
                selectMode={false}
                selectedItemKeys={new Set()}
                onToggleSelectItem={noop}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationHomeExactPreview;