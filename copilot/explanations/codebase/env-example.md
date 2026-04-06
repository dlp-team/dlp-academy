<!-- copilot/explanations/codebase/env-example.md -->
# .env.example Explanation

## File Purpose
`.env.example` provides a safe, committed template for local environment bootstrap.

## Current Behavior
- Declares `COPILOT_PC_ID` as the required local identifier for multi-agent branch ownership and status claiming.
- Includes optional `NODE_ENV=development` for local consistency.
- Contains comments that instruct users to copy the template to `.env` and never commit `.env`.

## Changelog
### 2026-04-06
- Added `.env.example` to make Copilot PC identity setup explicit before deployment.
- Kept values non-sensitive and placeholder-based.
