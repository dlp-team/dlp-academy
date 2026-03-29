# Rule Intent Matrix Template

## Subjects
- Read: owner, shared collaborators by UID/email, institution-scoped roles where applicable.
- Update (move, metadata): owner + editor permissions; viewer denied.
- Delete: owner only unless explicit policy permits elevated role.

## Folders
- Read: owner + shared collaborators + valid inherited access contexts.
- Update (move/nest): owner/editor where parent/target constraints are satisfied.
- Delete: owner (and explicitly permitted roles), with inherited safety checks.

## Shortcuts
- Move/hide/delete: shortcut owner should be allowed within own hierarchy.
- Must not leak source ownership privileges to non-owners.

## Cross-cutting
- Institution boundaries must remain enforced.
- Global admin bypass remains explicit and minimal.