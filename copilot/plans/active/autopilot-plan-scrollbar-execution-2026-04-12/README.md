<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/README.md -->
# AUTOPILOT + Scrollbar Execution Plan (2026-04-12)

## Status
- Lifecycle: active
- Execution Mode: autopilot (checklist-driven)
- Branch: feature/autopilot-plan-scrollbar-2026-04-12
- Parent Branch: feature/autopilot-workflow-updates-2026-04-09
- Owner: hector
- Current Checklist Step: phase-00-completed

## Activation Note
- This plan was promoted from `todo` to `active` on 2026-04-12.
- Phase 00 governance verification is complete; Phase 01 is next.

## Source Priority
- Primary source of truth: [sources/source-autopilot-user-spec-autopilot-plan-scrollbar-execution-2026-04-12.md](./sources/source-autopilot-user-spec-autopilot-plan-scrollbar-execution-2026-04-12.md)
- Secondary source (scrollbar guidance reference): [sources/source-scrollbar-fix-reference-autopilot-plan-scrollbar-execution-2026-04-12.md](./sources/source-scrollbar-fix-reference-autopilot-plan-scrollbar-execution-2026-04-12.md)
- Both root source files were ingested into this plan package for traceability and lifecycle hygiene.

## Scope
1. Validate and enforce governance rule that commits and pushes happen on the branch currently being worked.
2. Complete selection-mode grouped drag and drop parity (Google Drive-like grouped ghost + grouped move behavior).
3. Add Ctrl+click and Ctrl+Shift+click range behavior for selection mode with navigation parity rules.
4. Fix bulk action confirmation copy with name list (up to five) and concise overflow format.
5. Fix bulk undo so one undo action restores all affected elements (move/delete and related batch actions).
6. Fix Bin section press-state issues (grid second-click flicker and list pressed background dimming removal).
7. Improve Institution Admin customization preview parity (teacher/student mock previews, header cleanup, live color preview behavior, swatch interaction).
8. Execute global scrollbar fix using source guidance, preserving live theme switching and layout stability.

## Out of Scope
- Production deployment and environment mutation.
- Non-requested permission model redesigns.
- Unrelated UI refactors outside listed surfaces.

## Primary File Surfaces (Planned)
- Home selection and DnD: `src/pages/Home/Home.tsx`, `src/pages/Home/hooks/useHomeBulkSelection.ts`, `src/pages/Home/hooks/useHomeContentDnd.ts`, `src/hooks/useGhostDrag.ts`, `src/pages/Home/components/HomeMainContent.tsx`
- Bin section: `src/pages/Home/components/BinView.tsx`, `src/pages/Home/components/bin/BinGridItem.tsx`, `src/pages/Home/components/bin/BinSelectionOverlay.tsx`, `src/utils/selectionVisualUtils.ts`
- Institution Admin customization: `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`, `src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx`, `src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx`, `src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts`
- Scrollbar: `src/index.css`, `src/components/ui/CustomScrollbar.tsx`, `src/App.tsx`

## Sequencing Rationale
- Governance check runs first because branch-safe commit/push rules are hard gates for all following work.
- Selection and undo are foundational for consistency across move/delete/restore actions.
- Bin polish depends on stabilized selection behavior and press-state logic.
- Customization preview is isolated as a high-impact UI surface requiring controlled validation.
- Scrollbar runs after interaction stability to avoid masking regressions with global style changes.
- Final optimization and deep-risk review are required before lifecycle promotion.

## Validation Gates
- `get_errors` on touched files every major block.
- Targeted tests first, then broader impacted suite.
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- `npm run build` for cross-surface UI changes.

## Rollback Strategy
- Atomic commits per major block.
- Revert by block if regression is detected.
- Preserve lossless reports for every block in `copilot/explanations/temporal/lossless-reports/YYYY-MM-DD/`.

## Plan Artifacts
- Strategy: [strategy-roadmap.md](./strategy-roadmap.md)
- Phases: [phases](./phases)
- Review checklist: [reviewing/verification-checklist-2026-04-12.md](./reviewing/verification-checklist-2026-04-12.md)
- Deep risk analysis: [reviewing/deep-risk-analysis-2026-04-12.md](./reviewing/deep-risk-analysis-2026-04-12.md)
- Working log: [working/execution-log.md](./working/execution-log.md)
- Subplans: [subplans/README.md](./subplans/README.md)
- User updates: [user-updates.md](./user-updates.md)
- Final continuation phase: [phases/final-phase-continue-autopilot-execution.md](./phases/final-phase-continue-autopilot-execution.md)