---
# .github/skills/find-missing-tests/SKILL.md
name: find-missing-tests
description: Audit the repository and generate a deduplicated list of missing tests across unit, integration, rules, and e2e layers. Use for explicit test-gap analysis requests.
disable-model-invocation: true
---

# Find Missing Tests Skill

## Objective
Produce a concrete, deduplicated backlog of missing tests.

## Process
1. Enumerate user-facing and critical backend/security flows.
2. Map existing coverage in `tests/unit`, `tests/e2e`, `tests/rules`, and related test folders.
3. Compare with known backlog references (for example `tests/missing-tests-net-new.md`).
4. Exclude duplicates and already-covered paths.
5. Output missing tests with:
   - feature area,
   - scenario,
   - priority,
   - recommended test type.
