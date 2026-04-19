// src/components/ui/UnsavedChangesConfirmModal.tsx
import BaseModal from './BaseModal';
import { OVERLAY_TOP_OFFSET_STYLE } from '../../utils/layoutConstants';

export interface UnsavedChangesConfirmModalProps {
  isOpen: boolean;
  onDiscard: () => void;
  onCancel: () => void;
  /** Override default title. */
  title?: string;
  /** Override default description. */
  message?: string;
  /** Override discard button label. */
  discardLabel?: string;
  /** Override cancel button label. */
  cancelLabel?: string;
  /**
   * When true the modal renders as an absolute overlay inside its parent
   * (used inside BaseModal-based overlays). When false (default) it renders
   * as a fixed viewport-level modal.
   */
  inline?: boolean;
}

const UnsavedChangesConfirmModal = ({
  isOpen,
  onDiscard,
  onCancel,
  title = 'Descartar cambios sin guardar',
  message = 'Tienes cambios sin guardar. Si sales ahora, se perderán.',
  discardLabel = 'Descartar y cerrar',
  cancelLabel = 'Cancelar',
  inline = false,
}: UnsavedChangesConfirmModalProps) => {
  if (!isOpen) return null;

  const content = (
    <>
      <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
        >
          {discardLabel}
        </button>
      </div>
    </>
  );

  /* ---- Inline variant (rendered inside an existing overlay) ---- */
  if (inline) {
    return (
      <div
        className="absolute inset-0 z-40 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 bg-black/55"
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
        />
        <div
          className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  /* ---- Fixed variant (viewport-level, used by GuardedOverlay) ---- */
  return (
    <BaseModal
      isOpen
      onClose={onCancel}
      rootClassName="fixed inset-x-0 bottom-0 z-[60] overflow-y-auto"
      rootStyle={OVERLAY_TOP_OFFSET_STYLE}
      backdropClassName="absolute inset-0 bg-slate-950/70"
      contentWrapperClassName="relative z-10 flex min-h-full items-center justify-center px-4 py-6"
      contentClassName="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-5"
    >
      {content}
    </BaseModal>
  );
};

export default UnsavedChangesConfirmModal;
