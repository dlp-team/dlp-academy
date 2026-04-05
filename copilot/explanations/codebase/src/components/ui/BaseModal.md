# BaseModal.tsx

## Changelog
- **2026-04-05:** Added shared modal shell component to centralize backdrop click handling, positioning wrappers, and dialog container behavior for progressive modal unification.
- **2026-04-05 (Block B):** Added close-guard hooks (`onBeforeClose`, `onBlockedCloseAttempt`) for dirty-state interception flows and `rootStyle` support for top-offset constrained overlays.

## Purpose
- **Source file:** `src/components/ui/BaseModal.tsx`
- **Last documented:** 2026-04-05
- **Role:** Shared modal primitive that standardizes overlay/backdrop + dialog structure while allowing per-surface style and behavior overrides.

## Responsibilities
- Render nothing when `isOpen` is false.
- Render a fixed modal root, configurable backdrop, configurable content wrapper, and dialog container.
- Handle optional backdrop-close behavior via `closeOnBackdropClick`.
- Support interception of close requests through `onBeforeClose` and blocked-close callbacks.
- Stop click propagation from dialog content to preserve outside-click semantics.
- Expose optional test IDs for deterministic unit assertions.

## Main Props
- `isOpen`: Enables/disables rendering.
- `onClose`: Called when backdrop click closes the modal.
- `onBeforeClose`: Receives close reason and can block closure.
- `onBlockedCloseAttempt`: Invoked when a close attempt is blocked by `onBeforeClose`.
- `children`: Modal body content.
- `rootClassName`, `backdropClassName`, `contentWrapperClassName`, `contentClassName`: Style/layout customization hooks.
- `rootStyle`: Inline root style overrides (used for top-offset modal shells).
- `contentWrapperStyle`, `contentStyle`: Inline style hooks for positioning/size constraints.
- `closeOnBackdropClick`: Toggle outside-click closing.
- `stopContentClickPropagation`: Toggle propagation guard on content clicks.

## Current Adopters
- `src/components/modals/DeleteModal.tsx`
- `src/components/modals/FolderDeleteModal.tsx`
- `src/components/modals/SudoModal.tsx`
- `src/pages/Home/components/FolderManager.tsx`
- `src/pages/Home/components/HomeDeleteConfirmModal.tsx`
- `src/pages/Subject/modals/SubjectFormModal.tsx`

## Maintenance Notes
- Keep this contract stable while migrating additional modal surfaces.
- Prefer extending via optional props instead of duplicating modal shells in feature components.
