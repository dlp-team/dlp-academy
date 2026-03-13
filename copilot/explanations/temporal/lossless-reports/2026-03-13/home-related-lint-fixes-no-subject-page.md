# Lossless Change Report - Home Related Lint Fixes (Subject page untouched)

## Requested Scope
- Fix lint errors on Home page and related modules.
- Do not change `src/pages/Subject/Subject.jsx`.

## Files Touched
- src/App.jsx
- src/components/modules/SubjectCard/useSubjectCardLogic.js
- src/components/ui/CardScaleSlider.jsx
- src/components/ui/TagFilter.jsx
- src/components/ui/ViewLayoutSelector.jsx
- src/pages/Home/components/BinView.jsx
- src/pages/Home/components/bin/BinSelectionPanel.jsx
- src/pages/Home/hooks/useHomeKeyboardShortcuts.js

## What Was Fixed
- App runtime parse fix: closed missing root fragment in App component.
- Home BinView hook-order fix: removed conditional hook execution path by moving student guard after hooks and memoizing loader callback.
- Removed unused imports/args/props causing lint failures.
- Reworked overlay position updates in TagFilter and CardScaleSlider to avoid synchronous setState-in-effect and ref-access-during-render lint rules.
- Updated keyboard shortcut hook dependencies and cut-pending visual derivation to satisfy memoization and effect lint rules.

## Preservation Checks
- Subject page source file remained untouched.
- Home behavior and permissions remain intact (student bin denial kept).
- No route or API contract changes.

## Validation
- `npx eslint` run for Home-related scope completed with `EXIT_CODE=0`.
- `npm run build` passes.

## Notes
- Project-wide lint still contains unrelated issues outside requested scope.
