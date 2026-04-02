<!-- copilot/plans/inReview/shortcut-move-request-workflow-enablement/phases/phase-02-owner-review-and-resolution.md -->
# Phase 02 - Owner Review and Resolution

## Status
- COMPLETED

## Objective
Enable owners to approve/reject move requests and resolve source-item movement safely.

## Deliverables
- `functions/index.js`: `resolveShortcutMoveRequest` callable.
- UI review actions exposed in notifications panel for owners.
- Approve flow moves source subject/folder to `targetFolderId` and marks request resolved.
- Reject flow marks request rejected and notifies requester.

## Validation Gate
- Only target-folder owner/admin can resolve.
- Approve never moves shortcut docs.
- Request status transitions are immutable after resolution.

