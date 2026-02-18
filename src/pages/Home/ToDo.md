# Home Feature Modularization ToDo

## Should Home Be More Divided?

### Current State
- `Home.jsx` has been modularized into:
  - `useHomePageState.js` (state/effects)
  - `useHomePageHandlers.js` (handlers)
  - `HomeShareConfirmModals.jsx` (share/unshare overlays)
- Additional lossless splits completed:
  - `useHomeContentDnd.js` (HomeContent DnD state/handlers)
  - `useHomeControlsHandlers.js` (HomeControls UI handlers)
  - `HomeDeleteConfirmModal.jsx` (delete confirmation modal extraction)

### Recommendations for Further Division
- **Status**: Core lossless split opportunities identified in this pass were implemented.
- **Future optional work**: Additional micro-splits can be done only if desired for readability, but no required functional split remains from this checklist.

### ToDo List
1. [x] Review `HomeContent.jsx` for logic/UI split opportunity.
2. [x] Review `HomeControls.jsx` for logic/UI split opportunity.
3. [x] Audit `HomeModals.jsx` and extract individual modals/hooks as needed.
4. [x] Review all Home components for further modularization (logic vs UI).
5. [x] Ensure all hooks are single-responsibility and colocated with their feature.
6. [x] Document all changes and update README.

### Completed in this pass (2026-02-18)
- Extracted HomeContent drag/drop behavior into `hooks/useHomeContentDnd.js` and wired `components/HomeContent.jsx` to it.
- Extracted HomeControls behavioral handlers into `hooks/useHomeControlsHandlers.js` and wired `components/HomeControls.jsx` to it.
- Extracted delete confirmation overlay from `components/HomeModals.jsx` into `components/HomeDeleteConfirmModal.jsx`.
- Updated Home module docs (`README.md`) to reflect these splits.

---
This file tracks modularization opportunities and tasks for the Home feature. Update as progress is made.
