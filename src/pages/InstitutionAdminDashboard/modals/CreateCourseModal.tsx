// src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Course name is built from two separate fields:
//   • courseNumber  – positive integer  (e.g. 1)
//   • courseName    – free text         (e.g. "ESO")
//   → combined name = "1º ESO"
//
// Both are stored individually on the Firestore doc so the UI can reconstruct
// them for editing. The composed `name` field is also stored for cheap queries.

import React, { useState } from 'react';
import { Hash, Loader2, Save, Type, XCircle } from 'lucide-react';
import {
  ColorPicker,
  ghostBtnCls,
  InputField,
  inputCls,
  Modal,
  primaryBtnCls,
} from '../components/classes-courses/Shared';

const CreateCourseModal = ({ onClose, onSubmit, submitting, error }: any) => {
  const [courseNumber, setCourseNumber] = useState('');
  const [courseName,   setCourseName]   = useState('');
  const [description,  setDescription]  = useState('');
  const [color,        setColor]        = useState('#6366f1');

  // Derive the composed name live
  const num    = parseInt(courseNumber, 10);
  const numStr = Number.isInteger(num) && num > 0 ? `${num}º` : '';
  const preview = [numStr, courseName.trim()].filter(Boolean).join(' ');

  const isValid = preview.trim().length > 0;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      courseNumber: Number.isInteger(num) && num > 0 ? num : null,
      courseName:   courseName.trim(),
      name:         preview,   // composed, stored for display/queries
      description,
      color,
    });
  };

  return (
    <Modal title="Nuevo Curso" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Number + Name row ── */}
        <div className="flex gap-3 items-end">
          {/* Number */}
          <div className="w-28 shrink-0">
            <InputField label="Número" required>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  placeholder="1"
                  value={courseNumber}
                  onChange={e => setCourseNumber(e.target.value)}
                  className={`${inputCls} pl-8`}
                  autoFocus
                />
              </div>
            </InputField>
          </div>

          {/* Name */}
          <div className="flex-1">
            <InputField label="Nombre del curso" required>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ESO, Bachillerato, FP…"
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </InputField>
          </div>
        </div>

        {/* ── Live preview ── */}
        {preview ? (
          <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 mb-0.5">Nombre completo del curso</p>
            <p className="text-base font-bold text-slate-800 dark:text-white">{preview}</p>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 italic text-center">
              El nombre se construye automáticamente — ej: <strong>1º ESO</strong>
            </p>
          </div>
        )}

        {/* ── Description ── */}
        <InputField label="Descripción">
          <textarea
            placeholder="Descripción opcional…"
            value={description}
            rows={2}
            onChange={e => setDescription(e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </InputField>

        {/* ── Color ── */}
        <InputField label="Color de identificación">
          <ColorPicker value={color} onChange={setColor} />
        </InputField>

        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <XCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={ghostBtnCls}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting || !isValid} className={primaryBtnCls}>
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Save className="w-4 h-4" /> Crear curso</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCourseModal;