# Rule Intent Matrix (Phase 02)

## Access Intent by Domain

### `institution_invites`
| Operation | Actor | Intended Result | Predicate Source | Current Status |
|---|---|---|---|---|
| create invite | global admin | allow | `isGlobalAdmin()` | OK |
| create invite | institution admin same institution with role teacher | allow | role+institution checks | OK |
| create invite | institution admin role != teacher | deny | explicit role guard | OK |
| update invite | global admin | allow | global-only update | OK |
| update invite | institution admin | deny | no update permission | OK |
| delete invite | global admin | allow | global branch | OK |
| delete invite | email owner | allow if email claim and invite email exists/matches | guarded email comparison | HARDENED |
| delete invite | institution admin same institution | allow | role+institution branch | OK |
| delete invite | teacher/non-admin | deny | no matching branch | OK |

### `subjects` / `folders` (role-sensitive operations)
| Operation | Actor | Intended Result | Validation Evidence | Status |
|---|---|---|---|---|
| home shared tab editor journey | editor account | allow login + navigate | e2e pass after env fix | OK |
| home shared tab viewer create controls | viewer | deny create controls | existing e2e assertions | OK |
| folder/subject delete in shared contexts | role dependent (owner/editor/viewer) | per permission utils and rules | requires expanded dedicated e2e assertions | IN_PROGRESS |
| drag/drop move in shared contexts | editor allow, viewer deny | role + shared permission constraints | requires expanded dedicated e2e assertions | IN_PROGRESS |

### `shortcuts`
| Operation | Actor | Intended Result | Validation Evidence | Status |
|---|---|---|---|---|
| create shortcut for unshared target | non-authorized | deny | rules tests vulnerability #9 | OK |
| shortcut movement within user hierarchy | shortcut owner | allow | app/unit coverage present, e2e expansion pending | IN_PROGRESS |

## Notes
- Current highest-confidence resolved gap: invite delete runtime fragility from missing `email` fields/claims.
- Next Phase 02 focus is mapping exact predicates for drag/drop and delete operations affecting shared-folder editor/viewer behavior with explicit e2e evidence.
