// src/pages/TeacherDashboard/components/ExamCorrectionTool.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, Sparkles, X, FileText, Image, AlertCircle,
  CheckCircle2, MessageSquare, ChevronRight, Loader2,
  Target, BarChart3, Brain, Eye
} from 'lucide-react';
import { hasRequiredRoleAccess } from '../../../utils/permissionUtils';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_RESULT = {
  documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  annotations: [
    {
      id: '1',
      type: 'error',
      label: 'Arithmetic Error',
      box: { x: 8, y: 22, width: 38, height: 9 },
      feedback:
        'The student forgot to carry the 1 in this addition step. The correct intermediate value should be 42, not 32. This is a common mistake — remind the student to double-check each column before moving to the next.',
    },
    {
      id: '2',
      type: 'success',
      label: 'Excellent Approach',
      box: { x: 8, y: 55, width: 82, height: 14 },
      feedback:
        'Excellent alternative approach! Using the quadratic formula here instead of factoring saved time and showed deep understanding of the underlying concepts. This demonstrates strong mathematical intuition.',
    },
    {
      id: '3',
      type: 'neutral',
      label: 'Standard Method',
      box: { x: 8, y: 75, width: 55, height: 10 },
      feedback:
        'The substitution method used here is correct and well-structured. While an alternative approach (elimination) might be slightly faster, the student\'s method is perfectly valid and clearly laid out.',
    },
  ],
  overallScore: '85/100',
  summary:
    'Overall good understanding of polynomial equations and algebraic methods. The student demonstrates solid conceptual knowledge but should focus on careful arithmetic to avoid small calculation errors that cost marks.',
};

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  error: {
    border: 'border-red-500/70',
    bg: 'bg-red-500/10',
    hover: 'hover:bg-red-500/20',
    ring: 'ring-red-500',
    badge: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
    panelBorder: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
    label: 'Error',
  },
  success: {
    border: 'border-emerald-500/70',
    bg: 'bg-emerald-500/10',
    hover: 'hover:bg-emerald-500/20',
    ring: 'ring-emerald-500',
    badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    panelBorder: 'border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
    label: 'Great Approach',
  },
  neutral: {
    border: 'border-blue-400/70',
    bg: 'bg-blue-400/10',
    hover: 'hover:bg-blue-400/20',
    ring: 'ring-blue-400',
    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-400',
    panelBorder: 'border-blue-200 dark:border-blue-800',
    icon: MessageSquare,
    label: 'Standard Comment',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Annotation bounding box rendered over the document */
const AnnotationBox = ({ annotation, isSelected, onClick }) => {
  const cfg = TYPE_CONFIG[annotation.type] || TYPE_CONFIG.neutral;
  const { box } = annotation;

  return (
    <div
      onClick={() => onClick(annotation)}
      title={cfg.label}
      style={{
        position: 'absolute',
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
      }}
      className={`
        border-2 rounded-md cursor-pointer transition-all duration-200 group
        ${cfg.border} ${cfg.bg} ${cfg.hover}
        ${isSelected ? `ring-2 ring-offset-1 ${cfg.ring} shadow-lg` : ''}
      `}
    >
      {/* Label badge at top-left corner */}
      <span className={`
        absolute -top-5 left-0 px-1.5 py-0.5 text-[10px] font-bold rounded-t-md
        border ${cfg.badge} whitespace-nowrap opacity-0 group-hover:opacity-100
        transition-opacity duration-150
        ${isSelected ? 'opacity-100' : ''}
      `}>
        {annotation.label}
      </span>

      {/* Pulse dot */}
      <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${cfg.dot} shadow-sm`} />
    </div>
  );
};

/** Document iframe/image with annotations overlaid */
const DocumentViewer = ({ documentUrl, annotations, selectedId, onAnnotationClick }) => {
  return (
    <div className="relative w-full" style={{ paddingBottom: '141.4%' /* A4 ratio */ }}>
      <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-white">
        <iframe
          src={documentUrl}
          title="Exam Document"
          className="w-full h-full"
        />
        {/* Annotation overlay — sits on top of the iframe */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            {annotations.map((ann) => (
              <AnnotationBox
                key={ann.id}
                annotation={ann}
                isSelected={selectedId === ann.id}
                onClick={onAnnotationClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Right-side feedback panel */
const FeedbackPanel = ({ annotation, result }) => {
  if (!annotation) {
    return (
      <div className="flex flex-col h-full">
        {/* Score summary */}
        {result && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Overall Score</span>
              <BarChart3 size={16} className="text-indigo-400" />
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{result.overallScore}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{result.summary}</p>
          </div>
        )}

        {/* Legend */}
        {result && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Annotations</p>
            <div className="space-y-2">
              {result.annotations.map((ann) => {
                const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.neutral;
                const Icon = cfg.icon;
                return (
                  <div key={ann.id} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.panelBorder} ${cfg.bg}`}>
                    <Icon size={15} className={`shrink-0 mt-0.5 ${ann.type === 'error' ? 'text-red-500' : ann.type === 'success' ? 'text-emerald-500' : 'text-blue-400'}`} />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{ann.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Prompt */}
        <div className="mt-auto flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <Target size={22} className="text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Click a highlighted area</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">to view Gemini's feedback</p>
        </div>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[annotation.type] || TYPE_CONFIG.neutral;
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 fade-in duration-300">
      {/* Type badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border mb-4 self-start ${cfg.badge}`}>
        <Icon size={12} />
        {cfg.label}
      </div>

      {/* Label */}
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 leading-tight">{annotation.label}</h3>

      {/* Divider */}
      <div className={`h-0.5 w-12 rounded-full mb-4 ${cfg.dot}`} />

      {/* Feedback text */}
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">{annotation.feedback}</p>

      {/* Gemini attribution */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800/50">
          <Sparkles size={14} className="text-purple-500 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">AI Feedback</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Corrected by Gemini</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Upload dropzone */
const UploadZone = ({ onFileSelect, isDragging, setIsDragging }) => {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragging
          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
          : 'border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
      />
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
        <Upload size={28} className={isDragging ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'} />
      </div>
      <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
        {isDragging ? 'Drop to upload' : 'Upload exam for AI correction'}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Drag & drop or click to browse</p>
      <div className="flex items-center justify-center gap-3">
        {[['image/*', Image, 'Images'], ['.pdf', FileText, 'PDF']].map(([, Icon, label]) => (
          <span key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Icon size={11} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const ExamCorrectionTool = ({ user }) => {
  const [state, setState] = useState('idle'); // idle | loading | done
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);

  // Access control
  if (!hasRequiredRoleAccess(user, 'teacher')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <Eye size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">This tool is only available to teachers.</p>
      </div>
    );
  }

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setState('loading');
    setSelectedAnnotation(null);

    // Simulate n8n webhook call with 3s delay
    setTimeout(() => {
      setResult(MOCK_RESULT);
      setState('done');
    }, 3000);
  }, []);

  const handleReset = () => {
    setState('idle');
    setSelectedFile(null);
    setResult(null);
    setSelectedAnnotation(null);
  };

  const handleAnnotationClick = (annotation) => {
    setSelectedAnnotation(prev => prev?.id === annotation.id ? null : annotation);
    setPanelOpen(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">AI Exam Correction</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Powered by Gemini</p>
          </div>
        </div>
        {state !== 'idle' && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <X size={13} /> New Upload
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-6">

        {/* IDLE: Upload zone */}
        {state === 'idle' && (
          <UploadZone
            onFileSelect={handleFileSelect}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />
        )}

        {/* LOADING */}
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Loader2 size={28} className="text-white animate-spin" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-white mb-2">Analyzing exam…</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Gemini is reviewing <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedFile?.name}</span> and identifying annotations
            </p>
            <div className="mt-6 flex gap-1.5">
              {[0, 150, 300].map(delay => (
                <span key={delay} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* DONE: Viewer + Panel */}
        {state === 'done' && result && (
          <div className="flex gap-6">
            {/* Document Viewer */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Document</p>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={11} /> {result.annotations.length} annotations
                </span>
              </div>
              <DocumentViewer
                documentUrl={result.documentUrl}
                annotations={result.annotations}
                selectedId={selectedAnnotation?.id}
                onAnnotationClick={handleAnnotationClick}
              />

              {/* Color legend below document */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                  <span key={type} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Feedback Panel */}
            <div className={`w-72 shrink-0 transition-all duration-300 ${panelOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {selectedAnnotation ? 'Feedback' : 'Summary'}
                </p>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 h-[calc(100%-2rem)] overflow-y-auto">
                <FeedbackPanel annotation={selectedAnnotation} result={result} />
              </div>
            </div>

            {/* Collapsed panel toggle */}
            {!panelOpen && (
              <button
                onClick={() => setPanelOpen(true)}
                className="self-start mt-8 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                title="Open feedback panel"
              >
                <ChevronRight size={14} className="text-slate-500 rotate-180" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCorrectionTool;