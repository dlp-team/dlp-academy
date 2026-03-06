# binViewUtils.js

## Overview
- **Source file:** `src/pages/Home/components/binViewUtils.js`
- **Last documented:** 2026-03-06
- **Role:** Pure helper functions for trash expiration and urgency presentation.

## Responsibilities
- Convert Firestore timestamp-like values into `Date` safely.
- Compute remaining milliseconds and days before auto-delete.
- Provide urgency class mapping by days remaining.

## Exports
- `DAYS_UNTIL_AUTO_DELETE`
- `DAY_MS`
- `toJsDate`
- `getRemainingMs`
- `getDaysRemaining`
- `getDaysRemainingTextClass`

## Notes
- Kept independent from React to maximize testability in unit tests.
