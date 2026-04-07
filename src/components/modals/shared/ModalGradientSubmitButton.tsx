// src/components/modals/shared/ModalGradientSubmitButton.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type ModalGradientSubmitButtonProps = {
    form: string;
    gradientClass: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    isLoading?: boolean;
    loadingLabel?: string;
    className?: string;
};

const joinClassNames = (...classNames: Array<string | undefined>) => (
    classNames.filter(Boolean).join(' ')
);

const ModalGradientSubmitButton = ({
    form,
    gradientClass,
    label,
    icon,
    disabled = false,
    isLoading = false,
    loadingLabel = 'Cargando...',
    className,
}: ModalGradientSubmitButtonProps) => {
    const resolvedDisabled = disabled || isLoading;

    return (
        <button
            type="submit"
            form={form}
            disabled={resolvedDisabled}
            className={joinClassNames(
                `flex-[2] px-6 py-4 bg-gradient-to-r ${gradientClass} text-white rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`,
                className
            )}
            data-testid="modal-gradient-submit-button"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                    <span className="animate-pulse">{loadingLabel}</span>
                </>
            ) : (
                <>
                    {icon}
                    <span>{label}</span>
                </>
            )}
        </button>
    );
};

export default ModalGradientSubmitButton;
