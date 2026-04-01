<!-- copilot/explanations/temporal/lossless-reports/2026-04-01/phase-03-security-and-invite-governance.md -->

# Lossless Report: Firestore Security + Subject Invite Governance

Date: 2026-04-01

## Scope Delivered
- Security review and update of Firestore rules for subject invite-code controls.
- Teacher-facing invite-code governance controls in class section three-dots menu.
- Invite-code join protection and privacy hardening.

## Touched Files
- `firestore.rules`
- `src/pages/Subject/modals/SubjectFormModal.tsx`
- `src/hooks/useSubjects.ts`
- `src/hooks/useHomeHandlers.ts`
- `src/utils/subjectAccessUtils.ts`
- `copilot/plans/active/audit-remediation-and-completion/phases/phase-03-subject-data-enforcement.md`

## Behavior Changes

### 1) Teacher controls in class section (three dots)
- Added options in class-tab invite card menu:
  - enable/disable student joins via invite code
  - select rotation interval (`1, 6, 12, 24, 72, 168` hours)
  - regenerate invite code immediately
- Default behavior remains enabled for new subjects.
- UI text remains Spanish.

### 2) Data model governance
- Subject payload normalization now includes:
  - `inviteCodeEnabled` (default `true`)
  - `inviteCodeRotationIntervalHours` (default `24`, clamped 1..168)
- Subject creation now persists:
  - `inviteCodeEnabled`
  - `inviteCodeRotationIntervalHours`
  - `inviteCodeLastRotatedAt`

### 3) Join-flow security
- `joinSubjectByInviteCode` now denies joins when:
  - invite joins disabled by teacher
  - provided code is stale vs active subject code
  - code exceeded configured rotation window
- Backward compatibility preserved for legacy subjects with no `inviteCode` field.
- Already-joined users return `alreadyJoined: true` before strict code checks.

### 4) Firestore rule hardening
- Added type/range validations for subject fields:
  - `inviteCodeEnabled` must be bool
  - `inviteCodeRotationIntervalHours` must be number in `1..168`
  - `inviteCodeLastRotatedAt` must be timestamp
- Privacy hardening in `subjectInviteCodes`:
  - allow `get` only
  - deny `list` to block code enumeration

## Validation
- `get_errors` on all touched files: no errors.
- `npm run lint`: 0 errors, only existing warnings in unrelated files.
- `npm run test`: 71/71 files passed, 385/385 tests passed.
- `npm run test:rules`: 2/2 files passed, 44/44 tests passed.
- `tests/unit/hooks/useSubjects.test.js`: 22/22 passed.

## Regressions
- None detected.
- Existing owner/shared/class access behavior preserved.

## Residual Notes
- Rotation interval is fully enforced as expiration policy and supported by manual regenerate now control.
- Automatic background rotation scheduling is not added in this slice (no scheduler introduced).
