<!-- copilot/explanations/codebase/src/components/modals/shared/ModalGradientSubmitButton.md -->
# ModalGradientSubmitButton.tsx

## Purpose
- Source file: [src/components/modals/shared/ModalGradientSubmitButton.tsx](../../../../../../../src/components/modals/shared/ModalGradientSubmitButton.tsx)
- Role: Shared gradient submit CTA primitive for modal footer forms.

## What It Centralizes
- Shared gradient submit button styling used by AI modal flows.
- Inline loading state with spinner and loading label.
- Consistent disabled behavior for explicit disabled or loading states.

## Key Props
- `form`: target form id.
- `gradientClass`: gradient token classes.
- `label`: default button text.
- `icon`: optional icon node for normal state.
- `disabled`: explicit disabled state.
- `isLoading`: enables loading state and enforces disabled behavior.
- `loadingLabel`: loading text override.
- `className`: optional style extension.

## Current Adopters
- [src/components/modals/CreateContentModal.tsx](../../../../../../../src/components/modals/CreateContentModal.tsx)
- [src/components/modals/QuizModal.tsx](../../../../../../../src/components/modals/QuizModal.tsx)

## Tests
- [tests/unit/components/ModalGradientSubmitButton.test.jsx](../../../../../../../tests/unit/components/ModalGradientSubmitButton.test.jsx)
