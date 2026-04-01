<!-- copilot/explanations/codebase/src/utils/institutionPolicyUtils.md -->

# institutionPolicyUtils.ts

## Changelog
### 2026-04-01
- Added teacher policy default: `allowTeacherAutonomousSubjectCreation: true`.
- Added helper `canTeacherCreateSubjectsAutonomously(...)` for consumer hooks and guards.

## Overview
- **Source file:** `src/utils/institutionPolicyUtils.ts`
- **Role:** Normalization and capability helpers for institution access-policy fields.

## Notes
- Policy defaults remain backward-compatible for institutions that do not yet define the new field.
