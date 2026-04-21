<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/rollback-playbook.md -->
# Rollback Playbook — Multi-Feature Enhancement Architecture

**Purpose**: Per-phase rollback procedures if a phase must be reverted after merge.

---

## General Rollback Strategy

All phases use **additive changes** (new files, new fields, new components). No existing code is deleted or fundamentally restructured. This means rollback for any phase is:

1. **Git revert** the merge commit on the base branch
2. **Verify** no downstream phases depend on the reverted code
3. **Re-run tests** to confirm clean state
4. **Update** `strategy-roadmap.md` status to `rolled-back`

---

## Phase-Specific Rollbacks

### Phase 01: Cursor Pointer Audit
**Risk Level**: VERY LOW
**Rollback**:
- Revert the commit(s) adding `cursor-pointer` classes
- Remove any global CSS cursor rule from `index.css`
- Revert copilot instruction doc changes
**Data Impact**: None (CSS-only changes)
**Downstream Impact**: None (no other phase depends on cursor)

---

### Phase 02: Theme Toggle Smoothness
**Risk Level**: LOW
**Rollback**:
- Revert CSS transition additions in `index.css`
- Revert toggle ball animation changes in `Header.jsx`
- Revert `useDarkMode.js` / `themeMode.js` modifications
**Data Impact**: None (CSS/JS behavioral changes only)
**Downstream Impact**: None

---

### Phase 03: Centralized Unsaved-Changes Guard
**Risk Level**: MEDIUM
**Rollback**:
- Delete new files: `useUnsavedChangesGuard.ts`, `UnsavedChangesConfirmModal.tsx`, `GuardedOverlay.tsx`
- Revert overlay integrations that adopted the guard
- Restore original inline close-guard logic in affected overlays
- Remove from `COMPONENT_REGISTRY.md`
**Data Impact**: None (UI-only)
**Downstream Impact**: Phases 04, 05 use the guard — if those are already merged, they must be reverted first

---

### Phase 04: Subject Uniqueness Constraint
**Risk Level**: LOW
**Rollback**:
- Remove uniqueness validation query from subject creation/edit flow
- Remove error message display for duplicates
- Delete `subjectValidation.ts` utility
**Data Impact**: None (validation-only; no Firestore schema change)
**Downstream Impact**: Phase 05 depends on Phase 04's validation foundation

---

### Phase 05: Subject Field Cascading Updates
**Risk Level**: MEDIUM
**Rollback**:
- Revert cascading update logic in subject edit flows
- Restore original behavior (no cascade on field change)
- Remove batch write logic
**Data Impact**: LOW — cascading only applies on explicit user edit action
**Recovery**: Any data changed by cascading updates during active period remains valid (no corruption)

---

### Phase 06: Teacher Dashboard Conduct Default
**Risk Level**: VERY LOW
**Rollback**:
- Revert default value from 10 to previous default (undefined/null)
- Revert fallback display logic
**Data Impact**: Students who received `behaviorScore: 10` via default keep it (acceptable)
**Downstream Impact**: Phase 07 badge schema references conduct data — unaffected by default value rollback

---

### Phase 07: Badges System — Data Model
**Risk Level**: MEDIUM
**Rollback**:
- Delete new utility files: `badgeUtils.ts`, badge types
- Delete new hook: `useBadges.ts`
- Do NOT delete Firestore documents (they're additive; leaving orphaned docs is safe)
- Revert any Firestore rule changes
**Data Impact**: Badge documents in Firestore become orphaned (harmless)
**Downstream Impact**: Phases 08, 09 fully depend on Phase 07 — must revert those first

---

### Phase 08: Badges System — Automatic Badges
**Risk Level**: MEDIUM-HIGH
**Rollback**:
- Remove auto-computation trigger logic
- Remove auto-badge display enhancements
- Revert `BadgesSection.jsx` to pre-Phase-08 state
- Auto-awarded badges in Firestore remain (can be cleaned via script)
**Data Impact**: Students may have auto-awarded badges that are now "orphaned" visually
**Recovery Script**: Query badges where `type: 'auto'` and delete (optional cleanup)
**Downstream Impact**: Phase 09 depends on auto-badge infrastructure

---

### Phase 09: Badges System — Manual + Subject Badges
**Risk Level**: MEDIUM-HIGH
**Rollback**:
- Remove manual badge creation/award/revoke UI
- Remove subject-specific badge management
- Remove institution admin badge management
- Revert teacher dashboard badge columns
- Manual badges in Firestore remain (cleanup via script)
**Data Impact**: Manually awarded badges become orphaned
**Recovery Script**: Query badges where `type: 'manual'` and optionally delete
**Downstream Impact**: None (this is the final badge phase)

---

### Phase 10: Final Optimization
**Risk Level**: LOW
**Rollback**:
- Revert centralization refactors
- Restore split files (if any were consolidated)
- Phase 10 changes are quality improvements, not functional — rollback has minimal user impact
**Data Impact**: None

---

## Emergency Full Rollback

If the entire architecture must be reverted:

1. `git checkout development`
2. `git revert <merge-commit-of-base-branch>` (single revert if squash-merged)
3. Verify with `npm run test` and `npm run lint`
4. Push to development
5. Badge Firestore documents remain (harmless; cleanup script available)
6. Update architecture status to `rolled-back` in README.md
7. Move architecture from `active/` to `archived/` with rollback note

---

## Data Recovery Notes

| Phase | Firestore Changes | Recovery |
|-------|------------------|----------|
| 01-06 | None | N/A |
| 07 | New badge template documents | Leave orphaned (harmless) or batch delete |
| 08 | Auto-awarded badge documents | Query `type: 'auto'` + batch delete |
| 09 | Manual badge documents, subject badge documents | Query `type: 'manual'` + batch delete |

**Important**: Firestore changes are always additive (new documents/fields). No existing documents are modified or deleted by this architecture. Rollback is always safe.
