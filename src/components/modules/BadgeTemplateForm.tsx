// src/components/modules/BadgeTemplateForm.tsx
import React, { useState } from 'react';
import { Star, Zap, Target, Flame, BookOpen, Trophy, Users, Award, Heart, Lightbulb } from 'lucide-react';

const ICON_OPTIONS = [
  { key: 'star', icon: Star, label: 'Estrella' },
  { key: 'zap', icon: Zap, label: 'Rayo' },
  { key: 'target', icon: Target, label: 'Objetivo' },
  { key: 'flame', icon: Flame, label: 'Llama' },
  { key: 'book', icon: BookOpen, label: 'Libro' },
  { key: 'trophy', icon: Trophy, label: 'Trofeo' },
  { key: 'users', icon: Users, label: 'Equipo' },
  { key: 'award', icon: Award, label: 'Medalla' },
  { key: 'heart', icon: Heart, label: 'Corazón' },
  { key: 'lightbulb', icon: Lightbulb, label: 'Idea' },
];

const CATEGORY_OPTIONS = [
  'Académica',
  'Comportamiento',
  'Participación',
  'Esfuerzo',
  'Creatividad',
  'Otra',
];

interface BadgeTemplateFormProps {
  onSubmit: (template: {
    name: string;
    description: string;
    iconKey: string;
    category: string;
  }) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: {
    name?: string;
    description?: string;
    iconKey?: string;
    category?: string;
  };
}

const BadgeTemplateForm: React.FC<BadgeTemplateFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [iconKey, setIconKey] = useState(initialData?.iconKey || 'star');
  const [category, setCategory] = useState(initialData?.category || 'Académica');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (trimmedName.length > 50) {
      setError('El nombre no puede superar 50 caracteres.');
      return;
    }

    try {
      await onSubmit({ name: trimmedName, description: description.trim(), iconKey, category });
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la insignia.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de la insignia
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Mejor trabajo en equipo"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          maxLength={50}
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción corta de la insignia..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={2}
          maxLength={200}
          disabled={loading}
        />
      </div>

      {/* Icon selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Icono
        </label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = iconKey === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setIconKey(opt.key)}
                disabled={loading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  selected
                    ? 'bg-indigo-500 text-white shadow-md scale-110'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={opt.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Categoría
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={loading}
        >
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar insignia'}
        </button>
      </div>
    </form>
  );
};

export { ICON_OPTIONS };
export default BadgeTemplateForm;
