# Plan: Institution Admin & Platform Improvements — April 2026

> This plan was created from user-provided `AUTOPILOT_PLAN.md` and will be executed via the AUTOPILOT_EXECUTION_CHECKLIST workflow.

## Status
`TODO`

## Branch
`feature/new-features-2026-04-12`

## Problem Statement
Multiple improvements and bug fixes across the Institution Admin Dashboard, app-wide UX, sign-in flow, drag selection, and Copilot documentation infrastructure. Covers both frontend and tooling work.

## Scope Summary
- **Institution Admin Dashboard**: period dates in academic config, classes filter, courses current-only default, Institution ID duplication fix
- **App-wide UX**: settings theme selector default, bin selection-mode UI consistency, profile statistics for admin roles, scrollbars modernization
- **Auth**: enforce email verification on sign-in/registration
- **Selection mode**: drag ghost bug for >6 selected elements
- **Copilot documentation**: UI component guidelines, scrollbar + overlay rules, index, update copilot-instructions.md and AGENTS.md

## Source
[sources/source-autopilot-user-spec-institution-admin-platform-improvements-apr-2026.md](sources/source-autopilot-user-spec-institution-admin-platform-improvements-apr-2026.md)

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Institution Admin Dashboard fixes](phases/phase-01-institution-admin-fixes.md) | TODO |
| 2 | [App-wide UX: Settings, Bin, Profile](phases/phase-02-settings-bin-profile.md) | TODO |
| 3 | [Scrollbars modernization](phases/phase-03-scrollbars.md) | TODO |
| 4 | [Sign-in email verification](phases/phase-04-sign-in-verification.md) | TODO |
| 5 | [Selection mode drag bug fix](phases/phase-05-selection-mode-drag.md) | TODO |
| 6 | [Copilot documentation system](phases/phase-06-copilot-docs.md) | TODO |
| 7 | [Final optimization + inReview](phases/phase-07-optimization-inreview.md) | TODO |
| F | [Continue autopilot execution](phases/final-phase-continue-autopilot-execution.md) | TODO |

## Validation Strategy
- `npm run test` must pass after each phase
- `npm run lint` must pass (0 errors)
- `npx tsc --noEmit` must pass for TS files
- Lossless report per phase in `copilot/explanations/temporal/lossless-reports/`

## Rollback
- All changes on feature branch `feature/new-features-2026-04-12`
- No Firestore schema changes — pure UI + logic
- Sign-in change requires careful testing to avoid auth lockout

## User Updates Channel
[user-updates.md](user-updates.md)
