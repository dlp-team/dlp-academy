// src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Loader2, Sparkles, UploadCloud, XCircle } from 'lucide-react';
import DashboardOverlayShell from '../../../components/ui/DashboardOverlayShell';

const DEFAULT_STUDENT_MAPPING = {
  emailColumn: 'email',
  identifierColumn: '',
  nameColumn: 'name',
  courseColumn: '',
};

const DEFAULT_COURSE_LINK_MAPPING = {
  emailColumn: 'email',
  identifierColumn: 'studentIdentifier',
  nameColumn: '',
  courseColumn: 'courseId',
};

const CsvImportWorkflowModal = ({
  isOpen,
  onClose,
  workflowType,
  title,
  description,
  onUploadFile,
  onRunManualImport,
  onRunN8nImport,
}: any) => {
  const [mode, setMode] = useState('manual');
  const [sourceType, setSourceType] = useState('file');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [mapping, setMapping] = useState(
    workflowType === 'students' ? DEFAULT_STUDENT_MAPPING : DEFAULT_COURSE_LINK_MAPPING
  );
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (isOpen) return;

    setMode('manual');
    setSourceType('file');
    setGoogleSheetUrl('');
    setMapping(workflowType === 'students' ? DEFAULT_STUDENT_MAPPING : DEFAULT_COURSE_LINK_MAPPING);
    setUploadedFile(null);
    setUploadMessage('');
    setErrorMessage('');
    setSummary(null);
  }, [isOpen, workflowType]);

  const hasUploadedFile = Boolean(uploadedFile?.file && uploadedFile?.storagePath);
  const hasValidGoogleSheetUrl = String(googleSheetUrl || '').trim().startsWith('http');
  const hasAnySource = sourceType === 'file' ? hasUploadedFile : hasValidGoogleSheetUrl;
  const manualRequiresCourseColumn = workflowType === 'course-links';

  const canRunManual = useMemo(() => {
    if (!hasAnySource) return false;
    if (!mapping.emailColumn.trim() && !mapping.identifierColumn.trim()) return false;
    if (manualRequiresCourseColumn && !mapping.courseColumn.trim()) return false;
    return true;
  }, [hasAnySource, mapping, manualRequiresCourseColumn]);

  if (!isOpen) return null;

  const closeModal = () => {
    if (isUploading || isExecuting) return;
    onClose();
  };

  const updateMappingField = (field: any, value: any) => {
    setMapping((previous: any) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSelectFile = async (event: any) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';
    if (!selectedFile || !onUploadFile) return;

    setSummary(null);
    setErrorMessage('');
    setUploadMessage('');
    setIsUploading(true);

    try {
      const uploadResult = await onUploadFile(selectedFile, workflowType);
      setUploadedFile({
        ...uploadResult,
        file: selectedFile,
      });
      setUploadMessage(`Archivo subido: ${selectedFile.name}`);
    } catch (error) {
      console.error('Error uploading import file:', error);
      setUploadedFile(null);
      setErrorMessage('No se pudo subir el archivo. Verifica el formato e inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const selectSourceType = (nextSourceType: any) => {
    if (isUploading || isExecuting) return;
    setSourceType(nextSourceType);
    setSummary(null);
    setErrorMessage('');
  };

  const runManualImport = async () => {
    if (!onRunManualImport || !canRunManual || isExecuting) return;

    setErrorMessage('');
    setSummary(null);
    setIsExecuting(true);

    try {
      let fileText = '';
      if (sourceType === 'file') {
        const selectedFileName = String(uploadedFile?.file?.name || '').toLowerCase();
        const isCsvLikeFile = selectedFileName.endsWith('.csv') || selectedFileName.endsWith('.txt');
        if (!isCsvLikeFile) {
          throw new Error('MANUAL_ONLY_CSV');
        }
        fileText = await uploadedFile.file.text();
      }

      const importSummary = await onRunManualImport({
        workflowType,
        mapping,
        sourceType,
        sourceUrl: sourceType === 'google-sheet' ? googleSheetUrl.trim() : '',
        fileText,
        uploadedFile: sourceType === 'file'
          ? {
            name: uploadedFile.name,
            storagePath: uploadedFile.storagePath,
            downloadUrl: uploadedFile.downloadUrl,
            mimeType: uploadedFile.mimeType,
            size: uploadedFile.size,
          }
          : null,
      });
      setSummary(importSummary);
    } catch (error: any) {
      if (String(error?.message || '') === 'MANUAL_ONLY_CSV') {
        setErrorMessage('Para el mapeo manual con archivo usa CSV/TXT. Si subes Excel usa la opción n8n.');
      } else {
        console.error('Error running manual import:', error);
        setErrorMessage('No se pudo completar la importación manual. Revisa las columnas configuradas.');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const runN8nImport = async () => {
    if (!onRunN8nImport || !hasAnySource || isExecuting) return;

    setErrorMessage('');
    setSummary(null);
    setIsExecuting(true);

    try {
      const n8nSummary = await onRunN8nImport({
        workflowType,
        mapping,
        sourceType,
        sourceUrl: sourceType === 'google-sheet' ? googleSheetUrl.trim() : '',
        uploadedFile: sourceType === 'file'
          ? {
            name: uploadedFile.name,
            storagePath: uploadedFile.storagePath,
            downloadUrl: uploadedFile.downloadUrl,
            mimeType: uploadedFile.mimeType,
            size: uploadedFile.size,
          }
          : null,
      });
      setSummary(n8nSummary);
    } catch (error) {
      console.error('Error sending CSV import to n8n:', error);
      setErrorMessage('No se pudo enviar el proceso a n8n. Verifica la configuración del webhook.');
    } finally {
      setIsExecuting(false);
    }
  };

  const showManualCourseHelp = workflowType === 'course-links';

  return (
    <DashboardOverlayShell isOpen={isOpen} onClose={closeModal} maxWidth="3xl">
      <div className="p-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            {title}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>

          <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300 mb-2">Fuente de datos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => selectSourceType('file')}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold text-left ${sourceType === 'file' ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
              >
                Archivo en Firebase Storage
              </button>
              <button
                type="button"
                onClick={() => selectSourceType('google-sheet')}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold text-left ${sourceType === 'google-sheet' ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
              >
                URL de Google Sheets
              </button>
            </div>

            {sourceType === 'file' ? (
              <>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  <UploadCloud className="w-4 h-4" />
                  {isUploading ? 'Subiendo archivo...' : 'Subir archivo CSV / Excel / TXT'}
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.txt"
                    className="hidden"
                    onChange={handleSelectFile}
                    disabled={isUploading || isExecuting}
                  />
                </label>
                {uploadMessage && (
                  <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">{uploadMessage}</p>
                )}
                {uploadedFile?.storagePath && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Ruta en Storage: {uploadedFile.storagePath}
                  </p>
                )}
              </>
            ) : (
              <label className="text-xs text-slate-600 dark:text-slate-300 block">
                URL pública de Google Sheets
                <input
                  type="url"
                  value={googleSheetUrl}
                  onChange={(event) => setGoogleSheetUrl(event.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                  Debe ser una hoja accesible por enlace para lectura CSV automática.
                </span>
              </label>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                mode === 'manual'
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              <p className="font-semibold">Mapeo manual en DLP</p>
              <p className="text-xs mt-1">Define columnas exactas y ejecuta la actualización directa.</p>
            </button>
            <button
              type="button"
              onClick={() => setMode('n8n')}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                mode === 'n8n'
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              <p className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Procesar con n8n</p>
              <p className="text-xs mt-1">Envía el archivo a un flujo externo para mapeo automático.</p>
            </button>
          </div>

          {mode === 'manual' && (
            <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Columnas del archivo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs text-slate-600 dark:text-slate-300">
                  Email del alumno (requerido si no hay identificador)
                  <input
                    type="text"
                    value={mapping.emailColumn}
                    onChange={(event) => updateMappingField('emailColumn', event.target.value)}
                    placeholder="email"
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-600 dark:text-slate-300">
                  Identificador del alumno (opcional)
                  <input
                    type="text"
                    value={mapping.identifierColumn}
                    onChange={(event) => updateMappingField('identifierColumn', event.target.value)}
                    placeholder="studentIdentifier"
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-600 dark:text-slate-300">
                  Nombre del alumno (opcional)
                  <input
                    type="text"
                    value={mapping.nameColumn}
                    onChange={(event) => updateMappingField('nameColumn', event.target.value)}
                    placeholder="name"
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-600 dark:text-slate-300">
                  Curso del alumno {manualRequiresCourseColumn ? '(requerido)' : '(opcional)'}
                  <input
                    type="text"
                    value={mapping.courseColumn}
                    onChange={(event) => updateMappingField('courseColumn', event.target.value)}
                    placeholder="courseId"
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              {showManualCourseHelp && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  El valor de curso puede ser ID o nombre. Para identificar al alumno se prioriza email y, si no existe, identificador.
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-300 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> {errorMessage}
            </p>
          )}

          {summary && (
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 text-sm text-slate-700 dark:text-slate-200 space-y-1">
              {typeof summary.processedRows === 'number' && <p>Filas procesadas: <strong>{summary.processedRows}</strong></p>}
              {typeof summary.linkedRows === 'number' && <p>Filas vinculadas: <strong>{summary.linkedRows}</strong></p>}
              {typeof summary.updatedStudents === 'number' && <p>Alumnos actualizados: <strong>{summary.updatedStudents}</strong></p>}
              {typeof summary.linkedStudents === 'number' && <p>Alumnos vinculados: <strong>{summary.linkedStudents}</strong></p>}
              {Array.isArray(summary.invalidRows) && summary.invalidRows.length > 0 && (
                <p>Líneas inválidas: <strong>{summary.invalidRows.join(', ')}</strong></p>
              )}
              {Array.isArray(summary.skippedRows) && summary.skippedRows.length > 0 && (
                <p>Líneas omitidas: <strong>{summary.skippedRows.join(', ')}</strong></p>
              )}
              {Array.isArray(summary.missingStudents) && summary.missingStudents.length > 0 && (
                <p>Alumnos no encontrados: <strong>{summary.missingStudents.join(', ')}</strong></p>
              )}
              {Array.isArray(summary.missingCourses) && summary.missingCourses.length > 0 && (
                <p>Cursos no encontrados: <strong>{summary.missingCourses.join(', ')}</strong></p>
              )}
              {Array.isArray(summary.detectedColumns) && summary.detectedColumns.length > 0 && (
                <p>Columnas detectadas por IA: <strong>{summary.detectedColumns.join(', ')}</strong></p>
              )}
              {Array.isArray(summary.warnings) && summary.warnings.length > 0 && (
                <p>Advertencias: <strong>{summary.warnings.join(' | ')}</strong></p>
              )}
              {Array.isArray(summary.recommendations) && summary.recommendations.length > 0 && (
                <p>Recomendaciones: <strong>{summary.recommendations.join(' | ')}</strong></p>
              )}
              {summary.aiMapping && (
                <p>Mapeo IA sugerido: <strong>{JSON.stringify(summary.aiMapping)}</strong></p>
              )}
              {summary.queued && (
                <p className="text-emerald-600 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {summary.message || 'Proceso enviado correctamente a n8n.'}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={isUploading || isExecuting}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={mode === 'manual' ? runManualImport : runN8nImport}
              disabled={
                isUploading
                || isExecuting
                || !hasAnySource
                || (mode === 'manual' ? !canRunManual : false)
              }
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === 'manual'
                ? (workflowType === 'course-links' ? 'Aplicar vinculación de cursos' : 'Aplicar importación de alumnos')
                : 'Enviar a n8n'}
            </button>
          </div>
      </div>
    </DashboardOverlayShell>
  );
};

export default CsvImportWorkflowModal;
