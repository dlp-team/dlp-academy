// src/components/ui/DashboardOverlayShell.tsx
import React from 'react';
import type { ReactNode } from 'react';
import BaseModal from './BaseModal';

type OverlayWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

type DashboardOverlayShellProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onBeforeClose?: (reason: 'backdrop') => boolean;
  onBlockedCloseAttempt?: (reason: 'backdrop') => void;
  closeOnBackdropClick?: boolean;
  maxWidth?: OverlayWidth;
  rootClassName?: string;
  backdropClassName?: string;
  wrapperClassName?: string;
  contentClassName?: string;
  children: ReactNode;
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
  maxWidth = '3xl',
  rootClassName,
  backdropClassName,
  wrapperClassName,
  contentClassName,
  children,
}: DashboardOverlayShellProps) => {
  const widthClassName = OVERLAY_WIDTH_CLASSNAME_BY_SIZE[maxWidth] || OVERLAY_WIDTH_CLASSNAME_BY_SIZE['3xl'];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onBeforeClose={onBeforeClose}
      onBlockedCloseAttempt={onBlockedCloseAttempt}
      closeOnBackdropClick={closeOnBackdropClick}
      rootClassName={joinClassNames('fixed inset-0 z-50', rootClassName)}
      backdropClassName={joinClassNames('absolute inset-0 bg-slate-950/60', backdropClassName)}
      contentWrapperClassName={joinClassNames(
        'relative z-10 flex min-h-full items-start justify-center overflow-y-auto px-4 pb-6 pt-24',
        wrapperClassName
      )}
      contentClassName={joinClassNames(
        `relative w-full ${widthClassName} rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl`,
        contentClassName
      )}
    >
      {children}
    </BaseModal>
  );
};

export default DashboardOverlayShell;
