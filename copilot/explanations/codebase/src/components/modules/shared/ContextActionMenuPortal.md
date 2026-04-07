<!-- copilot/explanations/codebase/src/components/modules/shared/ContextActionMenuPortal.md -->
# ContextActionMenuPortal.tsx

## Purpose
- Source file: [src/components/modules/shared/ContextActionMenuPortal.tsx](../../../../../../../src/components/modules/shared/ContextActionMenuPortal.tsx)
- Role: Shared portal shell for three-dots/context menus, with optional close layer.

## What It Centralizes
- Portal mount target resolution (`document.body` fallback).
- Optional close-layer rendering and close callback wiring.
- Shared menu container wrapper and click propagation handling.

## Key Props
- `isOpen`: toggles rendering.
- `menuClassName` / `menuStyle`: visual shell and positioning.
- `showCloseLayer`: enables dismiss layer.
- `closeLayerTop`: supports header-safe top offset behavior.
- `onRequestClose`: callback when close layer is clicked.
- `portalTarget`: optional custom target.

## Current Adopters
- [src/components/modules/ListItems/SubjectListItem.tsx](../../../../../../../src/components/modules/ListItems/SubjectListItem.tsx)
- [src/components/modules/ListItems/FolderListItem.tsx](../../../../../../../src/components/modules/ListItems/FolderListItem.tsx)
- [src/components/modules/SubjectCard/SubjectCardFront.tsx](../../../../../../../src/components/modules/SubjectCard/SubjectCardFront.tsx)
- [src/components/modules/FolderCard/FolderCardBody.tsx](../../../../../../../src/components/modules/FolderCard/FolderCardBody.tsx)

## Tests
- [tests/unit/components/ContextActionMenuPortal.test.jsx](../../../../../../../tests/unit/components/ContextActionMenuPortal.test.jsx)
