// src/pages/ThemePreview/ThemePreview.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import Home from '../Home/Home';
import Subject from '../Subject/Subject';
import Topic from '../Topic/Topic';
import Profile from '../Profile/Profile';
import Settings from '../Settings/Settings';
import Notifications from '../Notifications/Notifications';
import { isInstitutionPreviewThemeMessage } from '../../utils/institutionPreviewProtocol';

const THEME_PREVIEW_SESSION_KEY = 'dlp_theme_preview_active';

const PREVIEW_ROLE_KEYS = new Set(['teacher', 'student']);
const USER_ROLE_KEYS = new Set(['teacher', 'student', 'institutionadmin', 'admin']);

const MockDashboardPreview = ({ role = 'teacher' }: any) => {
  const isStudentRole = role === 'student';
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {isStudentRole ? 'Panel de estudiante (mock preview)' : 'Panel de docente (mock preview)'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Vista simulada para revisar tema, estructura y estilos sin usar datos reales.
        </p>
        <div className="mt-4">
          <Link
            to="/theme-preview/home"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

const MockTopicContentPreview = () => {
  const { subjectId, topicId } = useParams();
  const location = useLocation();
  const section = location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'contenido';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Contenido de tema (mock preview)</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Seccion simulada: {section}. Esta ruta usa datos mock para vista previa.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/theme-preview/home/subject/${subjectId || ''}/topic/${topicId || ''}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          >
            Volver al tema
          </Link>
          <Link
            to="/theme-preview/home"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold"
          >
            Volver a inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

const normalizePreviewRole = (value: any) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'student' ? 'student' : 'teacher';
};

const normalizeKnownRole = (value: any) => {
  const normalized = String(value || '').trim().toLowerCase();
  return USER_ROLE_KEYS.has(normalized) ? normalized : null;
};

const buildUniqueRoles = (candidate: any) => {
  const roleCandidates = [
    candidate?.activeRole,
    candidate?.role,
    ...(Array.isArray(candidate?.roles) ? candidate.roles : []),
    ...(Array.isArray(candidate?.availableRoles) ? candidate.availableRoles : []),
  ];

  return Array.from(new Set(
    roleCandidates
      .map((entry: any) => normalizeKnownRole(entry))
      .filter(Boolean)
  ));
};

const sanitizePreviewUser = (candidate: any) => {
  if (!candidate || typeof candidate !== 'object') return null;

  const uid = String(candidate?.uid || '').trim();
  if (!uid) return null;

  const email = String(candidate?.email || '').trim();
  const displayName = String(candidate?.displayName || '').trim()
    || (email.includes('@') ? email.split('@')[0] : 'Vista previa');
  const institutionId = String(candidate?.institutionId || '').trim() || null;
  const roles = buildUniqueRoles(candidate);
  const fallbackRole = normalizeKnownRole(candidate?.activeRole || candidate?.role) || 'teacher';

  if (!roles.includes(fallbackRole)) {
    roles.push(fallbackRole);
  }

  return {
    uid,
    email,
    displayName,
    photoURL: String(candidate?.photoURL || '').trim(),
    institutionId,
    role: fallbackRole,
    activeRole: fallbackRole,
    roles,
    availableRoles: [...roles],
    classId: candidate?.classId || null,
    classIds: Array.isArray(candidate?.classIds) ? candidate.classIds : [],
    completedSubjects: Array.isArray(candidate?.completedSubjects) ? candidate.completedSubjects : [],
    settings: candidate?.settings && typeof candidate.settings === 'object' ? candidate.settings : {},
  };
};

const buildPreviewUserWithRole = (baseUser: any, previewRole: any) => {
  if (!baseUser) return null;

  const safePreviewRole = PREVIEW_ROLE_KEYS.has(String(previewRole || '').trim().toLowerCase())
    ? String(previewRole || '').trim().toLowerCase()
    : 'teacher';

  // The preview role is controlled from the customization toolbar, so the
  // in-app header role selector inside the iframe must stay hidden.
  const lockedRoles = [safePreviewRole];

  return {
    ...baseUser,
    role: safePreviewRole,
    activeRole: safePreviewRole,
    roles: lockedRoles,
    availableRoles: lockedRoles,
    rememberSort: false,
    __previewLock: true,
    __previewMockData: true,
  };
};

const ThemePreview = () => {
  const [searchParams] = useSearchParams();
  const [previewRole, setPreviewRole] = useState(() => normalizePreviewRole(searchParams.get('role')));
  const [previewUser, setPreviewUser] = useState<any>(null);
  const [waitingForContext, setWaitingForContext] = useState(true);

  useEffect(() => {
    setPreviewRole(normalizePreviewRole(searchParams.get('role')));
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(THEME_PREVIEW_SESSION_KEY, '1');
    } catch {
      // Ignore storage write errors in restricted contexts.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    const upsertStyleTag = (id: string, cssText: string) => {
      let styleTag = document.getElementById(id) as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = id;
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = cssText || '';
    };

    const clearHighlightHint = () => {
      document.body.removeAttribute('data-dlp-preview-highlight');
    };

    const handlePreviewMessage = (event: MessageEvent) => {
      if (!event || event.origin !== window.location.origin) return;

      const message = event.data;
      if (!isInstitutionPreviewThemeMessage(message)) return;

      const payload = message.payload || {};
      setWaitingForContext(false);

      if (typeof payload.themeCss === 'string') {
        upsertStyleTag('__dlp_theme_preview_runtime_theme', payload.themeCss);
      }

      if (typeof payload.highlightCss === 'string') {
        upsertStyleTag('__dlp_theme_preview_runtime_highlight', payload.highlightCss);
      }

      if (typeof payload.previewRole === 'string') {
        setPreviewRole(normalizePreviewRole(payload.previewRole));
      }

      const nextPreviewUser = sanitizePreviewUser(payload.previewUser);
      if (nextPreviewUser) {
        setPreviewUser(nextPreviewUser);
      }

      const highlightMessage = typeof payload.highlightMessage === 'string'
        ? payload.highlightMessage.trim()
        : '';

      if (highlightMessage) {
        document.body.setAttribute('data-dlp-preview-highlight', highlightMessage);
      } else {
        clearHighlightHint();
      }
    };

    window.addEventListener('message', handlePreviewMessage as EventListener);

    return () => {
      window.removeEventListener('message', handlePreviewMessage as EventListener);
      clearHighlightHint();
    };
  }, []);

  const resolvedPreviewUser = useMemo(
    () => buildPreviewUserWithRole(previewUser, previewRole),
    [previewUser, previewRole]
  );

  if (!resolvedPreviewUser) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {waitingForContext ? 'Cargando vista previa...' : 'No hay contexto de usuario para la vista previa.'}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {waitingForContext
              ? 'Esperando configuracion enviada desde el panel de personalizacion.'
              : 'Vuelve a abrir la vista previa desde Personalizacion para continuar.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route index element={<Home user={resolvedPreviewUser} />} />
      <Route path="home" element={<Home user={resolvedPreviewUser} />} />
      <Route path="home/subject/:subjectId" element={<Subject user={resolvedPreviewUser} />} />
      <Route path="home/subject/:subjectId/topic/:topicId" element={<Topic user={resolvedPreviewUser} />} />
      <Route path="home/subject/:subjectId/topic/:topicId/*" element={<MockTopicContentPreview />} />
      <Route path="profile" element={<Profile user={resolvedPreviewUser} />} />
      <Route path="settings" element={<Settings user={resolvedPreviewUser} />} />
      <Route path="notifications" element={<Notifications user={resolvedPreviewUser} />} />
      <Route path="teacher-dashboard" element={<MockDashboardPreview role="teacher" />} />
      <Route path="student-dashboard" element={<MockDashboardPreview role="student" />} />
      <Route path="*" element={<Navigate to="/theme-preview/home" replace />} />
    </Routes>
  );
};

export default ThemePreview;
