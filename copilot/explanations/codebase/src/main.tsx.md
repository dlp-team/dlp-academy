# main.tsx

## [2026-04-12] OverlayScrollbars Stylesheet Bootstrap

### Change
- Added global import for OverlayScrollbars base stylesheet:
  - `overlayscrollbars/styles/overlayscrollbars.css`

### Impact
- Ensures app-level overlay scrollbar host in `src/App.tsx` has required structural styles.
- Keeps overlay scrollbar visuals deterministic across supported browsers.

## Purpose
- **Source file:** `src/main.tsx`
- **Last documented:** 2026-04-12
- **Role:** App entrypoint that boots React root and global base styles.
