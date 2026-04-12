// src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader.tsx
import React from 'react';
import { GraduationCap, LayoutDashboard, Moon, ShieldCheck, Sun } from 'lucide-react';

const CustomizationPreviewHeader = ({
  institutionName,
  previewRole,
  primaryColor,
}: any) => {
  const normalizedInstitutionName = String(institutionName || '').trim() || 'Tu Institución';
  const isAdminRole = previewRole === 'admin';
  const isStudentRole = previewRole === 'student';
  const roleSubtitle = isAdminRole
    ? 'Panel de administración'
    : isStudentRole
      ? 'Panel estudiante'
      : 'Panel docente';
  const sectionLabel = isAdminRole ? 'Administración' : 'Inicio';
  const AvatarIcon = isAdminRole ? ShieldCheck : GraduationCap;
  const avatarInitial = isAdminRole ? 'A' : isStudentRole ? 'E' : 'D';

  return (
    <header className="h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}22` }}>
            <AvatarIcon className="w-6 h-6" style={{ color: primaryColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900 dark:text-white truncate">{normalizedInstitutionName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{roleSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
            <LayoutDashboard className="w-3.5 h-3.5" />
            {sectionLabel}
          </div>
          <button
            type="button"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300"
            aria-label="Cambiar tema"
          >
            {isStudentRole ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <div
            className="w-8 h-8 rounded-full text-white text-xs font-bold inline-flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
            aria-label="Avatar de vista previa"
          >
            {avatarInitial}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomizationPreviewHeader;
