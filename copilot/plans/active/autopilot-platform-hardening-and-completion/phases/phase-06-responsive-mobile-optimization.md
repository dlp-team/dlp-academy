<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-06-responsive-mobile-optimization.md -->
# Phase 06 - Responsive and Mobile Optimization

## Status
COMPLETED

## Objective
Ensure consistent and reliable UX on phone/tablet breakpoints for high-priority routes without degrading desktop workflows.

## Planned Change Set
- Define route-priority matrix (Home, Profile, TeacherDashboard, InstitutionAdmin customization, core content pages).
- Fix overflow, spacing, target sizes, and interaction issues for touch usage.
- Ensure modal/dialog patterns remain usable on small screens.
- Validate role-critical actions on mobile viewport combinations.

## Viewport Matrix & Route Priority

### Viewport Targets
- **Mobile (Phone):** 320px - 480px width
- **Tablet (Portrait):** 768px - 1024px width
- **Desktop (Landscape/Large):** 1024px+ width

### Priority Routes & Features
| Priority | Route | Key Interactions to Validate on Mobile |
| -------- | ----- | -------------------------------------- |
| **High** | `/home` | Navigation menu, course cards layout, horizontal scrolls |
| **High** | `/subject/:id` | Topics list layout, tabs (Temas, Estudiantes, Tests), action buttons |
| **High** | `/topic/:id` | Content list, modal dialogs (PDF viewer, tests), drag-and-drop fallbacks |
| **Med** | `/quizzes/*` | Quizzes runtime spacing, result viewing, navigation |
| **Med** | `/profile` | Badges grid, edit forms, layout padding |
| **Low** | `/admin/*` | Datatables overflow, complex forms (tablet preferred over phone) |

## Progress Updates
<!-- Status updates will be appended here. -->

## Validation Gates
- Breakpoint matrix pass for selected priority pages.
- Critical interactions verified on mobile and tablet widths.
- Desktop parity checks confirm no regressions.
- `npm run lint` and `npm run test` pass after responsive changes.

## Rollback Triggers
- Major desktop layout regressions.
- Primary CTA actions inaccessible on mobile for any role.

## Completion Criteria
- Mobile/tablet experience meets baseline interaction quality across priority pages.
- Responsive fixes are test-backed where feasible and manually validated where visual.
