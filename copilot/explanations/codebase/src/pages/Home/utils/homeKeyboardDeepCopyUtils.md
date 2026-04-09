<!-- copilot/explanations/codebase/src/pages/Home/utils/homeKeyboardDeepCopyUtils.md -->
# homeKeyboardDeepCopyUtils.ts

## Overview
- **Source file:** `src/pages/Home/utils/homeKeyboardDeepCopyUtils.ts`
- **Last documented:** 2026-04-09
- **Role:** Deep-copy helper for keyboard copy/paste flows in Home.

## Responsibilities
- Clone source subject topic trees into a newly copied subject.
- Clone topic-linked resources for copied topics across supported collections.
- Normalize copied entities to owner-safe, non-shared metadata defaults.

## Exports
- `cloneSubjectTopicsAndResources(...)`

## Main Dependencies
- `firebase/firestore`

## Notes
- Collection coverage for nested topic resources currently includes:
  - `documents`
  - `resumen`
  - `quizzes`
  - `exams`
  - `examns`
- Sharing fields are reset for copied topic and resource documents (`isShared`, `sharedWith`, `sharedWithUids`, `editorUids`, `viewerUids`).
