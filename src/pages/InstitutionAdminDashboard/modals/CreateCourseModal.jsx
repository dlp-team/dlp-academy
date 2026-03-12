// src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal for creating a brand-new course.

import React, { useState } from 'react';
import { Loader2, Save, XCircle } from 'lucide-react';
import {
  ColorPicker,
  ghostBtnCls,
  InputField,
  inputCls,
  Modal,
  primaryBtnCls,
} from '../components/classes-courses/Shared.jsx';

const CreateCourseModal = ({ onClose, onSubmit, submitting, error }) => {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <Modal title="Nuevo Curso" onClose={onClose}>
      <form
        onSubmit={e => { e.preventDefault(); onSubmit(form); }}
        className="space-y-4"
      >
        <InputField label="Nombre del curso" required>
          <input
            type="text"
            placeholder="Ej: 1º ESO"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className={inputCls}
            autoFocus
          />
        </InputField>

        <InputField label="Descripción">
          <textarea
            placeholder="Descripción opcional…"
            value={form.description}
            rows={2}
            onChange={e => set('description', e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </InputField>

        <InputField label="Color de identificación">
          <ColorPicker value={form.color} onChange={c => set('color', c)} />
        </InputField>

        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <XCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={ghostBtnCls}>Cancelar</button>
          <button type="submit" disabled={submitting} className={primaryBtnCls}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Crear curso</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCourseModal;