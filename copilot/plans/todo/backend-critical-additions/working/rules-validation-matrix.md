# Rules Validation Matrix (Draft)

## Scope

Validate Firestore permission behavior for migration-adjacent entities and workflows.

## Entities

- subjects
- folders
- shortcuts
- topics
- quizzes
- documents

## Roles

- owner
- editor
- viewer
- unauthorized user

## Critical Flows

- Read own resources
- Read shared resources
- Edit owner-allowed resources
- Reject unauthorized updates/deletes
- Share flow dependent queries
- Shortcut dedupe queries

## Matrix (Initial)

- owner + subject read/write: EXPECT ALLOW
- editor + subject read/update (when editor policy applies): EXPECT ALLOW
- viewer + subject read only: EXPECT ALLOW
- unauthorized + subject read/write: EXPECT DENY
- owner + shortcut query/create for share flow: EXPECT ALLOW
- non-owner unrelated shortcut query by target: EXPECT DENY

## Exit Criteria (Draft)

- All EXPECT ALLOW checks pass
- All EXPECT DENY checks are denied
- No migration flow blocked by rules regressions
