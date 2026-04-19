// src/components/ui/GuardedOverlay.tsx
import React, { useCallback, useEffect, useState } from 'react';
import BaseModal from './BaseModal';
import UnsavedChangesConfirmModal from './UnsavedChangesConfirmModal';
import { OVERLAY_TOP_OFFSET_STYLE } from '../../utils/layoutConstants';

export interface GuardedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isDirty: boolean;
  children: React.ReactNode;
  /** Extra classes on the fixed root container. */
  className?: string;
  /** Override the confirmation modal title. */
  unsavedTitle?: string;
  /** Override the confirmation modal message. */
  unsavedMessage?: string;
}

/**
 * Wraps any overlay content with an unsaved-changes guard.
 *
 * - If `isDirty` is false, backdrop clicks and Escape close immediately.
 * - If `isDirty` is true, a confirmation dialog is shown first.
 */
const GuardedOverlay = ({
  isOpen,
  onClose,
  isDirty,
  children,
  className,
  unsavedTitle,
  unsavedMessage,
}: GuardedOverlayProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset confirmation state when the overlay closes.
  useEffect(() => {
    if (!isOpen) setShowConfirm(false);
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (isDirty) {
        setShowConfirm(true);
      } else {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty, onClose]);

  const handleBeforeClose = useCallback(() => {
    if (isDirty) {
      setShowConfirm(true);
      return false;
    }
    return true;
  }, [isDirty]);

  if (!isOpen) return null;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        onBeforeClose={handleBeforeClose}
        closeOnBackdropClick
        rootClassName={`fixed inset-x-0 bottom-0 z-50 overflow-y-auto ${className ?? ''}`}
        rootStyle={OVERLAY_TOP_OFFSET_STYLE}
        backdropClassName="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        contentWrapperClassName="relative z-10 flex min-h-full items-center justify-center p-4"
        contentClassName="relative"
      >
        {children}
      </BaseModal>

      <UnsavedChangesConfirmModal
        isOpen={showConfirm}
        onDiscard={() => { setShowConfirm(false); onClose(); }}
        onCancel={() => setShowConfirm(false)}
        title={unsavedTitle}
        message={unsavedMessage}
      />
    </>
  );
};

export default GuardedOverlay;
