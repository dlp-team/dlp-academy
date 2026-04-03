// src/components/ui/TablePagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const TablePagination = ({ currentPage, totalPages, onPageChange, className = '' }: TablePaginationProps) => {
  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 ${className}`}>
      <button
        type="button"
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Anterior
      </button>

      <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
        Página {currentPage} de {totalPages}
      </span>

      <button
        type="button"
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
      >
        Siguiente <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default TablePagination;
