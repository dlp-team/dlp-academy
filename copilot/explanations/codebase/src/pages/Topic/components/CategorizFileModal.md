<!-- copilot/explanations/codebase/src/pages/Topic/components/CategorizFileModal.md -->
# CategorizFileModal.tsx

## Changelog
### 2026-04-07: Migrated to BaseModal
- Replaced in-file fixed overlay wrapper with shared [BaseModal](../../../../../../src/components/ui/BaseModal.tsx).
- Preserved previous behavior where backdrop clicks do not close the modal (`closeOnBackdropClick={false}`).
- Added tests in [tests/unit/pages/topic/CategorizFileModal.test.jsx](../../../../../../tests/unit/pages/topic/CategorizFileModal.test.jsx).

## Purpose
- Source file: [src/pages/Topic/components/CategorizFileModal.tsx](../../../../../../src/pages/Topic/components/CategorizFileModal.tsx)
- Role: Categorization modal for uploaded topic files.

## Key Behaviors
- Tracks selected category (`material-teorico`, `ejercicios`, `examenes`).
- Sends selected category through `onSubmit`.
- Keeps explicit close actions via header/cancel buttons.
