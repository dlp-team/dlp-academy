<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomeCreationGuards.md -->

# useHomeCreationGuards.ts

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeCreationGuards.ts`
- **Last documented:** 2026-04-01
- **Role:** Encapsulates Home creation permissions and effective-content derivations used by coordinator rendering.

## Responsibilities
- Computes subject-creation permission in current manual context.
- Computes folder-creation permission in current manual context.
- Computes effective content presence for student vs non-student flows.
- Keeps permission/content derivation logic out of `Home.tsx` rendering.

## Exports
- `const useHomeCreationGuards`

## Main Dependencies
- `react`
- `../../../utils/permissionUtils`
