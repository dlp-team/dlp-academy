// src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx
import React, { useEffect, useRef, useState } from 'react';
import { hexToRgba } from './themePreviewUtils';

const normalizeHexColorInput = (value: any) => (typeof value === 'string' ? value.trim() : '');

const isValidHexColor = (value: any) => /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalizeHexColorInput(value));

const ColorField = ({ token, label, description, icon, value, onChange, onFocus, onBlur, isActive }: any) => {
  const inputRef = useRef<any>(null);
  const [hexInputValue, setHexInputValue] = useState(() => normalizeHexColorInput(value));

  useEffect(() => {
    setHexInputValue(normalizeHexColorInput(value));
  }, [value]);

  const commitHexInputValue = () => {
    const normalized = normalizeHexColorInput(hexInputValue);

    if (isValidHexColor(normalized)) {
      onChange(token, normalized);
      return;
    }

    setHexInputValue(normalizeHexColorInput(value));
  };

  const handleContainerClick = (event: any) => {
    const target = event?.target;

    if (
      target?.closest?.('[data-color-field-swatch="true"]')
      || target?.closest?.('[data-color-field-hex-input="true"]')
    ) {
      return;
    }

    onFocus(token);
  };

  return (
    <div
      data-testid={`color-field-${token}`}
      className={`
        rounded-xl border transition-all duration-200 cursor-pointer
        ${isActive
          ? 'border-current shadow-lg scale-[1.01]'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
        bg-white dark:bg-slate-800/60
      `}
      style={isActive ? { borderColor: value, boxShadow: `0 0 0 3px ${hexToRgba(value, 0.18)}` } : {}}
      onClick={handleContainerClick}
      onBlurCapture={onBlur}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="relative shrink-0">
          <button
            type="button"
            data-testid={`color-field-swatch-${token}`}
            data-color-field-swatch="true"
            aria-label={`Abrir selector de color para ${label}`}
            onClick={(event) => {
              event.stopPropagation();
              if (typeof inputRef.current?.showPicker === 'function') {
                inputRef.current.showPicker();
                return;
              }

              inputRef.current?.click();
            }}
            onMouseDown={(event) => event.stopPropagation()}
            className="w-11 h-11 rounded-xl shadow-md border-2 border-white dark:border-slate-700 transition-all duration-200"
            style={{ backgroundColor: value }}
          />
          {isActive && (
            <div
              className="absolute -inset-1 rounded-2xl animate-ping opacity-40 pointer-events-none"
              style={{ backgroundColor: value }}
            />
          )}
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={(event) => {
              const nextColor = normalizeHexColorInput(event.target.value);
              setHexInputValue(nextColor);
              onChange(token, nextColor);
            }}
            onClick={(event) => event.stopPropagation()}
            data-color-field-swatch="true"
            className="sr-only"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs">{icon}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{label}</span>
            {isActive && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
                style={{ backgroundColor: value }}
              >
                activo
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight truncate">{description}</p>
        </div>

        <input
          type="text"
          value={hexInputValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setHexInputValue(nextValue);

            if (isValidHexColor(nextValue)) {
              onChange(token, normalizeHexColorInput(nextValue));
            }
          }}
          onFocus={() => onFocus(token)}
          onBlur={commitHexInputValue}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitHexInputValue();
              event.currentTarget.blur();
              return;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              setHexInputValue(normalizeHexColorInput(value));
              event.currentTarget.blur();
            }
          }}
          data-color-field-hex-input="true"
          className="w-20 text-[11px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 transition shrink-0"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
};

export default ColorField;
