<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/phases/phase-09-badges-manual-subject.md -->
# Phase 09: Badges System — Manual + Subject Badges

**Status**: `not-started`
**Sub-Branch**: `arch/multi-feature-enhancement-2026-04-19/phase-09-badges-manual-subject`
**Dependencies**: Phase 07 (schema), Phase 08 (auto-badges)
**Threat Refs**: T-SEC-04, T-PERM-01

---

## Objective

Implement teacher-created manual badges, subject-specific badge sets, general institution badges, and cross-dependency computation (general badges aggregating from subject badges). Enable badge management from teacher dashboard and individual student views.

---

## Tasks

### 9.1 — Badge Classification System
- [ ] Two groups by **assigner**: Teacher (manual) vs Automatic (system)
- [ ] Two groups by **scope**: General (institution-wide) vs Subject (per-subject)
- [ ] Matrix:
  | | General | Subject |
  |--|---------|---------|
  | **Auto** | Cross-subject aggregation (e.g., mean behavior) | Grade-based (Phase 08) |
  | **Manual** | ❌ (spec says general = auto only) | Teacher-created, teacher-awarded |

### 9.2 — Teacher Badge Management (Subject Scope)
- [ ] **Create badge template**: Teacher can create custom badges for their subjects
  - UI: Badge creation form (name, description, icon, category)
  - Firestore: Write to `badgeTemplates` with `scope: 'subject'`, `subjectId`
  - Permission: Only subject owner/teacher can create
- [ ] **Award badge**: Teacher selects student → selects badge → awards
  - From: Teacher Dashboard → "Mis Alumnos" → Student row actions
  - From: Subject page → Student list → Student actions
  - From: Student detail view → Badge section
  - Firestore: Create `studentBadges` document with `type: 'manual'`, `awardedBy`
- [ ] **Revoke badge**: Teacher removes a previously awarded manual badge
  - UI: Badge list on student → revoke action
  - Firestore: Update `status: 'revoked'`, `revokedAt`, `revokedBy`
  - Only manual badges can be revoked by teacher (auto badges handled by system)
- [ ] **Default badges**: System provides a set of default badge templates per subject
  - Created automatically when subject is created (if institution setting allows)
  - Teacher can modify or delete defaults

### 9.3 — Institution Admin Badge Management (General Scope)
- [ ] **General badge templates**: Institution admin creates/edits general badges
  - UI: Institution admin dashboard → Badge management section
  - Templates are institution-wide (not subject-specific)
  - All general badges are AUTO-computed (no manual general badges per spec)
- [ ] **Cross-subject aggregation**: General auto-badges depend on subject badges
  - Example: "Buen comportamiento general" → mean of behavior scores across all subjects
  - Example: "Excelencia académica general" → mean of grade badges across all subjects
  - Computation: aggregate subject-level data → compare against general threshold
- [ ] **Threshold management**: Institution admin configures thresholds
  - Per-general-badge thresholds (not just one global threshold)
  - Default threshold: 8

### 9.4 — Teacher Dashboard Integration
- [ ] **"Mis Alumnos" tab enhancements**:
  - Badge column shows count or top badges per student
  - Quick-action buttons for common badge awards (like existing Participación, Esfuerzo)
  - Click on badge count → expand to see all badges
- [ ] **Student detail view** (`TeacherStudentDetailView.jsx`):
  - Full badge overview: general badges + subject badges
  - Award/revoke controls for manual badges
  - Read-only display for auto badges (with current score)

### 9.5 — Badge Display Separation
- [ ] Student profile badge section divided into:
  - **"Insignias generales"** — institution-wide auto badges
  - **"Insignias de asignaturas"** — per-subject, grouped by subject name
    - Each subject group shows both auto and manual badges
- [ ] Visual distinction between auto and manual badges (e.g., small icon indicator)
- [ ] Revoked badges shown as "lost" state (optional: hide vs gray out)

### 9.6 — Permission Enforcement
- [ ] `canManageSubjectBadges(userId, subjectId)` — teacher owns subject
- [ ] `canManageGeneralBadges(userId, institutionId)` — institutionAdmin or admin role
- [ ] `canViewBadges(userId, studentId)` — same institution
- [ ] `canAwardBadge(userId, templateId)` — matches badge scope permission
- [ ] `canRevokeBadge(userId, badgeId)` — only awarder or higher role

### 9.7 — Testing
- [ ] Unit: Teacher creates badge template
- [ ] Unit: Teacher awards badge to student
- [ ] Unit: Teacher revokes badge from student
- [ ] Unit: Institution admin manages general badges
- [ ] Unit: General auto-badge computes from subject aggregation
- [ ] Unit: Permission checks for all roles
- [ ] E2E: Teacher dashboard → award manual badge → visible on student profile
- [ ] E2E: Subject page → create badge → award → verify
- [ ] E2E: Institution admin → general badge auto-computation

---

## Acceptance Criteria

- [ ] Teacher can create custom badges for subjects they own
- [ ] Teacher can award and revoke manual badges from dashboard and student view
- [ ] Institution admin can manage general badge templates
- [ ] General auto-badges correctly aggregate from subject data
- [ ] Subject badges are independent per subject per student
- [ ] Badge display clearly separates general from subject badges
- [ ] Auto badges have "auto" indicator; manual badges show "awarded by [teacher]"
- [ ] Permission checks prevent unauthorized badge operations
- [ ] All Spanish text correct and professional

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/modules/BadgeManagement.tsx` | Badge create/award/revoke UI |
| `src/components/modules/BadgeTemplateForm.tsx` | Badge template creation form |
| `src/components/modules/SubjectBadgesPanel.tsx` | Per-subject badge display |
| `src/components/modules/GeneralBadgesPanel.tsx` | General badge display |
| `src/utils/badgePermissions.ts` | Permission checking utilities |
| `src/hooks/useBadgeAggregation.ts` | Cross-subject badge computation |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Profile/components/BadgesSection.jsx` | Split into general + subject sections |
| `src/pages/TeacherDashboard/TeacherDashboard.tsx` | Badge quick-actions in student table |
| `src/pages/TeacherDashboard/components/TeacherStudentDetailView.jsx` | Full badge management |
| `src/pages/Subject/Subject.jsx` | Badge management from subject context |

---

## Validation Evidence

_(Fill after implementation)_

| Check | Result |
|-------|--------|
| Teacher creates badge | |
| Teacher awards badge | |
| Teacher revokes badge | |
| Admin manages general | |
| Auto aggregation works | |
| Permissions enforced | |
| Display separation | |
| Unit tests pass | |
| E2E tests pass | |
