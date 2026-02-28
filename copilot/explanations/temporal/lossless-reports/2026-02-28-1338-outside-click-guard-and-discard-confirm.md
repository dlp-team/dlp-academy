# Lossless Review Report

- Timestamp: 2026-02-28 13:38 local
- Task: Outside-click guard + pending discard confirmation
- Request summary: "Clicking outside apply confirmation should close only that confirmation. Clicking outside edit modal should ask to discard only when pending changes exist; otherwise close directly."

## 1) Requested scope
- Ensure outside click on apply-changes confirmation closes only that confirmation layer.
- Prevent losing pending changes when clicking outside modal by showing discard confirmation when pending exists.
- Directly close modal on outside click when no pending changes.

## 2) Out-of-scope preserved
- Existing staged apply logic and self-unshare inline flow preserved.
- Shared user row layout and avatar/name/email structure preserved.
- General tab behavior unchanged.

## 3) Touched files
- src/pages/Home/components/FolderManager.jsx
- src/pages/Subject/modals/SubjectFormModal.jsx

## 4) Per-file verification (required)
### File: src/pages/Home/components/FolderManager.jsx
- Why touched: outside click behavior was closing the full edit modal and discarding pending changes unexpectedly.
- Reviewed items:
  - Backdrop close path -> replaced direct close with guarded handler (`handleBackdropCloseRequest`).
  - Pending detection -> added `hasUnsavedSharingChanges` check and discard confirmation overlay (`showDiscardPendingConfirm`).
  - Apply overlay behavior -> click outside apply card now closes only apply overlay and stops propagation.
- Result: ✅ preserved

### File: src/pages/Subject/modals/SubjectFormModal.jsx
- Why touched: same outside-click issue and requirement parity.
- Reviewed items:
  - Guarded outside close + pending discard confirmation behavior mirrored.
  - Apply overlay outside click isolated via stopPropagation + local close.
  - Pending discard action resets staged sharing state before closing.
- Result: ✅ preserved

## 5) Risk checks
- Potential risk: layered overlays could conflict in click propagation.
- Mitigation check: explicit stopPropagation on overlay containers and dim layers; apply overlay only active on `apply-all`.
- Outcome: outside interactions are deterministic and pending changes are protected.

## 6) Validation summary
- Diagnostics: `get_errors` reports no errors in both touched files.
- Runtime checks: static path verification for outside click with and without pending changes.

## 7) Cleanup metadata
- Keep until: 2026-03-02 13:38 local
- Cleanup candidate after: 2026-03-02 13:38 local
- Note: cleanup requires explicit user confirmation.
