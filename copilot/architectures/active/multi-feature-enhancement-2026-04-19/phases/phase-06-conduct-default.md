<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/phases/phase-06-conduct-default.md -->
# Phase 06: Teacher Dashboard — Conduct Default

**Status**: `not-started`
**Sub-Branch**: `arch/multi-feature-enhancement-2026-04-19/phase-06-conduct-default`
**Dependencies**: None
**Threat Refs**: None

---

## Objective

Set the default conduct/behaviour score to 10 for all students in the teacher dashboard "Mis Alumnos" tab.

---

## Tasks

### 6.1 — Update Default Value
- [ ] In `TeacherDashboard.tsx` (or the student data hook):
  - [ ] Change the default/fallback `behaviorScore` from current value to `10`
  - [ ] Ensure display shows `10` when `behaviorScore` is `undefined` or `null`
  - [ ] Pattern: `student.behaviorScore ?? 10`

### 6.2 — Verify Firestore Initialization
- [ ] Check if new students get a `behaviorScore` field on creation
- [ ] If not, ensure the fallback handles missing field gracefully
- [ ] If there's a student creation hook/utility, consider setting `behaviorScore: 10` as default

### 6.3 — Testing
- [ ] Unit test: Student without `behaviorScore` field renders as 10
- [ ] Unit test: Student with explicit `behaviorScore` of 7 renders as 7
- [ ] Unit test: Dropdown allows changing from 10 to other values
- [ ] Manual verification: open teacher dashboard, check student rows

---

## Acceptance Criteria

- [ ] New students appear with conduct score 10/10
- [ ] Students without `behaviorScore` field show 10 (fallback)
- [ ] Students with explicit score show their actual score
- [ ] Teacher can still modify the score via dropdown (1-10)
- [ ] No regression in student list rendering, pagination, or search

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/TeacherDashboard/TeacherDashboard.tsx` | Default behaviorScore to 10 |
| Possibly: student data initialization utility | Set default on creation |

---

## Validation Evidence

_(Fill after implementation)_

| Check | Result |
|-------|--------|
| Default renders as 10 | |
| Explicit score preserved | |
| Dropdown functional | |
| Unit tests pass | |
