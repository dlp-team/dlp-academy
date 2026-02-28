# Phase 05 Rollout Guardrails — 2026-02-28

## Rollout strategy
1. Deploy with default token behavior unchanged.
2. Enable institution token overrides incrementally per institution document.
3. Validate first rollout cohort with manual smoke matrix before broad enablement.

## Configuration guardrails
- Accept only known Home token keys.
- Accept only non-empty string override values.
- Ignore invalid/missing override payloads.
- Preserve defaults when institution doc is missing or fetch fails.

## Observability guardrails
- Watch runtime errors in Home page load and modal interactions.
- Watch support reports for visual inconsistencies in shared/manual views.
- Track institution-specific reports to identify malformed customization payloads.

## Rollback strategy
- Fast rollback: remove or empty institution token override fields.
- Safe fallback: Home automatically uses `HOME_THEME_TOKENS` defaults.
- No code rollback required for config-only rollback path.

## Release gate
- Build passes.
- Diagnostics clean.
- Manual smoke checklist signed by reviewer.
