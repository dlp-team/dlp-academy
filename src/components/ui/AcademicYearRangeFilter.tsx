// src/components/ui/AcademicYearRangeFilter.tsx
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';

const ACADEMIC_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

const getAcademicYearStart = (value: any) => {
    const normalizedValue = String(value || '').trim();
    const match = normalizedValue.match(ACADEMIC_YEAR_PATTERN);
    if (!match) return null;

    const startYear = Number(match[1]);
    const endYear = Number(match[2]);
    if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) return null;
    if (endYear !== startYear + 1) return null;
    return startYear;
};

const sortAcademicYears = (years: any[] = []) => {
    return [...years]
        .map((year) => String(year || '').trim())
        .filter((year) => getAcademicYearStart(year) !== null)
        .sort((left, right) => {
            const leftStart = getAcademicYearStart(left) || 0;
            const rightStart = getAcademicYearStart(right) || 0;
            return rightStart - leftStart;
        });
};

const PAGE_SIZE = 10;
const PANEL_WIDTH = 340;
const PANEL_HEIGHT = 440;
const VIEWPORT_MARGIN = 8;

const AcademicYearRangeFilter = ({
    availableAcademicYears = [],
    value = { startYear: '', endYear: '' },
    onChange = (_: any) => {},
    onOverlayToggle = (_: any) => {}
}) => {
    const [showPanel, setShowPanel] = useState(false);
    const [activeBound, setActiveBound] = useState<'startYear' | 'endYear'>('startYear');
    const [page, setPage] = useState(0);
    const triggerRef = useRef<any>(null);
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

    const sortedYears = useMemo(() => sortAcademicYears(availableAcademicYears), [availableAcademicYears]);
    const totalPages = Math.max(1, Math.ceil(sortedYears.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);

    const pageYears = useMemo(() => {
        const startIndex = safePage * PAGE_SIZE;
        return sortedYears.slice(startIndex, startIndex + PAGE_SIZE);
    }, [sortedYears, safePage]);

    const selectedCount = Number(Boolean(value?.startYear)) + Number(Boolean(value?.endYear));
    const hasActiveFilter = selectedCount > 0;

    const handleSetShowPanel = (nextState: boolean) => {
        setShowPanel(nextState);
        onOverlayToggle(nextState);
    };

    const getPanelPos = () => {
        if (!triggerRef.current) return { top: VIEWPORT_MARGIN, left: VIEWPORT_MARGIN };

        const rect = triggerRef.current.getBoundingClientRect();
        const defaultLeft = rect.left;
        const oppositeLeft = rect.right - PANEL_WIDTH;

        let left = defaultLeft;
        if (left + PANEL_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
            left = oppositeLeft;
        }

        left = Math.min(
            Math.max(left, VIEWPORT_MARGIN),
            Math.max(VIEWPORT_MARGIN, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN)
        );

        const defaultTop = rect.bottom + 8;
        const oppositeTop = rect.top - PANEL_HEIGHT - 8;

        let top = defaultTop;
        if (top + PANEL_HEIGHT > window.innerHeight - VIEWPORT_MARGIN) {
            top = oppositeTop;
        }

        top = Math.min(
            Math.max(top, VIEWPORT_MARGIN),
            Math.max(VIEWPORT_MARGIN, window.innerHeight - PANEL_HEIGHT - VIEWPORT_MARGIN)
        );

        return { top, left };
    };

    const handleSelectYear = (academicYear: string) => {
        const nextFilter = {
            startYear: String(value?.startYear || '').trim(),
            endYear: String(value?.endYear || '').trim(),
            [activeBound]: academicYear
        };

        onChange(nextFilter);

        if (activeBound === 'startYear') {
            setActiveBound('endYear');
        }
    };

    const clearRange = () => {
        onChange({ startYear: '', endYear: '' });
        setActiveBound('startYear');
    };

    useLayoutEffect(() => {
        if (!showPanel) return;

        const frame = window.requestAnimationFrame(() => {
            setPanelPos(getPanelPos());
        });

        return () => window.cancelAnimationFrame(frame);
    }, [showPanel]);

    React.useEffect(() => {
        if (safePage !== page) {
            setPage(safePage);
        }
    }, [safePage, page]);

    return (
        <div className="relative" ref={triggerRef}>
            <button
                onClick={() => handleSetShowPanel(!showPanel)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium shadow-sm ${
                    hasActiveFilter
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
                <CalendarRange size={16} />
                <span className="hidden sm:inline">Año académico</span>
                {selectedCount > 0 && (
                    <span className="bg-indigo-500 dark:bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {selectedCount}
                    </span>
                )}
            </button>

            {showPanel && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => handleSetShowPanel(false)}
                    />

                    <div
                        className="fixed bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-[60] w-[340px] max-h-[440px] overflow-y-auto clean-scrollbar"
                        style={{ top: panelPos.top, left: panelPos.left }}
                    >
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Rango de año académico</span>
                            {hasActiveFilter && (
                                <button
                                    onClick={clearRange}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Selecciona año inicial y final. Solo aparecen años existentes.
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                onClick={() => setActiveBound('startYear')}
                                className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${
                                    activeBound === 'startYear'
                                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                        : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className="block font-semibold">Inicio</span>
                                <span className="block mt-0.5 text-[11px] opacity-80">{value?.startYear || 'Sin seleccionar'}</span>
                            </button>

                            <button
                                onClick={() => setActiveBound('endYear')}
                                className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${
                                    activeBound === 'endYear'
                                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                        : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className="block font-semibold">Fin</span>
                                <span className="block mt-0.5 text-[11px] opacity-80">{value?.endYear || 'Sin seleccionar'}</span>
                            </button>
                        </div>

                        {sortedYears.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                No hay años académicos disponibles en las asignaturas visibles.
                            </p>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    {pageYears.map((academicYear) => {
                                        const isSelectedStart = value?.startYear === academicYear;
                                        const isSelectedEnd = value?.endYear === academicYear;
                                        const isSelected = isSelectedStart || isSelectedEnd;

                                        return (
                                            <button
                                                key={academicYear}
                                                onClick={() => handleSelectYear(academicYear)}
                                                className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                                                    isSelected
                                                        ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                                        : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <span className="font-medium">{academicYear}</span>
                                                {isSelectedStart && (
                                                    <span className="block text-[11px] opacity-80">Inicio</span>
                                                )}
                                                {isSelectedEnd && (
                                                    <span className="block text-[11px] opacity-80">Fin</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                                        <button
                                            onClick={() => setPage((previous) => Math.max(0, previous - 1))}
                                            disabled={safePage === 0}
                                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={14} />
                                            Anterior
                                        </button>

                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Página {safePage + 1} de {totalPages}
                                        </span>

                                        <button
                                            onClick={() => setPage((previous) => Math.min(totalPages - 1, previous + 1))}
                                            disabled={safePage >= totalPages - 1}
                                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Siguiente
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AcademicYearRangeFilter;
