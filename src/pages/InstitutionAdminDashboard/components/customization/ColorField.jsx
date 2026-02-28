import React, { useRef } from 'react';
import { hexToRgba } from './themePreviewUtils';

const ColorField = ({ token, label, description, icon, value, onChange, onFocus, onBlur, isActive }) => {
  const inputRef = useRef(null);

  return (
    <div
      className={`
        rounded-xl border transition-all duration-200 cursor-pointer
        ${isActive
          ? 'border-current shadow-lg scale-[1.01]'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
        bg-white dark:bg-slate-800/60
      `}
      style={isActive ? { borderColor: value, boxShadow: `0 0 0 3px ${hexToRgba(value, 0.18)}` } : {}}
      onClick={() => inputRef.current?.click()}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="relative shrink-0">
          <div
            className="w-11 h-11 rounded-xl shadow-md border-2 border-white dark:border-slate-700 transition-all duration-200"
            style={{ backgroundColor: value }}
          />
          {isActive && (
            <div
              className="absolute -inset-1 rounded-2xl animate-ping opacity-40"
              style={{ backgroundColor: value }}
            />
          )}
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={(e) => onChange(token, e.target.value)}
            onFocus={() => onFocus(token)}
            onBlur={onBlur}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
          value={value}
          onChange={(e) => onChange(token, e.target.value)}
          onFocus={() => onFocus(token)}
          onBlur={onBlur}
          onClick={(e) => e.stopPropagation()}
          className="w-20 text-[11px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 transition shrink-0"
          style={{ focusRingColor: value }}
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
};

export default ColorField;
