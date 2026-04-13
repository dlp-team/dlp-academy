# config.ts

## Overview
- Source file: `src/firebase/config.ts`
- Last documented: 2026-04-13
- Role: Firebase app bootstrap for Auth, Firestore, Functions, Storage, and optional Analytics.

## Responsibilities
- Initializes Firebase app from environment variables.
- Exports shared Firebase service instances (`db`, `auth`, `functions`, `provider`, `storage`).
- Controls analytics initialization guardrails.

## Exports
- `analytics`
- `db`
- `auth`
- `functions`
- `provider`
- `storage`

## Changelog
- 2026-04-13: Guarded analytics initialization to production-only browser context, reducing local dynamic-config warning noise when measurement configuration is unavailable in non-production sessions.
