<!-- copilot/explanations/codebase/src/components/modals/shared/AIGenerationModalShell.md -->
# AIGenerationModalShell.tsx

## Purpose
- Source file: [src/components/modals/shared/AIGenerationModalShell.tsx](../../../../../../../src/components/modals/shared/AIGenerationModalShell.tsx)
- Role: Shared animated overlay shell for AI generation modals.

## What It Centralizes
- Fixed fullscreen root wrapper with mobile/desktop alignment.
- Backdrop transition and close callback wiring.
- Shared modal container transitions and max-width wiring.
- Baseline dialog semantics (`role="dialog"`, `aria-modal`).

## Key Props
- `shouldRender`: determines mount/unmount behavior.
- `isVisible`: toggles enter/exit transition classes.
- `onRequestClose`: invoked from backdrop click.
- `maxWidthClassName`: width preset override.
- `rootClassName`, `backdropClassName`, `dialogClassName`: optional class extensions.

## Current Adopters
- [src/components/modals/CreateContentModal.tsx](../../../../../../../src/components/modals/CreateContentModal.tsx)
- [src/components/modals/QuizModal.tsx](../../../../../../../src/components/modals/QuizModal.tsx)

## Tests
- [tests/unit/components/AIGenerationModalShell.test.jsx](../../../../../../../tests/unit/components/AIGenerationModalShell.test.jsx)
