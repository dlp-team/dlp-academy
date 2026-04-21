# Phase 4 — Micro-Interactions

## Status: `TODO`

## Objective
Add subtle, responsive micro-interactions to interactive elements throughout the app — cards, buttons, inputs, navigation items. These small touches create the "premium feel" that separates good apps from great ones.

## Design Reference

> Apple's design language: interactions should feel like touching real objects. A button gives way slightly when pressed. A card lifts subtly when hovered. Focus states glow softly.

## Deliverables

### 4.1 Card Hover & Press Effects
**CSS-level (Tailwind utilities) — NO Framer Motion overhead**

Pattern:
```css
/* Card hover: subtle lift + shadow increase */
.card-interactive {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0,0,0,0.1);
}
.card-interactive:active {
  transform: translateY(0px) scale(0.98);
}
```

Apply to:
- Subject cards on Home page
- Folder cards on Home page
- Dashboard stat cards
- Quiz/assignment cards
- Resource cards

### 4.2 Button Press Feedback
**CSS-level**

Pattern:
```css
/* Button press: slight scale down */
.btn-press {
  transition: transform 100ms ease-in;
}
.btn-press:active {
  transform: scale(0.97);
}
```

Apply to:
- Primary action buttons
- Icon buttons (toolbar, controls)
- Navigation buttons

### 4.3 Focus Ring Animation
**CSS-level**

Pattern:
```css
/* Focus: soft glow ring */
.focus-glow:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
  transition: box-shadow 150ms ease-out;
}
```

Apply to:
- All interactive elements (buttons, inputs, links, cards)
- Consistent across light and dark mode

### 4.4 Navigation Active Indicator
**File:** [src/components/layout/Header.tsx](src/components/layout/Header.tsx)

Changes:
```
- Active route indicator animates with layoutId (sliding underline/pill)
- Navigation items have subtle hover background transition
- Mobile menu items animate with stagger on open
```

### 4.5 Tooltip & Dropdown Entrance
**Existing components — enhance**

Changes:
```
- Dropdowns: scaleVariants entrance (already configured, verify usage)
- Tooltips: fadeIn with slight y-shift (0.15s)
- Context menus: scaleVariants from click origin
```

### 4.6 Create Utility CSS Classes
**File:** `src/index.css` or new `src/styles/interactions.css`

Add reusable utility classes:
```
.interactive-card   — hover lift + press + focus glow
.interactive-button — press scale + focus glow
.interactive-link   — hover color shift + underline animation
.interactive-row    — hover background highlight
```

## Validation Checklist
- [ ] Cards lift on hover, press on click
- [ ] Buttons scale on press
- [ ] Focus rings appear on keyboard navigation
- [ ] Navigation indicator slides smoothly
- [ ] All interactions feel responsive (no lag)
- [ ] Dark mode interactions look correct
- [ ] Reduced motion: no transform animations, only color/opacity
- [ ] Touch devices: no hover styles stuck
- [ ] `get_errors` clean
- [ ] `npm run test` passes

## Files Touched
- `src/index.css` or `src/styles/interactions.css` (create/modify)
- `src/components/layout/Header.tsx` (modify)
- Various card/button components across pages (modify)
- Home page card components (modify)
- Dashboard card components (modify)

## Estimated Commits: 3–4
1. Utility CSS classes for interactions
2. Card + button micro-interactions across pages
3. Header navigation animation
4. Final validation + consistency pass
