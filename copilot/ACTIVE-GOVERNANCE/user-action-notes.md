<!-- copilot/user-action-notes.md -->
# Copilot User Action Notes

## Purpose
Track manual actions that must be completed by the user outside automated code edits.

## Usage Rules
- Add a new entry in `OPEN` status when a task requires manual setup (for example `.env` values, external account creation, console settings, or third-party credentials).
- Include the exact action, why it is needed, and impact if skipped.
- Never write real secrets in this file. Use placeholders only.
- Move an item from `OPEN` to `RESOLVED` only after user confirmation.

## OPEN
- Date: 2026-04-13
- Related Task/Plan: direct-messages-hardening-and-backfill
- Status: OPEN
- Required Action:
  - Deploy updated Cloud Functions so `onDirectMessageCreated` starts generating `direct_message` notifications server-side.
  - Deploy updated Firestore rules and indexes (`firestore.rules`, `firestore.indexes.json`) including the `topicReadableByRef` helper and direct-message composite tie-break updates.
  - Deploy updated Storage rules (`storage.rules`) so direct-message attachments can be uploaded/read under conversation paths.
  - Run `scripts/migrate-direct-messages-legacy-fields.cjs` first with `DRY_RUN=true`, then with `DRY_RUN=false` after review.
  - Verify Firebase Analytics web-app configuration if production still reports `analytics/config-fetch-failed` (App not found / measurement mismatch).
- Why Needed:
  - Without function deployment, new direct messages will no longer generate recipient notifications from client writes.
  - Without rules/index deployment, direct-message security hardening and optimized queries will not be fully active.
  - Without Storage rules deployment, users will not be able to upload/read direct-message file attachments.
  - Without migration, legacy message docs may miss `participants` / `conversationKey`, reducing query quality and historical coverage.
  - Without analytics config verification, production analytics may keep falling back to local measurement ID and emit warning logs.
- Safe Placeholder Example (if applicable):
  - `FIREBASE_SERVICE_ACCOUNT_PATH=<absolute-path-to-service-account-json>`

## RESOLVED
- Date: 2026-04-08
- Related Task/Plan: copilot/plans/finished/autopilot-plan-execution-2026-04-08
- Status: RESOLVED
- Required Action:
  - Merge the feature branch into `development` and advance lifecycle tracking.
- Why Needed:
  - Checklist Step 21-22 required merge completion and pending-delete status transition.
- Confirmation:
  - Completed in-session after user-approved continuation; branch was fast-forward merged into `development`.
- Date: 2026-04-06
- Related Task/Plan: copilot/plans/finished/copilot-vscode-efficiency-rollout-2026-04-06
- Status: RESOLVED
- Required Action:
  - Copy `.env.example` to `.env` at repo root.
  - Set `COPILOT_PC_ID` with your machine identity (example: `you`, `fellow`, `pc1`).
  - Keep `.env` local and never commit it.
- Why Needed:
  - Multi-agent branch ownership, branch claiming, and shared-session coordination depend on a unique local `COPILOT_PC_ID`.
  - If skipped, Copilot branch coordination can become ambiguous.
- Confirmation:
  - User confirmed completion during leverage-step validation.
- Safe Placeholder Example (if applicable):
  - `COPILOT_PC_ID=<set-by-user>`

## Entry Template
- Date: YYYY-MM-DD
- Related Task/Plan: <path or identifier>
- Status: OPEN | RESOLVED
- Required Action:
  - <exact user steps>
- Why Needed:
  - <reason and impact>
- Safe Placeholder Example (if applicable):
  - `E2E_TEST_USER_EMAIL=<set-by-user>`
  - `E2E_TEST_USER_PASSWORD=<set-by-user>`

