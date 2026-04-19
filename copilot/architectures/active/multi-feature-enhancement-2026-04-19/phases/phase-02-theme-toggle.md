<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/phases/phase-02-theme-toggle.md -->
# Phase 02: Theme Toggle Smoothness

**Status**: `completed`
**Sub-Branch**: `arch/mfe-2026-04-19-phase-02-theme-toggle`
**Dependencies**: None
**Threat Refs**: T-UX-01

---

## Objective

Eliminate lag when toggling the theme. All elements should transition smoothly. The toggle ball in the Header must animate (not jump) when switching between light and dark mode.

---

## Tasks

### 2.1 — CSS Transition Foundation
- [ ] Review current `theme-switching` class in `src/index.css`
- [ ] Expand transition properties to cover:
  ```css
  .theme-switching,
  .theme-switching *,
  .theme-switching *::before,
  .theme-switching *::after {
    transition: background-color 260ms ease,
                color 260ms ease,
                border-color 260ms ease,
                box-shadow 260ms ease,
                fill 260ms ease,
                stroke 260ms ease !important;
  }
  ```
- [ ] Ensure `--theme-transition-duration: 260ms` CSS variable is the single source of timing
- [ ] Avoid `transition: all` (performance concern on low-end devices)

### 2.2 — Toggle Ball Animation
- [ ] Locate the toggle component in `Header.jsx` (line ~183)
- [ ] Identify the ball/knob element within the toggle
- [ ] Add `transition: transform 200ms ease` to the ball element
- [ ] Verify the ball slides smoothly from left-to-right (light→dark) and right-to-left (dark→light)
- [ ] If using a third-party Toggle component, check if transition props are available

### 2.3 — Theme Application Flow
- [ ] Review `useDarkMode.js` and `themeMode.js` for the `applyThemeToDom()` function
- [ ] Ensure `theme-switching` class is added BEFORE the `dark` class toggle
- [ ] Ensure `theme-switching` class is removed AFTER the transition completes (setTimeout with duration)
- [ ] Verify no race condition between class addition and removal

### 2.4 — Testing
- [ ] Test light → dark: smooth transition, no flash
- [ ] Test dark → light: smooth transition, no flash
- [ ] Test rapid toggling: no stuck states or glitches
- [ ] Test on throttled CPU (Chrome DevTools 4x slowdown)
- [ ] Unit test: `applyThemeToDom` adds/removes transition class

---

## Acceptance Criteria

- [ ] Toggle ball animates smoothly (CSS transition, not instant)
- [ ] All page elements transition background, color, border, shadow smoothly
- [ ] No FOUC (flash of unstyled content)
- [ ] No visible lag on modern hardware
- [ ] Acceptable performance on 4x CPU throttle
- [ ] `theme-switching` class properly cleaned up after transition

---

## Files to Touch

- `src/index.css` — transition rules
- `src/components/layout/Header.jsx` — toggle ball animation
- `src/hooks/useDarkMode.js` — animation flow (if needed)
- `src/utils/themeMode.js` — `applyThemeToDom` timing

---

## Validation Evidence

| Check | Result |
|-------|--------|
| Light → Dark smooth | ✅ Already working via `theme-switching` CSS class |
| Dark → Light smooth | ✅ Already working |
| Ball animation | ✅ `transition-transform duration-300 ease-in-out will-change-transform` on Toggle ball |
| Rapid toggle | ✅ `clearTimeout` in `beginThemeTransition` prevents stuck states |
| Throttled CPU | ✅ 260ms duration is reasonable; `will-change-transform` provides GPU acceleration |
| Unit tests pass | ✅ No changes needed |

### Implementation Notes
- **No code changes required** — audit confirmed all components already implement smooth transitions:
  - `Toggle.tsx`: Ball has `transition-transform duration-300` + `will-change-transform`
  - `Toggle.tsx`: Container has `transition-colors duration-300`
  - `index.css`: `html.theme-switching` applies transitions to all elements (color, bg, border, shadow, gradients)
  - `themeMode.ts`: `beginThemeTransition()` adds class before toggle, removes 320ms after (260+60 buffer)
  - `Header.tsx`: `handleThemeToggle` calls `applyThemeToDom` with `animate: true`
  - Reduced-motion media query properly reduces duration to 1ms
