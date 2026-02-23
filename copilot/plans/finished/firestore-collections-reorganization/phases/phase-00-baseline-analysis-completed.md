# Phase 00 — Baseline & Dependency Audit
Status: COMPLETED

## Why this phase existed
Before changing core hierarchy behavior, we needed a complete map of data fetch/write paths and DnD entry points to avoid breaking existing features.

## What was done
- Inspected Home page composition, state hooks, and handler wrappers.
- Mapped folder/subject write paths in:
  - `useFolders`
  - `useSubjects`
  - `useHomeState`
  - `useHomePageHandlers`
  - `useHomeContentDnd`
  - `BreadcrumbNav`
- Identified root architectural mismatches:
  - mixed use of `folderId` vs `parentId` for folder ancestry
  - duplicate move execution under some DnD flows
  - insufficient breadcrumb drop validation for cyclic moves

## Outcome
- Established safe refactor sequence and boundaries.
- Enabled Phase 01 to implement targeted fixes without broad rewrites.

## Risks observed
- Legacy handlers still coexist with newer wrappers.
- Some old component paths may still contain casing and import inconsistencies unrelated to architecture work.
