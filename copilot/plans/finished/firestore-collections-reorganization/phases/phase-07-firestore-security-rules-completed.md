# Phase 07: Firestore Security Rules (Planned)

## Goal

Finalize least-privilege Firestore rules that still support share-driven shortcut lifecycle.

## Planned Work

- Rewrite `firestore.rules` to align with new permission model (`editorUids`, `viewerUids`, shortcuts lifecycle).
- Preserve ability to create recipient shortcuts during owner share flow.
- Permit shortcut read patterns required by dedupe/existence checks during sharing.
- Keep shortcut update/delete restricted to shortcut owner.
- Enforce tenant-aware constraints with `institutionId` on reads/writes.
- Provide safe transition guards during migration window to avoid production lockouts.

## Why This Is Critical

- If frontend moves to new fields while rules still validate old fields, production reads/writes fail.
- Rules are a hard dependency for share, unshare, move, and shortcut resolution stability.

## Validation Targets

- Share success path (new recipient): subject update + shortcut existence check + create.
- Re-share path (already shared): no duplicate share entries and no duplicate shortcuts.
- Non-owner path: cannot mutate source owner entities outside intended scope.
- Legacy-to-new transition path: no outage while migration completes.
