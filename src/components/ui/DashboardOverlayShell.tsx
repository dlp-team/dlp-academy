// src/components/ui/DashboardOverlayShell.tsx
import React, { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import BaseModal from './BaseModal';
import { OVERLAY_TOP_OFFSET_STYLE } from '../../utils/layoutConstants';

type OverlayWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
type OverlayCloseReason = 'backdrop';

type OverlayRenderProps = {
  requestClose: () => void;
};

type OverlayContent = ReactNode | ((props: OverlayRenderProps) => ReactNode);

type DashboardOverlayShellProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onBeforeClose?: (reason: OverlayCloseReason) => boolean;
  onBlockedCloseAttempt?: (reason: OverlayCloseReason) => void;
  closeOnBackdropClick?: boolean;
  hasUnsavedChanges?: boolean;
  confirmOnUnsavedClose?: boolean;
  unsavedChangesTitle?: string;
  unsavedChangesMessage?: string;
  unsavedChangesConfirmLabel?: string;
  unsavedChangesCancelLabel?: string;
  maxWidth?: OverlayWidth;
  maxHeightClassName?: string;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  backdropClassName?: string;
  wrapperClassName?: string;
  contentClassName?: string;
  children: OverlayContent;
};

const OVERLAY_WIDTH_CLASSNAME_BY_SIZE: Record<OverlayWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

const joinClassNames = (...classNames: Array<string | undefined>) => (
  classNames.filter(Boolean).join(' ')
);

const DashboardOverlayShell = ({
  isOpen = true,
  onClose,
  onBeforeClose,
  onBlockedCloseAttempt,
  closeOnBackdropClick = true,
  hasUnsavedChanges = false,
  confirmOnUnsavedClose = false,
  unsavedChangesTitle = 'Descartar cambios',
  unsavedChangesMessage = 'Hay cambios sin guardar. Si sales ahora, se perderán.',
  unsavedChangesConfirmLabel = 'Salir sin guardar',
  unsavedChangesCancelLabel = 'Seguir editando',
  maxWidth = '3xl',
  maxHeightClassName = 'max-h-[calc(100vh-8rem)]',
  rootClassName,
  rootStyle,
  backdropClassName,
  wrapperClassName,
  contentClassName,
  children,
}: DashboardOverlayShellProps) => {
  const [showUnsavedCloseConfirmation, setShowUnsavedCloseConfirmation] = useState(false);
  const widthClassName = OVERLAY_WIDTH_CLASSNAME_BY_SIZE[maxWidth] || OVERLAY_WIDTH_CLASSNAME_BY_SIZE['3xl'];
  const resolvedRootStyle = rootStyle || OVERLAY_TOP_OFFSET_STYLE;

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setShowUnsavedCloseConfirmation(false);
  }, [isOpen]);

  const shouldShowUnsavedGuard = confirmOnUnsavedClose && hasUnsavedChanges;

  const canCloseFromGuard = () => {
    const canClose = onBeforeClose ? onBeforeClose('backdrop') : true;
    if (!canClose) {
      onBlockedCloseAttempt?.('backdrop');
      return false;
    }

    return true;
  };

  const requestClose = () => {
    if (shouldShowUnsavedGuard) {
      setShowUnsavedCloseConfirmation(true);
      return;
    }

    if (!canCloseFromGuard()) {
      return;
    }

    onClose?.();
  };

  const handleBeforeBackdropClose = () => {
    if (shouldShowUnsavedGuard) {
      setShowUnsavedCloseConfirmation(true);
      return false;
    }

    return canCloseFromGuard();
  };

  const renderedChildren = typeof children === 'function'
    ? children({ requestClose })
    : children;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        onBeforeClose={handleBeforeBackdropClose}
        closeOnBackdropClick={closeOnBackdropClick}
        rootClassName={joinClassNames('fixed inset-x-0 bottom-0 z-50 overflow-y-auto', rootClassName)}
        rootStyle={resolvedRootStyle}
        backdropClassName={joinClassNames('absolute inset-0 bg-slate-950/60', backdropClassName)}
        contentWrapperClassName={joinClassNames(
          'relative z-10 flex min-h-full items-start justify-center overflow-y-auto px-4 py-6',
          wrapperClassName
        )}
        contentClassName={joinClassNames(
          `relative w-full ${widthClassName} ${maxHeightClassName} overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl`,
          contentClassName
        )}
      >
        {renderedChildren}
      </BaseModal>

      <BaseModal
        isOpen={isOpen && showUnsavedCloseConfirmation}
        onClose={() => setShowUnsavedCloseConfirmation(false)}
        rootClassName="fixed inset-x-0 bottom-0 z-[60] overflow-y-auto"
        rootStyle={resolvedRootStyle}
        backdropClassName="absolute inset-0 bg-slate-950/70"
        contentWrapperClassName="relative z-10 flex min-h-full items-center justify-center px-4 py-6"
        contentClassName="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-5"
      >
        <h4 className="text-base font-semibold text-slate-900 dark:text-white">{unsavedChangesTitle}</h4>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{unsavedChangesMessage}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowUnsavedCloseConfirmation(false)}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
          >
            {unsavedChangesCancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUnsavedCloseConfirmation(false);
              onClose?.();
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
          >
            {unsavedChangesConfirmLabel}
          </button>
        </div>
      </BaseModal>
    </>
  );
};

export default DashboardOverlayShell;
