# Home Unification and Institution Theming

## Problem statement
The Home feature set currently contains repeated logic and UI patterns across handlers, hooks, and component methods. This duplication increases maintenance cost and raises regression risk.

In parallel, the product needs institution-level visual customization (driven from `AdminInstitutionDashboard`), which requires centralized style primitives (colors, spacing, and layout-related tokens) rather than scattered hardcoded values.

## Scope
- Identify and centralize repeated Home behaviors (shared helper patterns, repeated branches, duplicated transforms).
- Define a reusable theming foundation to support institution-specific appearance.
- Prepare integration path so Home and dashboard surfaces can consume the same design tokens/config.
- Keep web-facing text in Spanish while keeping code/comments/reports in English.

## Non-goals
- Full visual redesign of the application.
- Migrating every feature/module in one pass.
- Changing existing user-facing Spanish copy to English.

## Current status summary
- Status: COMPLETED
- Next step: reviewer manual smoke execution for operational sign-off (artifacts prepared).

## Key decisions and assumptions
- Reports and planning artifacts are written in English.
- Client-side visible UI copy remains Spanish.
- Theming should be token-driven and backward-compatible.
- Refactors must follow lossless-change protocol with small, contained diffs.
