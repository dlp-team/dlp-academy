<!-- filepath: c:/Users/Profe Hectaime/Documents/Otros/Socio/dlp-academy/web/dlp-academy/copilot/explanations/temporal/lossless-reports/2026-03-30/subject-update-legacy-permission-followup.md -->

# Lossless Follow-up Report - 2026-03-30

## Scope
- Ensure subject updates do not require inviteCode or enrolledStudentUids.
- Improve legacy subject ownership compatibility for updates.

## Applied Changes
- firestore.rules
  - In subjects update rule, inviteCode and enrolledStudentUids are validated only when explicitly written.
  - Added legacy owner fallback: allow update when resource.data.userId matches authenticated uid.
  - classId validation now checks request.writeFields for partial-update safety.

## Why Legacy Subjects Could Fail
- Some old documents use userId as owner marker.
- Newer checks often rely on ownerId/uid or institution scope; userId fallback prevents false denies on old data.

## Validation Notes
- Terminal execution was not available in this toolset, so tests were not run here.
- Recommended local checks:
  - npm run test:rules
  - Re-test editing one legacy subject and one new subject.
