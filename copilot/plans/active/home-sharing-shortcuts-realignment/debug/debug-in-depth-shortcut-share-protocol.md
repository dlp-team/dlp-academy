# Debug-in-Depth Protocol: Shortcut Creation Failure During Sharing

## Context
- Date: 2026-02-24
- Error: "No se pudo crear el acceso directo. Se revirtió el compartido"
- Location: Subject/Folder sharing flow (shortcut creation step)
- Workspace: dlp-academy/web/dlp-academy

## Protocol Steps

### 1. Capture Full Error Context
- Log the following for every shortcut creation failure:
  - User UID and email
  - Target (subject/folder) ID and type
  - Recipient UID and email
  - Current institutionId
  - Firestore error message and code
  - Whether sharedWith/sharedWithUids were updated before failure
  - Any relevant Firestore rule evaluation (if available)

### 2. Instrument Share Flow
- Add debug logs before and after each of these steps:
  - Start of share handler
  - Shortcut creation attempt (with payload)
  - Shortcut creation result (success/failure)
  - Share fields update (with payload)
  - Rollback attempt (if triggered)
  - Final outcome (success, rollback, or error)

### 3. Remove Noisy Permission Logs
- Remove or silence all non-critical permission logs (e.g., canEdit, canView, fallback checks) from utils/permissionUtils.js and related files.
- Only log permission errors if they block a user action or are directly related to the current debug session.

### 4. Collect and Store Logs
- Store all debug logs in:
  - copilot/plans/active/home-sharing-shortcuts-realignment/debug/shortcut-share-debug-2026-02-24.log
- Include timestamps and operation context for each log entry.

### 5. Analyze and Summarize
- After running the protocol, review the log file for:
  - Firestore rule denials (look for PERMISSION_DENIED)
  - Payload mismatches (missing/incorrect fields)
  - User/institution mismatches
  - Any unexpected state transitions
- Summarize findings and next steps in a markdown file in the same debug folder.

---

## Checklist
- [ ] Add debug logs to share/shortcut creation flows
- [ ] Remove/silence noisy permission logs
- [ ] Capture and store logs in debug folder
- [ ] Analyze logs and summarize findings

---

## Notes
- This protocol is designed to isolate and diagnose shortcut creation failures during sharing, especially those related to Firestore rules or atomicity bugs.
- Update the protocol as new findings emerge.
