// src/pages/Home/components/HomeShortcutFeedback.tsx
import React from 'react';

type HomeShortcutFeedbackProps = {
    message: string;
    mutedTextClass: string;
};

const HomeShortcutFeedback = ({ message, mutedTextClass }: HomeShortcutFeedbackProps) => {
    if (!message) {
        return null;
    }

    return (
        <p className={`${mutedTextClass} mt-4 rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60`}>
            {message}
        </p>
    );
};

export default HomeShortcutFeedback;
