<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomeControlTags.md -->

# useHomeControlTags.ts

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeControlTags.ts`
- **Last documented:** 2026-04-01
- **Role:** Centralizes control-tag aggregation and selected-tag pruning logic for Home shared/manual views.

## Responsibilities
- Computes available control tags from current mode data sources.
- Applies student-mode folder scoping to tag aggregation.
- Synchronizes selected tags by pruning invalid tags in both shared and manual modes.
- Keeps tag derivation rules outside `Home.tsx` rendering orchestration.

## Exports
- `const useHomeControlTags`

## Main Dependencies
- `react`
