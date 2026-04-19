// src/hooks/useUnsavedChangesGuard.ts
import { useCallback, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Deep-equal helper (handles primitives, plain objects, arrays)      */
/* ------------------------------------------------------------------ */
const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }

  if (typeof a === 'object') {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    if (ka.length !== kb.length) return false;
    return ka.every(k =>
      deepEqual(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    );
  }

  return false;
};

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */
export interface UseUnsavedChangesGuardOptions {
  /** Snapshot taken when the form/overlay opened. */
  initialValues: Record<string, unknown>;
  /** Live form state. */
  currentValues: Record<string, unknown>;
  /** Called after user confirms discard. */
  onConfirmDiscard: () => void;
  /** Called when user cancels the discard prompt. */
  onCancelDiscard?: () => void;
}

export interface UseUnsavedChangesGuardReturn {
  /** Whether form values differ from initial snapshot. */
  isDirty: boolean;
  /** Whether the confirmation modal is visible. */
  showConfirmation: boolean;
  /** Call when user tries to close (backdrop click, X, Escape). */
  requestClose: () => void;
  /** Call when user confirms discard inside the modal. */
  confirmDiscard: () => void;
  /** Call when user cancels discard inside the modal. */
  cancelDiscard: () => void;
  /** Call after a successful save to clear dirty state. */
  resetDirty: () => void;
}

const useUnsavedChangesGuard = ({
  initialValues,
  currentValues,
  onConfirmDiscard,
  onCancelDiscard,
}: UseUnsavedChangesGuardOptions): UseUnsavedChangesGuardReturn => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const savedRef = useRef(false);

  const isDirty = !savedRef.current && !deepEqual(initialValues, currentValues);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setShowConfirmation(true);
    } else {
      onConfirmDiscard();
    }
  }, [isDirty, onConfirmDiscard]);

  const confirmDiscard = useCallback(() => {
    setShowConfirmation(false);
    onConfirmDiscard();
  }, [onConfirmDiscard]);

  const cancelDiscard = useCallback(() => {
    setShowConfirmation(false);
    onCancelDiscard?.();
  }, [onCancelDiscard]);

  const resetDirty = useCallback(() => {
    savedRef.current = true;
    setShowConfirmation(false);
  }, []);

  return {
    isDirty,
    showConfirmation,
    requestClose,
    confirmDiscard,
    cancelDiscard,
    resetDirty,
  };
};

export default useUnsavedChangesGuard;
