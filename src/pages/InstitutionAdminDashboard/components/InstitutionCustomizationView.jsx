import React, { useState, useCallback, useEffect } from 'react';
import {
  Folder,
  BookOpen,
  Search,
  Bell,
  ChevronRight,
  Home,
  Settings,
  Users,
  BarChart2,
  Plus,
  Filter,
  SlidersHorizontal,
  Star,
  Clock,
  GraduationCap,
  Palette,
  Eye,
  Save,
  Upload,
  X,
  Check,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hexToRgba = (hex, alpha) => {
  if (!hex) return null;
  const normalized = hex.trim();
  const full =
    normalized.length === 4
      ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
      : normalized;
  const int = parseInt(full.slice(1), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const buildCssVars = (colors) => ({
  '--home-primary': colors.primary,
  '--home-secondary': colors.secondary,
  '--home-accent': colors.accent,
  '--home-muted-text': colors.mutedText,
  '--home-card-border': colors.cardBorder,
  '--home-card-background': colors.cardBackground,
  '--home-primary-soft': hexToRgba(colors.primary, 0.12) || 'rgba(99,102,241,0.12)',
  '--home-primary-soft-dark': hexToRgba(colors.primary, 0.24) || 'rgba(99,102,241,0.24)',
  '--home-secondary-soft': hexToRgba(colors.secondary, 0.12) || 'rgba(245,158,11,0.12)',
  '--home-secondary-soft-dark': hexToRgba(colors.secondary, 0.24) || 'rgba(245,158,11,0.24)',
});

// ---------------------------------------------------------------------------
// Default form state
// ---------------------------------------------------------------------------

const DEFAULT_FORM = {
  institutionName: 'Westfield Academy',
  logoUrl: '',
  primary: '#6366f1',
  secondary: '#f59e0b',
  accent: '#14b8a6',
  mutedText: '#6b7280',
  cardBorder: '#d1d5db',
  cardBackground: '#ffffff',
};

// ---------------------------------------------------------------------------
// Sidebar: Color Field
// ---------------------------------------------------------------------------

const ColorField = ({ label, id, value, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300 w-32 shrink-0">
      {label}
    </label>
    <div className="flex items-center gap-2 flex-1">
      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 shrink-0 shadow-sm">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer border-0 p-0 opacity-0"
        />
        <div className="w-full h-full rounded-lg" style={{ backgroundColor: value }} />
        <div
          className="absolute inset-0 rounded-lg cursor-pointer"
          onClick={() => document.getElementById(id)?.click()}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className="flex-1 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
        placeholder="#000000"
        maxLength={7}
      />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Mock Header
// ---------------------------------------------------------------------------

const MockHeader = ({ form, cssVars }) => (
  <header
    className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 shrink-0"
    style={cssVars}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      {form.logoUrl ? (
        <img src={form.logoUrl} alt="logo" className="h-7 w-7 rounded object-contain" />
      ) : (
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: 'var(--home-primary)' }}
        >
          {form.institutionName?.[0]?.toUpperCase() || 'W'}
        </div>
      )}
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
        {form.institutionName || 'Institution'}
      </span>
    </div>
    <div className="flex-1" />
    <div className="flex items-center gap-2">
      <button className="relative p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500">
        <Bell size={16} />
        <span
          className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--home-secondary)' }}
        />
      </button>
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
        JD
      </div>
    </div>
  </header>
);

// ---------------------------------------------------------------------------
// Mock Breadcrumb
// ---------------------------------------------------------------------------

const MockBreadcrumb = () => (
  <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
    <Home size={13} className="shrink-0" />
    <ChevronRight size={12} />
    <span className="text-slate-800 dark:text-slate-200 font-medium">Home</span>
  </nav>
);

// ---------------------------------------------------------------------------
// Mock Controls (search + filters)
// ---------------------------------------------------------------------------

const MockControls = ({ cssVars }) => (
  <div className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800" style={cssVars}>
    <div className="relative flex-1 max-w-xs">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <div className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 select-none">
        Search subjects, folders…
      </div>
    </div>
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition"
      style={{
        borderColor: 'var(--home-card-border)',
        backgroundColor: 'var(--home-card-background)',
        color: cssVars['--home-muted-text'],
      }}
    >
      <Filter size={12} />
      Filter
    </button>
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition"
      style={{
        borderColor: 'var(--home-card-border)',
        backgroundColor: 'var(--home-card-background)',
        color: cssVars['--home-muted-text'],
      }}
    >
      <SlidersHorizontal size={12} />
      Sort
    </button>
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition"
      style={{ backgroundColor: 'var(--home-primary)' }}
    >
      <Plus size={12} />
      New
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Mock Folder Card
// ---------------------------------------------------------------------------

const MockFolderCard = ({ name, count, cssVars }) => (
  <div
    className="home-token-dashed-primary-card border-2 border-dashed rounded-2xl p-4 flex flex-col gap-2 cursor-pointer group transition-all"
    style={{
      borderColor: 'var(--home-card-border)',
      backgroundColor: 'var(--home-card-background)',
      '--home-primary': cssVars['--home-primary'],
      '--home-primary-soft': cssVars['--home-primary-soft'],
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = cssVars['--home-primary'];
      e.currentTarget.style.backgroundColor = cssVars['--home-primary-soft'];
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = cssVars['--home-card-border'];
      e.currentTarget.style.backgroundColor = cssVars['--home-card-background'];
    }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
      style={{ backgroundColor: cssVars['--home-primary-soft'] }}
    >
      <Folder size={18} style={{ color: cssVars['--home-primary'] }} />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
      <p className="text-xs mt-0.5" style={{ color: cssVars['--home-muted-text'] }}>
        {count} items
      </p>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Mock Subject Card
// ---------------------------------------------------------------------------

const MockSubjectCard = ({ name, progress, cssVars }) => (
  <div
    className="rounded-2xl p-4 flex flex-col gap-3 border transition-all cursor-pointer"
    style={{
      borderColor: cssVars['--home-card-border'],
      backgroundColor: cssVars['--home-card-background'],
    }}
  >
    <div className="flex items-start justify-between">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: cssVars['--home-secondary-soft'] }}
      >
        <BookOpen size={18} style={{ color: cssVars['--home-secondary'] }} />
      </div>
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: cssVars['--home-accent'] + '22',
          color: cssVars['--home-accent'],
        }}
      >
        Active
      </span>
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: cssVars['--home-accent'] }}
          />
        </div>
        <span className="text-xs" style={{ color: cssVars['--home-muted-text'] }}>
          {progress}%
        </span>
      </div>
    </div>
    <div className="flex items-center gap-3 text-xs" style={{ color: cssVars['--home-muted-text'] }}>
      <span className="flex items-center gap-1"><Clock size={11} /> 2h left</span>
      <span className="flex items-center gap-1"><Star size={11} /> 4.8</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Mock Create Dashed Card
// ---------------------------------------------------------------------------

const MockCreateCard = ({ label, cssVars, secondary }) => (
  <div
    className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[100px] transition-all"
    style={{
      borderColor: cssVars['--home-card-border'],
      backgroundColor: 'transparent',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = secondary
        ? cssVars['--home-secondary']
        : cssVars['--home-primary'];
      e.currentTarget.style.backgroundColor = secondary
        ? cssVars['--home-secondary-soft']
        : cssVars['--home-primary-soft'];
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = cssVars['--home-card-border'];
      e.currentTarget.style.backgroundColor = 'transparent';
    }}
  >
    <Plus
      size={20}
      style={{ color: secondary ? cssVars['--home-secondary'] : cssVars['--home-primary'] }}
    />
    <span
      className="text-xs font-medium"
      style={{ color: secondary ? cssVars['--home-secondary'] : cssVars['--home-primary'] }}
    >
      {label}
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Mock Home Content
// ---------------------------------------------------------------------------

const MockHomeContent = ({ cssVars }) => (
  <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-5 py-5" style={cssVars}>
    {/* Section: Folders */}
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
          Folders
        </h2>
        <button
          className="text-xs font-medium transition"
          style={{ color: cssVars['--home-primary'] }}
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MockFolderCard name="Mathematics" count={12} cssVars={cssVars} />
        <MockFolderCard name="Sciences" count={8} cssVars={cssVars} />
        <MockFolderCard name="Literature" count={5} cssVars={cssVars} />
        <MockCreateCard label="New Folder" cssVars={cssVars} />
      </div>
    </section>

    {/* Section: Subjects */}
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
          Subjects
        </h2>
        <button
          className="text-xs font-medium transition"
          style={{ color: cssVars['--home-primary'] }}
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <MockSubjectCard name="Advanced Calculus" progress={68} cssVars={cssVars} />
        <MockCreateCard label="New Subject" cssVars={cssVars} secondary />
      </div>
    </section>

    {/* Recent activity strip */}
    <section>
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase mb-3">
        Recent
      </h2>
      <div className="space-y-2">
        {[
          { icon: BookOpen, label: 'Physics – Chapter 3', time: '2h ago', color: cssVars['--home-accent'] },
          { icon: Folder, label: 'Assignments folder', time: 'Yesterday', color: cssVars['--home-primary'] },
          { icon: GraduationCap, label: 'Biology Quiz', time: '3d ago', color: cssVars['--home-secondary'] },
        ].map(({ icon: Icon, label, time, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer"
            style={{ borderColor: cssVars['--home-card-border'], backgroundColor: cssVars['--home-card-background'] }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '22' }}>
              <Icon size={14} style={{ color }} />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">{label}</span>
            <span className="text-xs" style={{ color: cssVars['--home-muted-text'] }}>{time}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
);

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

const Sidebar = ({ form, onChange, onSave, onReset, saved }) => (
  <aside className="w-80 shrink-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
    {/* Header */}
    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-0.5">
        <Palette size={16} className="text-indigo-500" />
        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100">Customize Home</h1>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Changes preview in real-time</p>
    </div>

    {/* Scrollable controls */}
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
      {/* Identity */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Identity
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              value={form.institutionName}
              onChange={(e) => onChange('institutionName', e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
              placeholder="My Institution"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Logo URL
            </label>
            <div className="relative">
              <Upload size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.logoUrl}
                onChange={(e) => onChange('logoUrl', e.target.value)}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg pl-8 pr-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
                placeholder="https://…/logo.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand Colors */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Brand Colors
        </h2>
        <div className="space-y-3">
          <ColorField label="Primary" id="primary" value={form.primary} onChange={onChange} />
          <ColorField label="Secondary" id="secondary" value={form.secondary} onChange={onChange} />
          <ColorField label="Accent" id="accent" value={form.accent} onChange={onChange} />
        </div>
      </section>

      {/* Card Colors */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Cards &amp; Text
        </h2>
        <div className="space-y-3">
          <ColorField label="Muted Text" id="mutedText" value={form.mutedText} onChange={onChange} />
          <ColorField label="Card Border" id="cardBorder" value={form.cardBorder} onChange={onChange} />
          <ColorField label="Card Background" id="cardBackground" value={form.cardBackground} onChange={onChange} />
        </div>
      </section>
    </div>

    {/* Footer actions */}
    <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
      <button
        onClick={onReset}
        className="flex-1 text-sm font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
      >
        <X size={13} />
        Reset
      </button>
      <button
        onClick={onSave}
        className="flex-1 text-sm font-medium px-3 py-2 rounded-xl text-white transition flex items-center justify-center gap-1.5"
        style={{
          backgroundColor: saved ? '#10b981' : form.primary,
        }}
      >
        {saved ? <Check size={13} /> : <Save size={13} />}
        {saved ? 'Saved!' : 'Save'}
      </button>
    </div>
  </aside>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * InstitutionCustomizationView
 *
 * Full-screen layout with a configuration sidebar on the left and a live
 * high-fidelity mock of the Home page on the right.
 *
 * Props:
 *   initialValues  – optional partial form state to pre-populate
 *   onSave         – async (formState) => void, called when user saves
 */
const InstitutionCustomizationView = ({ initialValues, onSave, className = '' }) => {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...(initialValues || {}) });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ ...DEFAULT_FORM, ...(initialValues || {}) });
    setSaved(false);
  }, [initialValues]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleReset = () => {
    setForm({ ...DEFAULT_FORM });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      if (onSave) await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    }
  };

  const cssVars = buildCssVars(form);

  return (
    <div className={`${className} flex h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans`}>
      {/* ---- LEFT SIDEBAR ---- */}
      <Sidebar
        form={form}
        onChange={handleChange}
        onSave={handleSave}
        onReset={handleReset}
        saved={saved}
      />

      {/* ---- PREVIEW AREA ---- */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-200 dark:bg-slate-800">
        {/* Preview label bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 shrink-0">
          <Eye size={13} className="text-slate-500" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Live Preview</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
        </div>

        {/* Mock app shell */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-6">
          <div
            className="home-page w-full max-w-2xl min-h-full flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700"
            style={cssVars}
          >
            <MockHeader form={form} cssVars={cssVars} />
            <MockBreadcrumb />
            <MockControls cssVars={cssVars} />
            <MockHomeContent cssVars={cssVars} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionCustomizationView;