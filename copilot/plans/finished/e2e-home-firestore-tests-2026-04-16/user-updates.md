<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/user-updates.md -->
# User Updates — E2E Home Firestore Tests Plan

## How to Use
Add any changes, corrections, or new requirements under **Pending User Updates**.  
Copilot will process them before starting each implementation block.

---

## Pending User Updates

*(Add new items here. Copilot will check before each implementation phase.)*

---

## Processed Updates

*(Copilot moves handled items here with date and integration notes.)*

---

## Environment Variable Checklist

Please confirm the following `.env` variables are set and point to valid test accounts:

| Variable | Purpose | Status |
|----------|---------|--------|
| `E2E_EMAIL` | Primary test user email | ❓ Confirm |
| `E2E_PASSWORD` | Primary test user password | ❓ Confirm |
| `E2E_OWNER_EMAIL` | Content owner account | ❓ Confirm |
| `E2E_OWNER_PASSWORD` | Content owner password | ❓ Confirm |
| `E2E_EDITOR_EMAIL` | Editor role account | ❓ Confirm |
| `E2E_EDITOR_PASSWORD` | Editor role password | ❓ Confirm |
| `E2E_VIEWER_EMAIL` | Viewer role account | ❓ Confirm |
| `E2E_VIEWER_PASSWORD` | Viewer role password | ❓ Confirm |
| `E2E_RUN_MUTATIONS` | Set to `true` to run mutating tests | ❓ Confirm |
| `E2E_INSTITUTION_ID` | Institution context for multi-tenant | ❓ Confirm |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK service account JSON | ❓ Confirm |

### Notes on Test Accounts
- **Owner account** should be able to create/delete subjects and folders
- **Editor account** should be a user the owner can share content with as editor
- **Viewer account** should be a user the owner can share content with as viewer
- All accounts should belong to the same `E2E_INSTITUTION_ID` for multi-tenant test isolation
- If any new accounts need to be created, please add them to `.env` and confirm here
