// src/pages/ThemePreview/ThemePreview.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomizationHomeExactPreview from '../InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview';
import { DEFAULTS } from '../InstitutionAdminDashboard/components/customization/themePreviewUtils';
import { isInstitutionPreviewThemeMessage } from '../../utils/institutionPreviewProtocol';

const COLOR_KEYS = ['primary', 'secondary', 'accent', 'cardBorder'];

const isHexColor = (value: any) => (
  typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
);

const normalizePreviewRole = (value: any) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'student' ? 'student' : 'teacher';
};

const coercePreviewColors = (candidate: any, fallback: any) => {
  const safeFallback = fallback || DEFAULTS;
  const source = candidate && typeof candidate === 'object' ? candidate : {};
  const next = { ...safeFallback };

  COLOR_KEYS.forEach((key) => {
    const candidateValue = source[key];
    next[key] = isHexColor(candidateValue) ? candidateValue : safeFallback[key];
  });

  return next;
};

const ThemePreview = () => {
  const [searchParams] = useSearchParams();
  const [previewRole, setPreviewRole] = useState(() => normalizePreviewRole(searchParams.get('role')));
  const [activeToken, setActiveToken] = useState<any>(null);
  const [form, setForm] = useState(() => ({ ...DEFAULTS }));

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

      if (typeof payload.themeCss === 'string') {
        upsertStyleTag('__dlp_theme_preview_runtime_theme', payload.themeCss);
      }

      if (typeof payload.highlightCss === 'string') {
        upsertStyleTag('__dlp_theme_preview_runtime_highlight', payload.highlightCss);
      }

      setForm((previous: any) => coercePreviewColors(payload.colors, previous));
      setPreviewRole(normalizePreviewRole(payload.previewRole));
      setActiveToken(COLOR_KEYS.includes(payload.activeToken) ? payload.activeToken : null);

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

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 p-3 sm:p-4">
      <div className="mx-auto h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] max-w-[1440px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
        <CustomizationHomeExactPreview
          form={form}
          previewRole={previewRole}
          viewportWidth="100%"
          activeToken={activeToken}
        />
      </div>
    </div>
  );
};

export default ThemePreview;
