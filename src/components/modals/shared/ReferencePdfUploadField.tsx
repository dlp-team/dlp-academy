// src/components/modals/shared/ReferencePdfUploadField.tsx
import React from 'react';
import type { ChangeEvent } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';

type ReferencePdfUploadFieldProps = {
    uploadId: string;
    file?: File | null;
    onFileSelect: (file: File | null) => void;
    onRemoveFile: () => void;
    disabled?: boolean;
    label: string;
    labelHint?: string;
    emptyTitle: string;
    emptyDescription: string;
};

const ReferencePdfUploadField = ({
    uploadId,
    file,
    onFileSelect,
    onRemoveFile,
    disabled = false,
    label,
    labelHint,
    emptyTitle,
    emptyDescription,
}: ReferencePdfUploadFieldProps) => {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        onFileSelect(selectedFile);
    };

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                <Upload className="w-3.5 h-3.5" /> {label}
                {labelHint && (
                    <span className="text-slate-300 dark:text-slate-600 font-normal normal-case tracking-normal">
                        {labelHint}
                    </span>
                )}
            </label>

            <input
                type="file"
                id={uploadId}
                accept=".pdf"
                className="hidden"
                onChange={handleInputChange}
                disabled={disabled}
                data-testid="reference-pdf-upload-input"
            />

            {!file ? (
                <label
                    htmlFor={uploadId}
                    className="flex items-center gap-4 w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group/upload"
                >
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm group-hover/upload:scale-110 transition-transform">
                        <Upload className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover/upload:text-indigo-500 transition-colors" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">{emptyTitle}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs">{emptyDescription}</span>
                    </div>
                </label>
            ) : (
                <div className="flex items-center justify-between w-full px-5 py-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-2xl transition-all animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm shrink-0">
                            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-indigo-900 dark:text-indigo-200 font-bold text-sm truncate max-w-[200px]" title={file.name}>
                            {file.name}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onRemoveFile}
                        disabled={disabled}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-indigo-400 dark:text-indigo-500 hover:text-red-500 transition-colors hover:shadow-sm disabled:opacity-50"
                        data-testid="reference-pdf-remove-button"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReferencePdfUploadField;
