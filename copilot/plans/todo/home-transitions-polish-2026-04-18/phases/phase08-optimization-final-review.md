# Phase 8: Optimization, Polish & Final Review

## Status: `todo`
## Estimated Effort: Medium
## Depends on: Phase 7

## Objectives
1. Centralize repeated animation patterns
2. Performance audit (60fps, bundle size)
3. Full validation suite
4. Lossless report and risk analysis
5. Documentation sync

## Tasks

### 8.1 Centralization audit
- Review all animation usage across touched files
- Extract any repeated patterns into `animationConfig.ts`
- Remove duplicate variant definitions
- Ensure consistent timing across all animations

### 8.2 Performance audit
- Chrome DevTools Performance tab: record view switches, collapsibles, modals
- Verify 60fps maintained during all animations
- Check for layout thrashing (forced reflows)
- Measure bundle size delta: `npm run build` before/after comparison
- Target: < 40KB gzipped increase from framer-motion

### 8.3 Visual consistency audit
- All transitions use consistent timing family
- No animation feels "off" compared to others
- Test on different screen sizes (responsive)
- Test with slow 3G throttling — animations degrade gracefully

### 8.4 Full validation
- `npm run test` — all tests pass
- `npm run lint` — 0 errors
- `npx tsc --noEmit` — 0 errors
- Manual visual verification of every animated element

### 8.5 Documentation
- Create lossless report in `copilot/explanations/temporal/lossless-reports/`
- Update `copilot/explanations/codebase/` for touched files
- Log any out-of-scope risks in `copilot/plans/out-of-scope-risk-log.md`

### 8.6 Deep risk analysis
- Security: framer-motion has no network/data access, purely visual
- Data integrity: no state changes, purely presentational
- Performance: GPU-accelerated props only (transform, opacity)
- Edge cases: slow devices, many items, rapid interactions
- Reduced motion: verified in Phase 7

## Files to Touch
- `src/utils/animationConfig.ts` (centralization)
- All touched files (cleanup)
- Documentation files

## Completion Criteria
- [ ] No duplicate animation code
- [ ] 60fps verified
- [ ] Bundle size delta documented
- [ ] All tests pass
- [ ] Lint clean, tsc clean
- [ ] Lossless report filed
- [ ] Risk log updated
- [ ] Codebase explanations updated
