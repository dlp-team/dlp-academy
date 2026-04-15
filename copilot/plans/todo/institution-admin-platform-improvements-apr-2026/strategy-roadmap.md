# Strategy Roadmap — Institution Admin & Platform Improvements April 2026

## Goal
Deliver all user-requested improvements from AUTOPILOT_PLAN.md (April 2026) across the Institution Admin Dashboard, app-wide UX, authentication flow, drag selection, and Copilot tooling documentation.

## Execution Order Rationale
1. **Institution Admin Dashboard** — highest-value group; isolated to one area, safe to do first
2. **Settings, Bin, Profile** — each is independent; batch to avoid session sprawl
3. **Scrollbars** — cross-cutting but purely visual; atomic find-and-replace pattern
4. **Sign-in email verification** — auth-critical; needs careful gate testing
5. **Selection mode drag bug** — complex state/animation fix; isolated component
6. **Copilot documentation** — tooling only; no runtime risk
7. **Optimization + inReview** — required closure gate

## Phase Status

| Phase | Title | Status | Branch | Commit |
|-------|-------|--------|--------|--------|
| 1 | Institution Admin Dashboard fixes | TODO | feature/new-features-2026-04-12 | — |
| 2 | App-wide UX: Settings, Bin, Profile | TODO | feature/new-features-2026-04-12 | — |
| 3 | Scrollbars modernization | TODO | feature/new-features-2026-04-12 | — |
| 4 | Sign-in email verification | TODO | feature/new-features-2026-04-12 | — |
| 5 | Selection mode drag bug fix | TODO | feature/new-features-2026-04-12 | — |
| 6 | Copilot documentation system | TODO | feature/new-features-2026-04-12 | — |
| 7 | Final optimization + inReview | TODO | feature/new-features-2026-04-12 | — |

## Risk Areas
- **Sign-in email verification**: regression risk on existing users; needs canary path
- **Scrollbars**: wide surface area; visual regression possible on edge cases
- **Selection mode drag**: complex drag-state interaction with ghost elements

## Constraints
- No production deploys from autopilot
- No `git push` to `main`
- All merges require human authorization per BRANCH_LOG gate
