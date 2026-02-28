## [2026-02-26] Feature Update: Collapsible Modern Fill Palette
### Context & Architecture
`StyleSelector` is the presentation control used by `SubjectFormModal` general tab to drive card style state and modern fill configuration.

### Previous State
- Modern fill options were always expanded once `cardStyle === 'modern'`.

### New State & Logic
- Added an explicit expand/collapse trigger for modern fill color options.
- Preserved existing style selection behavior and value writes to `formData.modernFillColor`.
- Added selected-fill text feedback when the palette is collapsed.

---

# StyleSelector.jsx

## Overview
- **Source file:** `src/pages/Subject/modals/subject-form/StyleSelector.jsx`
- **Last documented:** 2026-02-24
- **Role:** Modal/dialog UI used for create, edit, confirm, or detail flows.

## Responsibilities
- Handles user events and triggers updates/actions.

## Exports
- `default StyleSelector`

## Main Dependencies
- `react`
- `../../../../utils/subjectConstants`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
