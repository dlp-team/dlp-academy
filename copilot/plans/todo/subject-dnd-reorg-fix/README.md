# Subject DnD Reorganization Fix

## Problem Statement
Subject drag-and-drop into folders is broken after the recent reorganization. Folders can be moved, but subjects do not move when dropped onto a folder.

## Scope / Non-goals
- Scope: Restore subject drag-and-drop into folders in Home tree/list views.
- Non-goals: Shared/shortcut DnD, unrelated UI refactors.

## Current Status
- Root cause identified: permission check used undefined user, blocking subject moves.
- Patch applied: userId now passed explicitly to handlers.

## Key Decisions and Assumptions
- Only subject DnD is in scope for this plan.
- Protocol-compliant plan structure will be used.
