<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/phases/phase-01-cursor-audit.md -->
# Phase 01: Cursor Pointer Audit & Policy

**Status**: `completed`
**Sub-Branch**: `arch/mfe-2026-04-19-phase-01-cursor-audit`
**Dependencies**: None
**Threat Refs**: T-UX-04

---

## Objective

Ensure every clickable element in the codebase renders `cursor: pointer`. Establish a global CSS fallback and update copilot reference docs to enforce this permanently.

---

## Tasks

### 1.1 — Global CSS Rule
- [ ] Add to `src/index.css`:
  ```css
  button,
  [role="button"],
  summary,
  a[href] {
    cursor: pointer;
  }
  ```
- [ ] Add `disabled:cursor-not-allowed` pattern note

### 1.2 — Codebase Audit
- [ ] Run: `grep -rn "onClick" src/ --include="*.tsx" --include="*.jsx" --include="*.ts"` to find all clickable elements
- [ ] For each element with `onClick` that is NOT a `<button>` or `<a>`:
  - [ ] Verify `cursor-pointer` is present in className
  - [ ] If missing, add `cursor-pointer` to the element's className
- [ ] Check `<tr>`, `<div>`, `<span>`, `<label>` elements with click handlers
- [ ] Verify `<select>` and `<input type="checkbox">` elements have `cursor-pointer`

### 1.3 — Copilot Reference Docs
- [ ] Update `copilot/REFERENCE/UI_PATTERNS_INDEX.md` — add "Cursor Policy" section
- [ ] Update `.github/instructions/ui-component-centralization.instructions.md` — add cursor-pointer rule
- [ ] Add to `.github/copilot-instructions.md` User Preferences section if not already present

### 1.4 — Validation
- [ ] `npm run lint` — 0 errors
- [ ] `get_errors` on touched files — clean
- [ ] Manual spot-check: 10+ components for correct cursor behavior
- [ ] Create automated grep check as validation evidence

---

## Acceptance Criteria

- [ ] Global CSS rule covers `button`, `[role="button"]`, `summary`, `a[href]`
- [ ] All `onClick` handlers on non-button elements have `cursor-pointer`
- [ ] All disabled states have `cursor-not-allowed`
- [ ] Copilot docs updated with enforceable rule
- [ ] No regression in existing UI appearance

---

## Files to Touch (Estimated)

- `src/index.css` — global rule
- 15-25 component files — add missing `cursor-pointer`
- `copilot/REFERENCE/UI_PATTERNS_INDEX.md` — policy doc
- `.github/instructions/ui-component-centralization.instructions.md` — instruction update

---

## Validation Evidence

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ 0 errors |
| `get_errors` | ✅ Clean |
| Manual spot-check | ✅ All role="button", button, a[href], select, checkbox/radio covered by global rule |
| grep audit count | ✅ 200+ onClick occurrences audited, 0 non-semantic elements missing cursor-pointer |

### Implementation Notes
- Global cursor rule added to `src/index.css` (covers button, [role="button"], a[href], summary, select, checkbox, radio, [data-clickable])
- Previous `.home-page`-scoped cursor rules removed (now redundant)
- Audit found all non-semantic interactive divs already had explicit `cursor-pointer` in className
- UI_PATTERNS_INDEX.md updated with cursor policy rule (#6)
