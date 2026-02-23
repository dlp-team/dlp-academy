# Lint & Code Quality Issues To Fix

This file lists the main issues found by automated linting (npm run lint) and code review. Addressing these will improve code quality, maintainability, and prevent bugs.

## 1. Unused Variables
- Remove or use variables that are defined but never used (e.g., `innerIconSize`, `onSelectTopic`, `isHovered`, etc.).

## 2. React Hooks Misuse
- Do not call hooks (like `useState`, `useGhostDrag`) conditionally. Hooks must always be called in the same order.

## 3. Impure Functions in Render
- Do not use impure functions (like `Math.random`) directly in render or during render of components. Move such logic to useEffect or useMemo.

## 4. Fast Refresh Errors
- Do not export both components and non-component functions/constants from the same file. Move shared constants/functions to a separate file.

## 5. setState in Effects
- Avoid calling `setState` synchronously inside `useEffect` except for synchronizing with external systems. This can cause cascading renders.

## 6. Missing useEffect Dependencies
- Ensure all dependencies used inside `useEffect` are included in the dependency array.

## 7. General Cleanup
- Remove any remaining unused code, legacy files, or dead code.
- Run lint and format scripts regularly to keep code clean.

---

**Tip:** Fixing these issues will help prevent runtime bugs, improve performance, and make the codebase easier to maintain.
