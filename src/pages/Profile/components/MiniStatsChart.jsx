// src/pages/Profile/components/MiniStatsChart.jsx
import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, X, Calendar } from 'lucide-react';

const PERIODS = [
    { key: 'all',    label: 'Todo' },
    { key: '30d',    label: '30 días' },
    { key: '90d',    label: '90 días' },
    { key: '7d',     label: '7 días' },
];

const getBarColor = (score) => {
    if (score >= 85) return { bar: '#22c55e', glow: 'rgba(34,197,94,0.4)' };
    if (score >= 70) return { bar: '#4ade80', glow: 'rgba(74,222,128,0.3)' };
    if (score >= 55) return { bar: '#f59e0b', glow: 'rgba(245,158,11,0.3)' };
    if (score >= 40) return { bar: '#f97316', glow: 'rgba(249,115,22,0.3)' };
    return { bar: '#ef4444', glow: 'rgba(239,68,68,0.3)' };
};

const filterByPeriod = (data, period) => {
    if (period === 'all') return data;
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return data.filter(d => d.date >= cutoff);
};

// ─── Detailed Overlay Chart ───────────────────────────────────────────────────
const ChartOverlay = ({ data, role, onClose }) => {
    const [period, setPeriod] = useState('all');
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const filtered = useMemo(() => filterByPeriod(data, period).sort((a, b) => a.date - b.date), [data, period]);
    const scores = filtered.map(d => d.score);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const best = scores.length > 0 ? Math.max(...scores) : 0;
    const worst = scores.length > 0 ? Math.min(...scores) : 0;
    const passed = filtered.filter(d => d.score >= 50).length;

    // Sparkline SVG
    const W = 600; const H = 120;
    const points = scores.map((s, i) => ({
        x: scores.length > 1 ? (i / (scores.length - 1)) * W : W / 2,
        y: H - (s / 100) * H
    }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${H} L ${points[0].x.toFixed(1)} ${H} Z`
        : '';

    const lineColor = avg >= 70 ? '#22c55e' : avg >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-md">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">Evolución de notas</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {role === 'teacher' ? 'Media de todos los alumnos' : `${filtered.length} tests en el período seleccionado`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Period selector */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="flex gap-1.5">
                            {PERIODS.map(p => (
                                <button
                                    key={p.key}
                                    onClick={() => setPeriod(p.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        period === p.key
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* KPI row */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Media', value: `${avg}%`, color: avg >= 70 ? 'text-emerald-600 dark:text-emerald-400' : avg >= 50 ? 'text-amber-500' : 'text-red-500' },
                            { label: 'Mejor nota', value: `${best}%`, color: 'text-emerald-600 dark:text-emerald-400' },
                            { label: 'Peor nota', value: `${worst}%`, color: 'text-red-500' },
                            { label: 'Aprobados', value: `${filtered.length > 0 ? Math.round((passed / filtered.length) * 100) : 0}%`, color: 'text-indigo-600 dark:text-indigo-400' },
                        ].map(k => (
                            <div key={k.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                                <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{k.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* SVG line chart */}
                    {filtered.length > 1 ? (
                        <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 overflow-hidden">
                            {/* Grid lines */}
                            <div className="absolute inset-x-4 inset-y-4 flex flex-col justify-between pointer-events-none">
                                {[100, 75, 50, 25, 0].map(v => (
                                    <div key={v} className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-300 dark:text-gray-600 w-5 text-right shrink-0">{v}</span>
                                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700 border-dashed" />
                                    </div>
                                ))}
                            </div>

                            <div className="ml-7 relative" style={{ height: 140 }}>
                                <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="overlayAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                                            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
                                        </linearGradient>
                                    </defs>
                                    {areaD && <path d={areaD} fill="url(#overlayAreaGrad)" />}
                                    <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    {points.map((p, i) => (
                                        <circle
                                            key={i}
                                            cx={p.x} cy={p.y} r={hoveredIdx === i ? 5 : 3}
                                            fill={lineColor}
                                            stroke="white" strokeWidth="1.5"
                                            className="cursor-pointer transition-all"
                                            onMouseEnter={() => setHoveredIdx(i)}
                                            onMouseLeave={() => setHoveredIdx(null)}
                                        />
                                    ))}
                                </svg>

                                {/* Tooltip */}
                                {hoveredIdx !== null && filtered[hoveredIdx] && (
                                    <div
                                        className="absolute z-10 pointer-events-none px-3 py-2 bg-gray-900/90 dark:bg-gray-100/90 rounded-xl shadow-xl text-xs"
                                        style={{
                                            left: `${(points[hoveredIdx].x / W) * 100}%`,
                                            top: `${(points[hoveredIdx].y / H) * 100}%`,
                                            transform: 'translate(-50%, -130%)',
                                        }}
                                    >
                                        <div className="font-bold text-white dark:text-gray-900" style={{ color: lineColor }}>{filtered[hoveredIdx].score}%</div>
                                        <div className="text-gray-300 dark:text-gray-600 max-w-[120px] truncate">{filtered[hoveredIdx].quizTitle}</div>
                                        <div className="text-gray-400 dark:text-gray-500">{filtered[hoveredIdx].date.toLocaleDateString()}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center text-sm text-gray-400">
                            {filtered.length === 0 ? 'Sin datos en este período' : 'Necesitas al menos 2 tests para ver la evolución'}
                        </div>
                    )}

                    {/* Bar chart for individual results */}
                    {filtered.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Resultados individuales</p>
                            <div className="flex items-end gap-0.5 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                                {filtered.map((d, i) => {
                                    const { bar } = getBarColor(d.score);
                                    return (
                                        <div
                                            key={i}
                                            className="flex-1 rounded-t-sm cursor-pointer transition-all duration-150 hover:opacity-100"
                                            style={{ height: `${d.score}%`, backgroundColor: bar, opacity: 0.8 }}
                                            title={`${d.score}% · ${d.quizTitle}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Mini Card (sidebar) ──────────────────────────────────────────────────────
const MiniStatsChart = ({ data = [], title = 'Evolución de notas', subtitle, role = 'student' }) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const scores = data.map(d => d.score);
    const overallAvg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const recentScores = scores.slice(-5);
    const avgRecent = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
    const prevScores = scores.slice(-10, -5);
    const avgPrev = prevScores.length > 0 ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length : avgRecent;
    const trend = avgRecent - avgPrev;

    const lineColor = overallAvg >= 70 ? '#22c55e' : overallAvg >= 50 ? '#f59e0b' : '#ef4444';
    const trendColor = trend > 2 ? 'text-emerald-500' : trend < -2 ? 'text-red-500' : 'text-gray-400';
    const TrendIcon = trend > 2 ? TrendingUp : trend < -2 ? TrendingDown : Minus;

    // Sparkline
    const W = 200; const H = 40;
    const points = scores.map((s, i) => ({
        x: scores.length > 1 ? (i / (scores.length - 1)) * W : W / 2,
        y: H - (s / 100) * H
    }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${H} L ${points[0].x.toFixed(1)} ${H} Z`
        : '';

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Sin datos disponibles</p>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowOverlay(true)}
                className="w-full text-left bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span>{trend > 0 ? '+' : ''}{Math.round(trend)}%</span>
                    </div>
                </div>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{subtitle}</p>}

                {/* Sparkline */}
                <div className="my-3">
                    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-10">
                        <defs>
                            <linearGradient id="miniAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        {areaD && <path d={areaD} fill="url(#miniAreaGrad)" />}
                        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Bar mini-chart */}
                <div className="flex items-end gap-0.5 h-8">
                    {scores.slice(-20).map((score, i) => {
                        const { bar } = getBarColor(score);
                        return (
                            <div
                                key={i}
                                className="flex-1 rounded-t-sm transition-all duration-150"
                                style={{ height: `${score}%`, backgroundColor: bar, opacity: 0.75 }}
                            />
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors">
                        Ver detalles →
                    </span>
                    <span className={`text-sm font-bold ${overallAvg >= 70 ? 'text-emerald-600 dark:text-emerald-400' : overallAvg >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {overallAvg}% media
                    </span>
                </div>
            </button>

            {showOverlay && (
                <ChartOverlay data={data} role={role} onClose={() => setShowOverlay(false)} />
            )}
        </>
    );
};

export default MiniStatsChart;