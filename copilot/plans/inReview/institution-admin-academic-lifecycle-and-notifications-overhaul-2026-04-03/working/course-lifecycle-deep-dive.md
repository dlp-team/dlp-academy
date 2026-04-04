<!-- copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/working/course-lifecycle-deep-dive.md -->
# Course Lifecycle Deep Dive

## 1. Architectural Intent
Build a deterministic lifecycle pipeline where academic calendar settings drive subject visibility, enrollment continuity, and yearly transfer operations.

## 2. Proposed Domain Additions

### 2.1 Institution Settings (per `institutionId`)
Recommended additive fields:
- `academicCalendar.startDate`
- `academicCalendar.ordinaryEndDate`
- `academicCalendar.extraordinaryEndDate`
- `academicCalendar.periodization.mode` (`trimester`, `cuatrimester`, `custom`)
- `academicCalendar.periodization.customPeriods[]`
- `courseLifecycle.postCoursePolicy` (`delete`, `retain_all_no_join`, `retain_teacher_only`)
- `courseLifecycle.autoStartVisibilityDate` (optional)
- `courseLifecycle.hierarchy[]` (ordered progression model)

### 2.2 Course and Class Constraints
- `courses.academicYear` remains required.
- `classes.academicYear` is persisted but always derived from linked course.
- Update and create operations must reject explicit class-year mismatches.

### 2.3 Student-Course Link Collection
Create explicit relationship collection (name to confirm with existing conventions):
- `studentCourseLinks/{linkId}` with:
  - `institutionId`
  - `studentUid`
  - `studentEmail`
  - `courseId`
  - `academicYear`
  - `source` (`csv`, `manual`, `transfer`)
  - `active` boolean
  - timestamps and audit actor fields

## 3. Workflows

### 3.1 CSV Linking Flow
1. Upload CSV.
2. Column mapping step (email/identifier, course reference).
3. Dry-run validation:
   - unknown users
   - unknown courses
   - cross-institution mismatches
   - duplicate links
4. Apply confirmed rows in chunks with idempotent key strategy.
5. Produce result report for accepted/rejected rows.

### 3.2 Manual Linking Flow
1. Admin selects student.
2. Admin selects course.
3. System validates institution, uniqueness, and academic year consistency.
4. Link saved and available to class assignment forms.

### 3.3 Subject Lifecycle Engine
Execution model options:
- Scheduled function (daily) for lifecycle transitions.
- Fallback on-read evaluation utility for safe UI state.

State logic baseline:
- Before ordinary end: active for teacher + enrolled students.
- Between ordinary and extraordinary end:
  - passed students -> finished
  - failed students -> active remediation
  - teacher -> active remediation visibility
- After extraordinary end: apply configured post-course policy.

### 3.4 Next-Year Transfer Flow
1. Admin chooses source academic year and target year.
2. System computes course progression from hierarchy map.
3. Dry-run preview: created courses, promoted students, conflicts.
4. Confirm and apply idempotent transfer writes.
5. Newly created target courses default to hidden.

## 4. Edge Cases and Handling
- Missing or malformed academic year on legacy records:
  - normalize and fallback strategy with audit warnings.
- Mid-year new student with no course link:
  - allow manual exception path.
- Course removed while students are linked:
  - soft-unlink strategy preserving historical trace.
- Student changes course during year:
  - close previous link (`active=false`), open new link.
- Duplicate course names across years:
  - enforce display label standard (`name + academicYear`).

## 5. Multi-Tenant and Least-Privilege Safeguards
- All reads/writes include `institutionId` checks.
- CSV ingestion rejects cross-tenant identifiers.
- Lifecycle job filters by institution and avoids global broad scans where possible.
- Teacher/student access follows current role model; no privilege expansion.

## 6. Rollout Plan
- Step 1: Add settings fields and UI (non-disruptive).
- Step 2: Enforce class-year derivation and subject class filtering.
- Step 3: Introduce student-course links with manual path first.
- Step 4: Add CSV importer with dry-run and conflict UX.
- Step 5: Add transfer tooling with dry-run and hidden-by-default targets.
- Step 6: Activate lifecycle automation with observability logs.

## 7. Testing Strategy
- Unit tests: academic-year normalization, lifecycle state transitions, hierarchy promotion maps.
- Integration tests: class-year lock and subject class selector filtering.
- Rules tests: tenant isolation for link and lifecycle documents.
- E2E: admin calendar config, CSV/manual linking, transfer dry-run, notification outcomes.

## 8. Open Risks Requiring Extra Audit
- CSV mapping UX complexity and institutions with external SIS integration.
- Migration path for legacy users/courses lacking strict academic-year integrity.
- Potential need for background retry queue if import batches are large.
