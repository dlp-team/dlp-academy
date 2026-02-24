# Phase 00 — Baseline Regression Mapping

## Goal
Identify precisely where colleague changes diverged from intended shortcut-first non-owner behavior.

## Scope
- Trace manual tab data pipeline in Home hooks.
- Inventory where non-owned source items are still entering render pipeline.
- Confirm share path for subject/folder and where shortcut creation can be skipped.

## Output
- File/symbol map of offending code paths.
- Regression matrix (expected vs current).
- Change list for implementation phase.

## Exit Criteria
- All visibility and share regressions reproducible and mapped to concrete hook/handler logic.

## Execution Summary (2026-02-24)

### Mapped Regression Paths
- Shared source folders are ingested into Home state from `useFolders` via `isShared/sharedWith` query path.
- Manual tab rendering path was allowing raw source folders to leak into display when non-owner user matched sharing criteria.
- Legacy `folderIds`/`subjectIds` fields were confirmed not to be the visibility trigger.

### Root Cause
- Visibility leak was caused by manual rendering pipeline using shared source entities directly, instead of enforcing shortcut-first non-owner contract.

### Implemented Remediation Input for Phase 02
- Enforced owner-source-only filtering in merged folder/subject shortcut pipelines.
- Switched displayed folder source toward normalized filtered set (`logic.filteredFolders`) rather than raw `logic.folders` where applicable.

## Status
- Phase state: **COMPLETED**
