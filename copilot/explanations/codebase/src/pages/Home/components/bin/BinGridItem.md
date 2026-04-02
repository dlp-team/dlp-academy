<!-- copilot/explanations/codebase/src/pages/Home/components/bin/BinGridItem.md -->
# BinGridItem.jsx

## Overview
- **Source file:** `src/pages/Home/components/bin/BinGridItem.jsx`
- **Last documented:** 2026-04-02
- **Role:** Visual card renderer for selected bin entries in grid mode.

## Responsibilities
- Renders trashed subject cards with existing `SubjectCard` visual system.
- Renders trashed folder cards with a dedicated folder visual treatment.
- Shows urgency and deletion countdown metadata for both item types.

## Changelog
- **2026-04-02:** Generalized the component from subject-only rendering to typed rendering (`subject` / `folder`) so BinView can surface folder containers in the bin grid.
