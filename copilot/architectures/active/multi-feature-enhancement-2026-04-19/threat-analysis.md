<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/threat-analysis.md -->
# Threat Analysis — Multi-Feature Enhancement Architecture

---

## 1. Security Threats

### T-SEC-01: Badge Data Tampering
**Risk**: Students or unauthorized users modify their own badge records in Firestore.
**Severity**: HIGH
**Mitigation**:
- Firestore rules MUST enforce: only teachers/institution admins can write badge documents
- Auto-badges written by Cloud Functions or trusted service accounts only
- Client-side badge writes restricted to `awardedBy` === authenticated teacher UID
- `institutionId` scoping on all badge queries

### T-SEC-02: Institution Admin Threshold Manipulation
**Risk**: Non-admin users modify the grade threshold setting.
**Severity**: HIGH
**Mitigation**:
- Firestore rules: only `institutionAdmin` or `admin` roles can write to `institutionSettings.badgeConfig`
- Validate threshold is a number between 1-10 in rules and client-side

### T-SEC-03: Cross-Institution Badge Leakage
**Risk**: Badges from one institution visible to users of another institution.
**Severity**: HIGH
**Mitigation**:
- ALL badge queries include `where('institutionId', '==', currentInstitutionId)`
- Firestore rules enforce `resource.data.institutionId == request.auth.token.institutionId`
- No client-side filtering as sole protection — server rules are primary

### T-SEC-04: Teacher Badge Scope Escalation
**Risk**: Teacher awards badges for subjects they don't own.
**Severity**: MEDIUM
**Mitigation**:
- Verify teacher is assigned to the subject before allowing badge operations
- Check `subjectId` ownership in badge award flow
- Firestore rules validate teacher-subject relationship

---

## 2. Data Integrity Threats

### T-DATA-01: Badge Auto-Revocation Race Condition
**Risk**: Grade update triggers badge revocation while teacher is simultaneously awarding a different badge, causing inconsistent state.
**Severity**: MEDIUM
**Mitigation**:
- Use Firestore transactions for badge award/revoke operations
- Badge type field (`auto` vs `manual`) prevents auto-revocation from touching manual badges
- Separate subcollections or fields for auto vs manual badges

### T-DATA-02: Subject Cascading Update Partial Failure
**Risk**: Changing academic year updates classes but fails to update subject status, leaving inconsistent state.
**Severity**: MEDIUM
**Mitigation**:
- Use Firestore batch writes for cascading updates (atomic operation)
- Validate all cascading changes before committing
- Show error state and allow retry if partial failure detected
- Rollback UI state on failure

### T-DATA-03: Subject Uniqueness Constraint Bypass via Race
**Risk**: Two users create the same subject simultaneously, bypassing client-side uniqueness check.
**Severity**: LOW
**Mitigation**:
- Client-side check is first line of defense (query before write)
- Consider Firestore composite key or Cloud Function trigger for server-side enforcement
- Accept that race condition is extremely unlikely in typical usage patterns
- If detected, second write shows error on next load

### T-DATA-04: Badge Threshold Default Gap
**Risk**: Institutions without explicit threshold setting cause NaN or undefined in badge computation.
**Severity**: MEDIUM
**Mitigation**:
- Always default to `8` when threshold is undefined/null
- Validate threshold is a valid number in range [1, 10] before computation
- Handle `NaN`, `Infinity`, and non-numeric values defensively

### T-DATA-05: Grade Mean Computation Edge Cases
**Risk**: Students with no grades, only one grade, or mixed-subject grades produce unexpected badge behavior.
**Severity**: MEDIUM
**Mitigation**:
- No grades = no badge (not threshold failure, just "not eligible yet")
- Single grade = that grade is the mean
- Per-subject mean computed independently
- General mean is mean of subject means (equal weight)
- Handle division by zero explicitly

---

## 3. Permission & Access Threats

### T-PERM-01: Role Confusion in Badge Management
**Risk**: Unclear boundaries between teacher badge management (subject scope) and institution admin badge management (general scope).
**Severity**: MEDIUM
**Mitigation**:
- Clear UI separation: "Insignias de la asignatura" (teacher) vs "Insignias generales" (admin)
- Permission checks at component level: `canManageSubjectBadges()` vs `canManageGeneralBadges()`
- Teacher cannot see/modify general badge templates
- Institution admin can view but not modify subject-specific badges

### T-PERM-02: Student Badge Self-Award
**Risk**: Student role attempts to award badges to themselves.
**Severity**: LOW (likely blocked by Firestore rules)
**Mitigation**:
- No badge-award UI shown to student role
- Firestore rules: write requires `request.auth.token.role in ['teacher', 'institutionAdmin', 'admin']`

---

## 4. Runtime & UX Threats

### T-UX-01: Theme Toggle Performance Degradation
**Risk**: Adding CSS transitions to all elements during theme switch causes jank on low-end devices.
**Severity**: LOW
**Mitigation**:
- Limit transition to key properties: `background-color`, `color`, `border-color`, `box-shadow`
- Avoid transitioning `all` — only targeted properties
- Use `will-change` CSS hint sparingly
- Remove transition class after animation completes (260ms timeout)
- Test on throttled CPU in DevTools

### T-UX-02: Unsaved Changes Guard False Positives
**Risk**: Guard triggers on overlays where no meaningful change was made (e.g., clicking into a field and clicking out).
**Severity**: MEDIUM
**Mitigation**:
- Compare current form state against initial state (deep equality)
- Don't mark as dirty for focus/blur without value change
- Provide clear "Descartar" option that doesn't feel punishing

### T-UX-03: Badge Style Interpolation Readability
**Risk**: Gradient from green to gold at intermediate scores looks muddy or unclear.
**Severity**: LOW
**Mitigation**:
- Use discrete color stops rather than continuous gradient: 8=green, 8.5=lime, 9=amber, 9.5=orange, 10=gold
- Test color progression for accessibility (color blindness)
- Add numeric label alongside color for clarity

### T-UX-04: Cursor Pointer Audit Missing Elements
**Risk**: Some clickable elements are missed during audit, leaving inconsistent cursor behavior.
**Severity**: LOW
**Mitigation**:
- Automated grep for `onClick` without corresponding `cursor-pointer`
- Add global CSS rule: elements with `[role="button"]` get `cursor: pointer`
- Continuous enforcement via copilot instruction update

---

## 5. Rollback & Recovery Threats

### T-ROLL-01: Badge Schema Migration Irreversibility
**Risk**: New Firestore collections/fields cannot be easily rolled back if badge system has issues.
**Severity**: MEDIUM
**Mitigation**:
- New collections/fields are additive (don't modify existing schema)
- Existing `badges` collection preserved as-is; new system uses extended fields
- Rollback = stop reading new fields, UI falls back to existing badge display
- No destructive schema changes

### T-ROLL-02: Centralized Guard Breaking Existing Overlays
**Risk**: Adopting the centralized unsaved-changes guard breaks existing overlay close behavior.
**Severity**: MEDIUM
**Mitigation**:
- Incremental adoption: integrate one overlay at a time
- Guard is opt-in (wrapper component), not forced on all overlays at once
- Each overlay integration is a separate, testable commit
- Rollback = remove wrapper, restore original close handler

---

## Summary Matrix

| ID | Category | Severity | Status |
|----|----------|----------|--------|
| T-SEC-01 | Security | HIGH | Open — address in Phase 07 |
| T-SEC-02 | Security | HIGH | Open — address in Phase 07 |
| T-SEC-03 | Security | HIGH | Open — address in Phase 07 |
| T-SEC-04 | Security | MEDIUM | Open — address in Phase 09 |
| T-DATA-01 | Data Integrity | MEDIUM | Open — address in Phase 08 |
| T-DATA-02 | Data Integrity | MEDIUM | Open — address in Phase 05 |
| T-DATA-03 | Data Integrity | LOW | Open — address in Phase 04 |
| T-DATA-04 | Data Integrity | MEDIUM | Open — address in Phase 07 |
| T-DATA-05 | Data Integrity | MEDIUM | Open — address in Phase 08 |
| T-PERM-01 | Permissions | MEDIUM | Open — address in Phase 09 |
| T-PERM-02 | Permissions | LOW | Open — address in Phase 07 |
| T-UX-01 | Runtime/UX | LOW | Open — address in Phase 02 |
| T-UX-02 | Runtime/UX | MEDIUM | Open — address in Phase 03 |
| T-UX-03 | Runtime/UX | LOW | Open — address in Phase 08 |
| T-UX-04 | Runtime/UX | LOW | Open — address in Phase 01 |
| T-ROLL-01 | Rollback | MEDIUM | Open — address in Phase 07 |
| T-ROLL-02 | Rollback | MEDIUM | Open — address in Phase 03 |
