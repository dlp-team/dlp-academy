// copilot/explanations/codebase/tests/e2e/admin-guardrails.spec.md

## Changelog
### 2026-03-09: Sudo confirmation sequencing assertion
- Expanded policy-save guardrail scenario to assert success feedback is not visible before sudo confirmation.
- Maintains existing verification that success appears after valid confirmation.

### 2026-04-01: Invite removal flow aligned with in-page confirm modal
- Updated coverage to use the current in-page confirmation dialog for teacher-invite removal.
- Removed legacy browser-dialog assumption and asserted row removal after explicit modal confirmation.

## Overview
This suite validates role-based access and privileged dashboard mutation guardrails.

## Notes
- The policy-save path is now explicitly ordered: open sudo modal first, then allow success feedback after confirmation.
