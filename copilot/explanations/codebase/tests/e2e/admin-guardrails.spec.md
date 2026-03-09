// copilot/explanations/codebase/tests/e2e/admin-guardrails.spec.md

## Changelog
### 2026-03-09: Sudo confirmation sequencing assertion
- Expanded policy-save guardrail scenario to assert success feedback is not visible before sudo confirmation.
- Maintains existing verification that success appears after valid confirmation.

## Overview
This suite validates role-based access and privileged dashboard mutation guardrails.

## Notes
- The policy-save path is now explicitly ordered: open sudo modal first, then allow success feedback after confirmation.
