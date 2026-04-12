<!-- copilot/REFERENCE/COMPONENT_REGISTRY.md -->
# UI Component Registry

CRITICAL COPILOT DIRECTIVE: before creating any new UI element (modal, overlay, button, dropdown, card, form), check this registry first. If a base component exists, use or extend it. If you create a new reusable component, document it here immediately.

## Registry Rules
1. Centralization first: check this file before writing new UI code.
2. Reuse over rebuild: do not duplicate modal/menu wrappers that already exist.
3. Active vs planned status is strict:
   - Active: safe to import and use now.
   - Planned: do not import yet; implement first.
4. Keep props and usage examples aligned with real code.
5. All visible UI text must be in Spanish.
6. Use icons, never emojis.

## Overlays and Modals

### BaseModal
- File: src/components/ui/BaseModal.tsx
- Status: Active
- Purpose: low-level modal primitive (backdrop, content wrapper, close guard hooks).
- Current adopters:
  - src/components/modals/DeleteModal.tsx
  - src/components/modals/FolderDeleteModal.tsx
  - src/components/modals/SudoModal.tsx
  - src/pages/Topic/components/CategorizFileModal.tsx
  - src/pages/Profile/modals/EditProfileModal.tsx
  - src/pages/Home/components/FolderManager.tsx
  - src/pages/Subject/modals/SubjectFormModal.tsx

### DashboardOverlayShell
- File: src/components/ui/DashboardOverlayShell.tsx
- Status: Active
- Purpose: higher-level dashboard overlay shell on top of BaseModal with width presets and unsaved-changes guard.
- Current adopters:
  - src/pages/Home/modals/SubjectModal.tsx
  - src/pages/Home/modals/EditSubjectModal.tsx
  - src/pages/InstitutionAdminDashboard/components/AddTeacherModal.tsx
  - src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx
  - src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx
  - src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx

### AIGenerationModalShell
- File: src/components/modals/shared/AIGenerationModalShell.tsx
- Status: Active
- Purpose: shared animated shell for AI generation modals with standardized wrapper/backdrop/container transitions.
- Current adopters:
  - src/components/modals/CreateContentModal.tsx
  - src/components/modals/QuizModal.tsx

### BaseOverlay
- File: planned (not implemented)
- Status: Planned
- Purpose: optional future unified API alias for modal wrappers.
- Note: do not import until implementation exists.

## Menus and Action Overlays

### shortcutMenuConfig
- File: src/components/modules/shared/shortcutMenuConfig.ts
- Status: Active
- Purpose: shared width constants for card/list shortcut menus.

### menuPositionUtils
- File: src/components/modules/shared/menuPositionUtils.ts
- Status: Active
- Purpose: shared menu positioning logic for list/card context menus.
- Current adopters:
  - src/components/modules/ListItems/SubjectListItem.tsx
  - src/components/modules/ListItems/FolderListItem.tsx
  - src/components/modules/SubjectCard/SubjectCardFront.tsx
  - src/components/modules/FolderCard/FolderCardBody.tsx

### ContextActionMenuPortal
- File: src/components/modules/shared/ContextActionMenuPortal.tsx
- Status: Active
- Purpose: shared portal shell for three-dots/context menus with optional close layer.
- Current adopters:
  - src/components/modules/ListItems/SubjectListItem.tsx
  - src/components/modules/ListItems/FolderListItem.tsx
  - src/components/modules/SubjectCard/SubjectCardFront.tsx
  - src/components/modules/FolderCard/FolderCardBody.tsx

### UndoActionToast
- File: src/components/ui/UndoActionToast.tsx
- Status: Active
- Purpose: shared floating undo notification with action and close controls for reversible operations.
- Current adopters:
  - src/pages/Home/Home.tsx

### NotificationToast
- File: src/components/ui/NotificationToast.tsx
- Status: Active
- Purpose: shared floating toast shell with unified light/dark styles, bottom positioning, icon slot, and optional action area.
- Current adopters:
  - src/components/ui/AppToast.tsx
  - src/components/ui/UndoActionToast.tsx
  - src/pages/Home/components/HomeShortcutFeedback.tsx

### NotificationItemCard
- File: src/components/ui/NotificationItemCard.tsx
- Status: Active
- Purpose: shared notification row/card renderer for panel and full-history views, including shortcut move request actions and actor avatar metadata.
- Current adopters:
  - src/components/ui/NotificationsPanel.tsx
  - src/pages/Notifications/Notifications.tsx

### CommunicationItemCard
- File: src/components/ui/CommunicationItemCard.tsx
- Status: Active
- Purpose: unified list-card primitive used by both notifications and direct-message conversation previews (icon, actor metadata, unread marker, actions).
- Current adopters:
  - src/components/ui/NotificationItemCard.tsx
  - src/pages/Messages/Messages.tsx

## Buttons and Inputs

No generic button primitives are active yet in src/components/ui.

### ReferencePdfUploadField
- File: src/components/modals/shared/ReferencePdfUploadField.tsx
- Status: Active
- Purpose: shared PDF upload form field with empty/selected states and remove action.
- Current adopters:
  - src/components/modals/CreateContentModal.tsx
  - src/components/modals/QuizModal.tsx

### ModalGradientSubmitButton
- File: src/components/modals/shared/ModalGradientSubmitButton.tsx
- Status: Active
- Purpose: shared gradient submit CTA for AI modal footer forms, including loading state handling.
- Current adopters:
  - src/components/modals/CreateContentModal.tsx
  - src/components/modals/QuizModal.tsx

### Planned primitives
- PrimaryButton (planned)
- SecondaryButton (planned)
- DangerButton (planned)
- FormField (planned)

Rule: do not assume these exist. Create and register only when implemented.

## Priority Migration Queue
1. Modal wrapper migration to BaseModal or DashboardOverlayShell:
  - Completed for priority targets (2026-04-07)
2. Three-dots menu portal extraction:
  - Completed for list/card modules (2026-04-07)
3. Broad button/form primitive extraction after modal/menu waves stabilize.
  - Completed for AI modal cluster (2026-04-07):
    - ReferencePdfUploadField
    - ModalGradientSubmitButton

## Adding New Components
When creating a reusable component:
1. Place it in the correct shared location (usually src/components/ui or src/components/modules/shared).
2. Add deterministic tests under tests/unit.
3. Register it here with status, purpose, props, and adopters.
4. Update related instruction files if adoption must be mandatory.

## Quick Lookup
| Feature | Use this now | Status |
|---|---|---|
| Generic modal primitive | BaseModal | Active |
| Dashboard modal shell | DashboardOverlayShell | Active |
| AI generation modal shell | AIGenerationModalShell | Active |
| Shared PDF upload field | ReferencePdfUploadField | Active |
| Shared gradient submit CTA | ModalGradientSubmitButton | Active |
| Menu positioning | menuPositionUtils | Active |
| Unified three-dots portal shell | ContextActionMenuPortal | Active |
| Generic primary/secondary/danger buttons | Not implemented yet | Planned |

## Registry Maintenance
- Last Updated: 2026-04-12
- Maintainer: GitHub Copilot
- Review Trigger: after every UI centralization wave

