// src/pages/InstitutionAdminDashboard/components/settings/CoursePromotionOrderEditor.tsx
import React, { useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, MoveVertical } from 'lucide-react';

const moveArrayEntry = (entries: any[] = [], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) return entries;
  if (fromIndex < 0 || toIndex < 0) return entries;
  if (fromIndex >= entries.length || toIndex >= entries.length) return entries;

  const next = [...entries];
  const [movedEntry] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, movedEntry);
  return next;
};

const CoursePromotionOrderEditor = ({
  coursePromotionOrder = [],
  onChange,
}: any) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const normalizedOrder = Array.isArray(coursePromotionOrder) ? coursePromotionOrder : [];

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (typeof onChange !== 'function') return;
    onChange(moveArrayEntry(normalizedOrder, fromIndex, toIndex));
  };

  if (normalizedOrder.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
        No hay cursos activos con nombre para ordenar todavía.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {normalizedOrder.map((label: string, index: number) => {
        const isDropTarget = dropTargetIndex === index;
        const isDragging = draggingIndex === index;

        return (
          <div
            key={`course-order-${label}-${index}`}
            draggable
            onDragStart={(event) => {
              setDraggingIndex(index);
              setDropTargetIndex(index);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', String(index));
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (dropTargetIndex !== index) {
                setDropTargetIndex(index);
              }
            }}
            onDragLeave={() => {
              if (dropTargetIndex === index) {
                setDropTargetIndex(null);
              }
            }}
            onDragEnd={() => {
              setDraggingIndex(null);
              setDropTargetIndex(null);
            }}
            onDrop={(event) => {
              event.preventDefault();
              const sourceIndexRaw = event.dataTransfer.getData('text/plain');
              const sourceIndex = Number(sourceIndexRaw);
              const fromIndex = Number.isFinite(sourceIndex) ? sourceIndex : draggingIndex;

              if (fromIndex === null || fromIndex === undefined) return;
              handleMove(fromIndex, index);
              setDraggingIndex(null);
              setDropTargetIndex(null);
            }}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${
              isDropTarget
                ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40'
            } ${isDragging ? 'opacity-70' : ''}`}
          >
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <GripVertical className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Prioridad {index + 1}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(index, index - 1)}
                disabled={index === 0}
                className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label={`Mover ${label} hacia arriba`}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, index + 1)}
                disabled={index === normalizedOrder.length - 1}
                className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label={`Mover ${label} hacia abajo`}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <MoveVertical className="h-3.5 w-3.5" />
        Arrastra o usa flechas para definir el orden de promoción automática (de mayor a menor nivel).
      </p>
    </div>
  );
};

export default CoursePromotionOrderEditor;
