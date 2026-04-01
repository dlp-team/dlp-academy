---
# .github/instructions/test-stability.instructions.md
description: Apply deterministic testing and stabilization standards for test files.
applyTo: "tests/**"
---

# Test Stability Rules

- Prefer deterministic selectors and state-based assertions over timing guesses.
- Minimize retries/timeouts; use them only when state synchronization cannot be made explicit.
- Keep environment-gated skips explicit and documented with rationale.
- Re-run targeted tests first, then full impacted suites.
- Do not weaken assertions to force green results.
