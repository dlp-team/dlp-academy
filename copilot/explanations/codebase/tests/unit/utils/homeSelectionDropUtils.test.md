// copilot/explanations/codebase/tests/unit/utils/homeSelectionDropUtils.test.md

## Changelog
### 2026-04-09: New utility test coverage for grouped drop routing
- Added deterministic unit tests for selection-key extraction from drop args and native drop events.
- Added guard-behavior tests for grouped selection routing (`shouldHandleSelectionDrop`).

## Overview
Tests for Home grouped-drop utility helpers used by selection-aware drag/drop wrappers.

## Coverage Highlights
- Subject/folder selection key generation (shortcut-first fallback behavior).
- Null-safe handling when drop payload data is incomplete.
- Positive/negative grouped-drop guard outcomes based on `selectMode` and selected key membership.
