// src/pages/ThemePreview/ThemePreview.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Home from '../Home/Home';
import { isInstitutionPreviewThemeMessage } from '../../utils/institutionPreviewProtocol';

const PREVIEW_ROLE_KEYS = new Set(['teacher', 'student']);
const USER_ROLE_KEYS = new Set(['teacher', 'student', 'institutionadmin', 'admin']);

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

  const mergedRoles = Array.from(new Set([
    safePreviewRole,
    ...(Array.isArray(baseUser?.roles) ? baseUser.roles : []),
    ...(Array.isArray(baseUser?.availableRoles) ? baseUser.availableRoles : []),
  ]));

  return {
    ...baseUser,
    role: safePreviewRole,
    activeRole: safePreviewRole,
    roles: mergedRoles,
    availableRoles: mergedRoles,
    rememberSort: false,
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
    <Home user={resolvedPreviewUser} />
  );
};

export default ThemePreview;
