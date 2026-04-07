<!-- copilot/explanations/codebase/tests/unit/pages/home/BinView.listInlinePanel.test.md -->
# BinView.listInlinePanel.test.jsx

## Overview
- **Source file:** `tests/unit/pages/home/BinView.listInlinePanel.test.jsx`
- **Last documented:** 2026-04-05
- **Role:** Regression coverage for Bin list-mode selected-item inline action panel behavior.

## Coverage
- Selected list item shows an inline action panel directly under that item.
- Inline panel moves to the next selected item and clears from previous selection.
- Inline panel stays hidden while bulk selection mode is active.
- Folder entries expose folder-specific inline action (`Abrir contenido de carpeta`).
- Shortcut entries expose shortcut-specific restore label (`Restaurar acceso directo`) without folder-only actions.

## Changelog
### 2026-04-07
- Added reveal-style assertion (`zoom-in-95`) to verify list inline panel animation parity with grid-focused interaction language.

### 2026-04-05
- Added focused list-mode parity tests for Phase 02 Block B.

### 2026-04-05 (Block C)
- Expanded the suite with folder and shortcut entry-type assertions for inline-panel action correctness.
