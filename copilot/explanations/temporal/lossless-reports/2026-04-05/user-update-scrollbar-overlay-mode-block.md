<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/user-update-scrollbar-overlay-mode-block.md -->
# Lossless Report - User Update Scrollbar Overlay Mode Block

## 1. Requested Scope
- Implement user-requested right-edge scrollbar smoothing behavior.
- Prefer scrollbar-over-content mode where supported and preserve no-shift fallback behavior where unsupported.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to modal close contracts.
- No changes to customization preview runtime behavior in this block.
- No backend/function/rules changes.

## 3. Touched Files
- [src/components/ui/CustomScrollbar.tsx](src/components/ui/CustomScrollbar.tsx)
- [src/index.css](src/index.css)
- [tests/unit/components/CustomScrollbar.test.jsx](tests/unit/components/CustomScrollbar.test.jsx)

## 4. Per-File Verification
- `CustomScrollbar.tsx`
  - Added runtime capability detection via `CSS.supports`.
  - Applies `custom-scrollbar-overlay` when supported; otherwise `custom-scrollbar-stable`.
  - Cleans up mode and active classes on unmount.
- `index.css`
  - Introduced mode-specific scrollbar behavior classes.
  - Uses overlay-first mode class with stable fallback mode class.
  - Added explicit active-mode surface background values to keep right-edge scrollbar zone visually smooth.
- `CustomScrollbar.test.jsx`
  - Validates overlay and fallback branches and class cleanup lifecycle deterministically.

## 5. Risks and Checks
- Risk: overlay support detection may behave differently across environments.
  - Check: explicit fallback mode class ensures stable behavior when overlay is unsupported.
- Risk: global scrollbar style changes may affect unrelated pages.
  - Check: only `custom-scrollbar-active` contexts are changed and existing class toggle contract is preserved.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/components/CustomScrollbar.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` on touched files -> No errors found.
