// src/pages/InstitutionAdminDashboard/components/classes-courses/AcademicYearPicker.tsx

import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { buildAcademicYearRange, getDefaultAcademicYear } from './academicYearUtils';
import { inputCls } from './Shared';

type AcademicYearPickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const AcademicYearPicker = ({
  value,
  onChange,
  disabled = false,
  placeholder = '2024-2025',
  className = '',
}: AcademicYearPickerProps) => {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  const yearOptions = React.useMemo(
    () => buildAcademicYearRange({ minOffset: -20, maxOffset: 10 }),
    []
  );

  const handleSelectYear = (year: string) => {
    onChange(year);
    setIsPickerOpen(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const togglePicker = () => {
    if (disabled) return;
    setIsPickerOpen((previous) => !previous);
  };

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div className="relative">
        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`${inputCls} pl-8 pr-10`}
        />
        <button
          type="button"
          onClick={togglePicker}
          disabled={disabled}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-60"
          aria-label="Abrir selector de año académico"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isPickerOpen && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleSelectYear(getDefaultAcademicYear())}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Usar año actual
            </button>
          </div>
          <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {yearOptions.map((yearOption) => {
              const isSelected = yearOption === value;

              return (
                <button
                  key={yearOption}
                  type="button"
                  onClick={() => handleSelectYear(yearOption)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/70 dark:bg-indigo-900/30 dark:text-indigo-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {yearOption}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYearPicker;
