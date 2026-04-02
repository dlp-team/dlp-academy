// src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx
import React, { useMemo, useState } from 'react';
import HomeControls from '../../../Home/components/HomeControls';
import HomeContent from '../../../Home/components/HomeContent';
import { HOME_THEME_TOKENS, buildHomeThemeCssVariables } from '../../../../utils/themeTokens';
import { hexToRgba } from './themePreviewUtils';

const noop = () => {};

const PREVIEW_FOLDERS = [
  {
    id: 'preview-folder-1',
    name: 'Planificación semanal',
    tags: ['planificacion'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    id: 'preview-folder-2',
    name: 'Evaluaciones',
    tags: ['evaluacion'],
    ownerId: 'preview-teacher',
    institutionId: 'preview-institution',
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
  },
];

const CustomizationHomeExactPreview = ({
  form,
  previewRole = 'teacher',
  viewportWidth = '100%',
  activeToken = null,
}: any) => {
  const [layoutMode, setLayoutMode] = useState('grid');
  const [cardScale, setCardScale] = useState(100);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<any>(null);

  const isStudentRole = previewRole === 'student';
  const normalizedSearch = searchQuery.trim().toLowerCase();

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

  const previewSubjects = useMemo(() => {
    return PREVIEW_SUBJECTS.filter((subject) => {
      if (!normalizedSearch) return true;
      const searchable = [subject.name, subject.course, ...(subject.tags || [])]
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedSearch);
    });
  }, [normalizedSearch]);

  const previewFolders = useMemo(() => {
    if (isStudentRole) return [];
    return PREVIEW_FOLDERS.filter((folder) => {
      if (!normalizedSearch) return true;
      const searchable = [folder.name, ...(folder.tags || [])].join(' ').toLowerCase();
      return searchable.includes(normalizedSearch);
    });
  }, [isStudentRole, normalizedSearch]);

  const groupedContent = useMemo(() => ({ 'Vista previa': previewSubjects }), [previewSubjects]);

  const allTags = useMemo(() => {
    const uniqueTags = new Set<string>();

    previewSubjects.forEach((subject) => {
      (subject.tags || []).forEach((tag: any) => uniqueTags.add(String(tag)));
    });

    previewFolders.forEach((folder) => {
      (folder.tags || []).forEach((tag: any) => uniqueTags.add(String(tag)));
    });

    return Array.from(uniqueTags);
  }, [previewSubjects, previewFolders]);

  const frameStyle = activeToken && form?.[activeToken]
    ? {
        borderColor: form.cardBorder,
        boxShadow: `0 0 0 2px ${hexToRgba(form[activeToken], 0.42)}`,
      }
    : {
        borderColor: form?.cardBorder || '#d1d5db',
      };

  return (
    <div className="home-page rounded-2xl border overflow-hidden transition-all" style={{ ...cssVariables, ...frameStyle }}>
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Vista previa exacta</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isStudentRole ? 'Panel estudiante' : 'Panel docente'} · reutiliza componentes reales de Home con datos simulados.
        </p>
      </div>

      <div className="p-4 bg-slate-200 dark:bg-slate-950">
        <div
          className="mx-auto rounded-2xl border border-[var(--home-card-border)] bg-slate-50 dark:bg-slate-900 transition-all duration-300"
          style={{ maxWidth: viewportWidth }}
        >
          <div className="px-4 pt-4">
            <HomeControls
              viewMode="grid"
              setViewMode={noop}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              cardScale={cardScale}
              setCardScale={setCardScale}
              allTags={allTags}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              currentFolder={null}
              setFolderModalConfig={noop}
              setCollapsedGroups={noop}
              setCurrentFolder={noop}
              isDragAndDropEnabled={false}
              draggedItem={null}
              draggedItemType={null}
              onPreferenceChange={noop}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery as any}
              activeFilter="all"
              onFilterOverlayChange={noop}
              onScaleOverlayChange={noop}
              sharedScopeSelected={true}
              onSharedScopeChange={noop}
              canCreateFolder={!isStudentRole}
              showSharedTab={!isStudentRole}
              hideSharedScopeToggle={isStudentRole}
              studentMode={isStudentRole}
            />
          </div>

          <div className="px-4 pb-4">
            <HomeContent
              user={previewUser}
              homeThemeTokens={HOME_THEME_TOKENS}
              viewMode="grid"
              layoutMode={layoutMode}
              cardScale={cardScale}
              groupedContent={groupedContent}
              collapsedGroups={{}}
              toggleGroup={noop}
              currentFolder={null}
              orderedFolders={previewFolders}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              setSubjectModalConfig={noop}
              setFolderModalConfig={noop}
              setDeleteConfig={noop}
              setSubjectCompletion={noop}
              completedSubjectIds={[]}
              handleSelectSubject={noop}
              handleOpenFolder={noop}
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
              subjects={previewSubjects}
              folders={previewFolders}
              resolvedShortcuts={[]}
              navigate={noop}
              onCardFocus={noop}
              getCardVisualState={() => ({ isAnimating: false, isCutPending: false })}
              activeFilter="all"
              selectedTags={selectedTags}
              sharedScopeSelected={true}
              filterOverlayOpen={false}
              studentMode={isStudentRole}
              selectMode={false}
              selectedItemKeys={new Set()}
              onToggleSelectItem={noop}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationHomeExactPreview;