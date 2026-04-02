<!-- copilot/plans/active/shortcut-move-request-workflow-enablement/README.md -->
# Shortcut Move Request Workflow Enablement

## Problem Statement
Shared-folder drag and drop currently blocks shortcut moves with a confirmation modal, but no backend workflow exists to actually create owner approval requests, notify owners, or resolve them safely.

## Objective
Deliver an end-to-end move-request workflow so shortcut users can request source-item moves into shared folders, owners can approve/reject, and approved requests move the original source item (never the shortcut).

## Scope
- Backend callable for request creation.
- Request persistence fields:
  - `requesterUid`, `requesterEmail`, `shortcutId`, `shortcutType`, `targetId`, `targetFolderId`, `targetFolderOwnerUid`, `status`, `createdAt`.
- Owner notifications:
  - email queue entry,
  - in-app notification.
- Owner review UI with approve/reject actions.
- Backend callable for resolve flow:
  - `approve`: move source subject/folder into target shared folder,
  - `reject`: keep shortcut unchanged.
- Firestore rules for `shortcutMoveRequests` scoped to requester + owner + admins.
- Unit/rules coverage for core paths.

## Out of Scope
- New notification center redesign.
- Bulk request processing.
- Historical analytics dashboards for requests.

## Lifecycle Status
- Lifecycle: `inReview`
- Current phase: `Phase 04 - Final Validation and Closure (COMPLETED)`

## Success Criteria
- Shortcut move request created from Home modal without placeholder logs.
- Request visible to owner and requester via secure reads.
- Owner can approve/reject from UI.
- Approve moves source item into target shared folder; shortcut is not moved.
- Reject leaves source/shortcut state unchanged and notifies requester.
- Rules and tests validate least-privilege boundaries.

