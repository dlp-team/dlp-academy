<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/strategy-roadmap.md -->
# Strategy Roadmap

## Objective
Deliver all requested ORIGINAL_PLAN outcomes with lossless behavior preservation, phased validation, and documentation synchronization.

## Phase Map
1. Phase 01: Selection mode architecture and interaction fixes
2. Phase 02: Bin section visual behavior parity
3. Phase 03: Settings theme controls and system theme consistency
4. Phase 04: Institution customization live preview architecture
5. Phase 05: Global scrollbar theme + no-shift behavior
6. Phase 06: Topic create-action regression recovery
7. Phase 07: Final optimization and deep risk review

## Current Progress (2026-04-07)
- Phase 00: completed
- Phase 01: finished
- Phase 02: inReview
- Phase 03-07: todo

## Execution Rules
- No major block starts before prior block validate -> commit -> push.
- Every phase produces/updates a lossless report.
- Docs-sync updates run alongside code changes to prevent state drift.

## Risks to Watch
- Selection mode behavior touches multiple interaction paths.
- Live iframe preview touches auth, theming, and UI messaging boundaries.
- Theme/system-scrollbar changes can cause broad UI regressions.

## Completion Definition
- All requested behaviors implemented.
- Requested regressions fixed without adjacent regressions.
- Tests/lint/build gates pass.
- Plan and explanation docs synchronized.
- Final leverage gate executed via vscode_askQuestions.
