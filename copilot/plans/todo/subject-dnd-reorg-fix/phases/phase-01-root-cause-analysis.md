# Phase 01: Root Cause Analysis

## Objective
Identify why subject drag-and-drop into folders is broken after the reorganization.

## Changes
- Traced drag payload and drop handler for subjects and folders.
- Compared permission checks and data flow.

## Risks
- None (read-only investigation).

## Completion Notes
- Permission check used undefined user, causing silent failure for subject moves.
- Ready to patch.
