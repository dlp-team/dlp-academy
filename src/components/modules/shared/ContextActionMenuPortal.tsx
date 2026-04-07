// src/components/modules/shared/ContextActionMenuPortal.tsx
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ContextActionMenuPortalProps = {
    isOpen: boolean;
    children: ReactNode;
    menuClassName: string;
    menuStyle?: CSSProperties;
    showCloseLayer?: boolean;
    closeLayerTop?: number;
    closeLayerClassName?: string;
    closeLayerStyle?: CSSProperties;
    onRequestClose?: () => void;
    portalTarget?: HTMLElement | null;
};

const ContextActionMenuPortal = ({
    isOpen,
    children,
    menuClassName,
    menuStyle,
    showCloseLayer = false,
    closeLayerTop,
    closeLayerClassName = 'fixed inset-x-0 bottom-0 z-[100]',
    closeLayerStyle,
    onRequestClose,
    portalTarget,
}: ContextActionMenuPortalProps) => {
    if (!isOpen) return null;

    const resolvedTarget = portalTarget || (typeof document !== 'undefined' ? document.body : null);
    if (!resolvedTarget) return null;

    const resolvedCloseLayerStyle: CSSProperties | undefined = showCloseLayer
        ? {
            ...(typeof closeLayerTop === 'number' ? { top: `${closeLayerTop}px` } : {}),
            ...(closeLayerStyle || {}),
        }
        : closeLayerStyle;

    const handleCloseLayerClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (typeof onRequestClose === 'function') onRequestClose();
    };

    return createPortal(
        <>
            {showCloseLayer && typeof onRequestClose === 'function' && (
                <div
                    className={closeLayerClassName}
                    style={resolvedCloseLayerStyle}
                    onClick={handleCloseLayerClick}
                    data-testid="context-action-menu-close-layer"
                />
            )}
            <div className={menuClassName} style={menuStyle} onClick={(event) => event.stopPropagation()}>
                {children}
            </div>
        </>,
        resolvedTarget
    );
};

export default ContextActionMenuPortal;
