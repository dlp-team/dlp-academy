<!-- copilot/explanations/codebase/src/components/modals/shared/ReferencePdfUploadField.md -->
# ReferencePdfUploadField.tsx

## Purpose
- Source file: [src/components/modals/shared/ReferencePdfUploadField.tsx](../../../../../../../src/components/modals/shared/ReferencePdfUploadField.tsx)
- Role: Shared PDF upload form field primitive for modal flows.

## What It Centralizes
- Label + optional hint rendering.
- Hidden PDF input wiring and change callback propagation.
- Empty state upload CTA block.
- Selected file badge and remove-action button.

## Key Props
- `uploadId`: input/label linkage id.
- `file`: selected file value.
- `onFileSelect`: callback invoked on file selection.
- `onRemoveFile`: callback for clearing selected file.
- `disabled`: disables input/remove actions.
- `label`, `labelHint`, `emptyTitle`, `emptyDescription`: display text configuration.

## Current Adopters
- [src/components/modals/CreateContentModal.tsx](../../../../../../../src/components/modals/CreateContentModal.tsx)
- [src/components/modals/QuizModal.tsx](../../../../../../../src/components/modals/QuizModal.tsx)

## Tests
- [tests/unit/components/ReferencePdfUploadField.test.jsx](../../../../../../../tests/unit/components/ReferencePdfUploadField.test.jsx)
