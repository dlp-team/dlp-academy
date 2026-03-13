# Lossless Change Report: Home Page Custom Scrollbar

**Date:** 2026-03-13

## Requested Scope
- Change the scrollbars so they are internal to the web (not external/system default)
- Give the scrollbar a simple, elegant style with low opacity, increasing on hover/active
- Apply the new scrollbar only to the Home page
- All visible text remains in Spanish

## Preserved Behaviors
- All Home page functionality, layout, and theming
- No changes to logic, only visual scrollbar style
- No impact on other pages/components

## Files Touched
- src/index.css

## Per-File Verification
### src/index.css
- Appended a new CSS block for `.home-page` and descendants
- Uses `scrollbar-width: thin` and custom `scrollbar-color` for Firefox
- Uses `::-webkit-scrollbar` selectors for Chrome/Edge/Safari
- Thumb is low opacity, increases on hover/active
- Track and thumb colors adapt to dark mode
- No errors after change

## Validation Summary
- No lint or syntax errors in CSS
- Scrollbar is now styled and internal to the Home page only
- Hover/active states work as intended
- No regression in layout or scroll functionality

## Next Steps
- User should visually verify the Home page scrollbar in both light and dark mode
- No further action required unless additional customization is requested
