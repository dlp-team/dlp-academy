<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/README.md -->
# Original Plan Autopilot Execution (2026-04-07)

## Status
- Lifecycle: inReview
- Branch: feature/hector/original-plan-execution-2026-0407
- Owner: hector

## Source Priority
- Primary source of truth: [copilot/plans/ORIGINAL_PLAN.md](../../../ORIGINAL_PLAN.md)
- This active plan does not weaken or replace any requirement from the primary source.

## Scope
1. Selection mode overhaul:
   - Move destination filtering (exclude selected folder descendants and selected folders)
   - Centralized sharing confirmation rules for batch move parity
   - List mode selection-on-click behavior while selection mode is active
   - Exit selection button border styling tied to primary color token
   - Undo support (Ctrl+Z + 5s undo notification)
2. Bin section UI parity:
   - Softer background fade + card focus scale in grid mode
   - Align list-mode option visuals and reveal behavior with grid mode
3. Settings theme controls:
   - Header theme-toggle visibility setting
   - Fix system theme consistency outside settings page
4. Institution admin customization preview architecture:
   - Live iframe preview with postMessage color injection (no-save preview)
   - Color card selection vs swatch click separation
   - Highlight affected regions in iframe on card selection
   - Save confirmation using registry-approved modal shell
   - Mock preview account flow and role toggle surface (teacher/student)
5. Global scrollbar fixes:
   - Theme-aware scrollbar colors
   - No layout shift when scrollbar visibility changes
6. Topic regression fix:
   - Restore missing create actions for quizzes, exams, study guides

## Out of Scope
- Production deployment
- Firestore schema rewrites not required by this feature set
- Irrelevant refactors not tied to requested outcomes

## Validation Gates
- `get_errors` for touched files after each block
- Targeted tests per feature block
- `npm run lint`
- `npm run test`
- `npm run build` when structural/theme/layout changes require it

## Rollback Strategy
- Keep feature blocks isolated by atomic commits.
- If regression appears, apply a focused revert commit for the specific block.
- Preserve branch log and lossless reports for forensic rollback support.

## Plan Artifacts
- Strategy: [strategy-roadmap.md](./strategy-roadmap.md)
- User intake: [user-updates.md](./user-updates.md)
- Execution log: [working/execution-log.md](./working/execution-log.md)
- Review checklist: [reviewing/verification-checklist-2026-04-07.md](./reviewing/verification-checklist-2026-04-07.md)
- Deep risk review: [reviewing/deep-risk-analysis-2026-04-07.md](./reviewing/deep-risk-analysis-2026-04-07.md)
