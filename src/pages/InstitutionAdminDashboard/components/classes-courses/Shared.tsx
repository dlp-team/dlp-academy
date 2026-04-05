// src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.jsx
/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// Reusable primitives, constants and tiny components used across the
// classes/courses feature. Nothing here touches Firestore.

import React from 'react';
import { ArrowLeft, Edit3, Search, Trash2, X, XCircle } from 'lucide-react';
import DashboardOverlayShell from '../../../../components/ui/DashboardOverlayShell';

// ─── Color palette ────────────────────────────────────────────────────────────
export const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#84cc16', '#06b6d4', '#a855f7',
];

// ─── Tailwind class bundles ───────────────────────────────────────────────────
export const inputCls =
  'w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 ' +
  'dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 ' +
  'outline-none transition-all text-sm text-slate-800 dark:text-slate-200';

export const primaryBtnCls =
  'flex-1 px-4 py-2.5 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] ' +
  'text-white rounded-xl font-medium shadow-lg shadow-[var(--color-primary-200)] ' +
  'dark:shadow-[var(--color-primary-900)/0.2] transition-all flex justify-center items-center gap-2 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

export const ghostBtnCls =
  'flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 ' +
  'dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all';

export const dangerBtnCls =
  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 ' +
  'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all';

export const editBtnCls =
  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 ' +
  'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-all';

// ─── ColorPicker ──────────────────────────────────────────────────────────────
export const ColorPicker = ({ value, onChange }: any) => (
  <div className="flex gap-2 flex-wrap">
    {COLORS.map(c => (
      <button
        key={c}
        type="button"
        onClick={() => onChange(c)}
        className={`w-7 h-7 rounded-full transition-all ${
          value === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
        }`}
        style={{ backgroundColor: c }}
      />
    ))}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, wide = false }) => (
  <DashboardOverlayShell
    onClose={onClose}
    maxWidth={wide ? 'lg' : 'md'}
    backdropClassName="absolute inset-0 bg-black/50 backdrop-blur-sm"
    contentClassName="p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
  >
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <XCircle className="w-6 h-6" />
        </button>
      </div>
      {children}
    </div>
  </DashboardOverlayShell>
);

// ─── InputField wrapper ───────────────────────────────────────────────────────
export const InputField = ({ label, required, hint, children }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="ml-1.5 text-xs font-normal text-slate-400">{hint}</span>}
    </label>
    {children}
  </div>
);

// ─── SearchInput ──────────────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = 'Buscar…' }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-8 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-400/40 outline-none transition-all"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

// ─── AvatarChip ───────────────────────────────────────────────────────────────
export const AvatarChip = ({ label, color = '#6366f1' }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
    style={{ backgroundColor: color }}
  >
    {label}
  </span>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = '#6366f1' }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}22` }}
    >
      {React.createElement(icon, { className: 'w-5 h-5', style: { color } })}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

// ─── SectionCard ─────────────────────────────────────────────────────────────
export const SectionCard = ({ title, icon, color, children, action }: any) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2">
        {React.createElement(icon, { className: 'w-4 h-4 shrink-0', style: { color } })}
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{title}</h3>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── DetailHeader ─────────────────────────────────────────────────────────────
export const DetailHeader = ({ onBack, color, title, badge, onEdit, onDelete }: any) => (
  <div className="flex items-center gap-3 mb-6 flex-wrap">
    <button
      onClick={onBack}
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500
        hover:text-indigo-600 hover:border-indigo-300 transition-all shrink-0"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{title}</h2>
        {badge && <span className="text-xs text-slate-400">{badge}</span>}
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <button onClick={onEdit} className={editBtnCls}>
        <Edit3 className="w-3.5 h-3.5" /> Editar
      </button>
      <button onClick={onDelete} className={dangerBtnCls}>
        <Trash2 className="w-3.5 h-3.5" /> Eliminar
      </button>
    </div>
  </div>
);

// ─── InlineEditField ──────────────────────────────────────────────────────────
// Renders a read-only label that turns into an input when the pencil is clicked.
// Used for per-field editing inside detail views.
export const InlineEditField = ({
  label,
  displayValue,
  editingKey,
  fieldKey,
  onStartEdit,
  onCancelEdit,
  onSave,
  saving,
  children, // the actual input/select rendered when editing
}) => {
  const isEditing = editingKey === fieldKey;
  return (
    <div className="group py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
          {isEditing ? (
            <div className="space-y-2 mt-1">
              {children}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSave(fieldKey)}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all disabled:opacity-60"
                  style={{ backgroundColor: '#6366f1' }}
                >
                  {saving ? '…' : '✓ Guardar'}
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {displayValue || <span className="italic text-slate-400">Sin especificar</span>}
            </p>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => onStartEdit(fieldKey)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400
              hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all shrink-0 mt-0.5"
            title={`Editar ${label}`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};