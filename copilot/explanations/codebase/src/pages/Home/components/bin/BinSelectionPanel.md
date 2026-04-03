<!-- copilot/explanations/codebase/src/pages/Home/components/bin/BinSelectionPanel.md -->
# BinSelectionPanel.tsx

## Overview
- **Source file:** `src/pages/Home/components/bin/BinSelectionPanel.tsx`
- **Last documented:** 2026-04-02
- **Role:** Action panel for a selected bin item in overlay/list contexts.

## Responsibilities
- Displays selected item identity and urgency state.
- Exposes restore and permanent-delete actions.
- Conditionally exposes content preview only for subject items.
- Adapts action labels for folder subtree operations.

## Changelog
- **2026-04-03:** Added shortcut-aware restore labeling so `shortcut-subject` and `shortcut-folder` use “Restaurar acceso directo” while preserving subject/folder actions.
- **2026-04-02:** Migrated from subject-only props to typed item props (`item`, `itemType`) to support folder restore/delete flows without duplicating panel logic.
- **2026-04-02:** Added folder-specific "Abrir contenido de carpeta" action path when a folder entry is selected in the bin.
