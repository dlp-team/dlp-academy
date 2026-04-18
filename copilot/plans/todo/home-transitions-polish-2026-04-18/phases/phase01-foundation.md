# Phase 1: Foundation — Install framer-motion + Animation Config

## Status: `todo`
## Estimated Effort: Small

## Objectives
1. Install `framer-motion` as a production dependency
2. Create `src/utils/animationConfig.ts` with centralized animation constants
3. Mock framer-motion in test setup to prevent animation-related test flakiness
4. Verify all 762 existing tests still pass after installation

## Tasks

### 1.1 Install framer-motion
```bash
npm install framer-motion
```

### 1.2 Create animation config
File: `src/utils/animationConfig.ts`

Contents:
- Standard durations: `fast` (150ms), `normal` (250ms), `slow` (400ms)
- Standard easings: match existing 260ms ease-in-out baseline
- Reusable framer-motion variants:
  - `fadeIn` / `fadeOut`
  - `slideUp` / `slideDown`
  - `slideLeft` / `slideRight`
  - `scaleIn` / `scaleOut`
  - `staggerContainer` / `staggerItem`
- `reducedMotionVariants` — instant versions for a11y

### 1.3 Mock framer-motion in tests
File: `tests/setup.ts` (extend existing)

Add mock for framer-motion that renders children immediately without animation, preventing timing-related test issues.

### 1.4 Validate
- `npm run test` — all 762 tests pass
- `npm run lint` — 0 errors
- `npx tsc --noEmit` — 0 errors

## Completion Criteria
- [ ] framer-motion in package.json dependencies
- [ ] animationConfig.ts created with all variants
- [ ] Test mock in place
- [ ] All tests pass
