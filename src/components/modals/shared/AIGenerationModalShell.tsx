// src/components/modals/shared/AIGenerationModalShell.tsx
import React from 'react';
import type { MouseEvent, ReactNode } from 'react';

type AIGenerationModalShellProps = {
    shouldRender: boolean;
    isVisible: boolean;
    onRequestClose: () => void;
    children: ReactNode;
    maxWidthClassName?: string;
    rootClassName?: string;
    backdropClassName?: string;
    dialogClassName?: string;
};

const joinClassNames = (...classNames: Array<string | undefined>) => (
    classNames.filter(Boolean).join(' ')
);

const AIGenerationModalShell = ({
    shouldRender,
    isVisible,
    onRequestClose,
    children,
    maxWidthClassName = 'max-w-lg',
    rootClassName,
    backdropClassName,
    dialogClassName,
}: AIGenerationModalShellProps) => {
    if (!shouldRender) return null;

    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        onRequestClose();
    };

    return (
        <div
            className={joinClassNames(
                `fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-500 ${isVisible ? 'visible' : 'invisible'}`,
                rootClassName
            )}
        >
            <div
                className={joinClassNames(
                    `fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`,
                    backdropClassName
                )}
                onClick={handleBackdropClick}
                data-testid="ai-generation-modal-shell-backdrop"
            />

            <div
                className={joinClassNames(
                    `relative bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] w-full ${maxWidthClassName} shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform origin-bottom ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}`,
                    dialogClassName
                )}
                role="dialog"
                aria-modal="true"
                onClick={(event) => event.stopPropagation()}
                data-testid="ai-generation-modal-shell-dialog"
            >
                {children}
            </div>
        </div>
    );
};

export default AIGenerationModalShell;
