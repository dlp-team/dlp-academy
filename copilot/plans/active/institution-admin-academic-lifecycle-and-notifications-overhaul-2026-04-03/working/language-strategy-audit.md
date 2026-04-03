<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/working/language-strategy-audit.md -->
# Language Strategy Audit (Spanish-First Product)

## Current State
- Product UI is Spanish-first and already optimized for this audience.
- Some features are still evolving rapidly, making translation churn expensive.

## Options Evaluated

### Option A - Browser Translation Only
Pros:
- Zero implementation effort.
- Immediate fallback for non-Spanish readers.

Cons:
- Inconsistent translation quality in educational domain terms.
- No control over key UX labels and legal text accuracy.
- Not suitable for accessibility/compliance-sensitive messaging.

### Option B - Full Native i18n Now
Pros:
- Highest quality and consistency.
- Product-grade localization controls.

Cons:
- Significant implementation overhead during feature-heavy roadmap.
- Requires disciplined key management and translation operations.

### Option C - Hybrid Roadmap (Recommended)
Pros:
- Keep Spanish-first speed now while preparing technical i18n readiness.
- Defer large translation cost until core feature model stabilizes.

Cons:
- Requires up-front conventions and guardrails to avoid hardcoded debt.

## Recommendation
Adopt Option C:
1. Keep Spanish as the only fully supported UI language in near term.
2. Introduce i18n-ready architecture incrementally (key extraction boundaries, translation wrapper strategy).
3. Re-evaluate adding English once major lifecycle/settings roadmap stabilizes.

## Practical Next Steps
- Define translation key naming conventions for new UI strings.
- Centralize new labels in one layer instead of scattering literals.
- Add a feature flag for future language selector rollout.
- Keep browser translation as non-official fallback.

## Decision
- Near term: Spanish-first with disciplined i18n readiness.
- Mid term: controlled multilingual rollout after roadmap stabilization and test coverage maturity.
