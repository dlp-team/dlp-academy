// src/pages/Home/components/HomeBulkActionFeedback.tsx
import React from 'react';

type HomeBulkActionFeedbackProps = {
    message: string;
    tone?: 'success' | 'warning' | 'error' | string;
};

const TONE_CLASS_MAP: Record<string, string> = {
    error:
        'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning:
        'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    success:
        'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
};

const HomeBulkActionFeedback = ({ message, tone = 'success' }: HomeBulkActionFeedbackProps) => {
    if (!message) {
        return null;
    }

    const toneClasses = TONE_CLASS_MAP[tone] || TONE_CLASS_MAP.success;

    return (
        <p className={`mt-3 rounded-lg border px-3 py-2 text-sm ${toneClasses}`}>
            {message}
        </p>
    );
};

export default HomeBulkActionFeedback;
