# Subject DnD Reorganization Fix

## Problem Statement
Subject drag-and-drop into folders is broken after the recent reorganization. Folders can be moved, but subjects do not move when dropped onto a folder.

## Scope / Non-goals
- Scope: Restore subject drag-and-drop into folders in Home tree/list/breadcrumb flows.
- Scope: Restore lost shared-folder behaviors for subject moves (correct confirmation prompts and no duplicate placement).
- Non-goals: Unrelated UI refactors.

## Current Status
- Root cause identified: permission check used undefined user, blocking subject moves.
- Patch applied: userId now passed explicitly to handlers.
- Performance fix applied: subject list-mode moves are now optimistic and immediate.
- Shared-move fix applied: confirmation logic now uses source-folder vs target-folder sharing delta.
- Data consistency fix applied: subject move removes stale memberships from non-target folders to prevent duplicates.

## Key Decisions and Assumptions
- Subject DnD includes breadcrumb-driven moves and shared-folder transitions.
- Protocol-compliant plan structure will be used.
