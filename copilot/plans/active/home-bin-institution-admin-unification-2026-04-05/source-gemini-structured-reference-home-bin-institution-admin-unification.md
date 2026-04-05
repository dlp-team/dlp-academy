<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/source-gemini-structured-reference-home-bin-institution-admin-unification.md -->
# Source Input - Gemini Structured Reference

Here is the optimized, highly structured prompt designed for Copilot on Autopilot. I have logically grouped the UI unifications (like the global Modal and Selection Mode) and separated the complex Institution Admin logic so the agent handles them systematically.

Copy and paste the text below into Copilot:

System Role and Execution Protocol
Role: You are an elite, deeply professional Principal Software Engineer. You are tasked with analyzing, debugging, and refactoring a large-scale, professional educational web application powered by AI.

Execution Protocol:
You must operate strictly under the following phased protocol.
1. Superficial Codebase Audit: Briefly scan the codebase to understand the architecture, state management, routing, and UI component structures. Pay special attention to existing modals, the Bin section, and the Institution Admin dashboard.
2. Analysis and Dependency Mapping: Analyze all requested changes below. Map out how they connect (for example, how unifying the modal component affects existing forms).
3. Plan Generation (create-plan skill): You MUST use the create-plan skill to generate a highly detailed execution plan. This plan must log the exact order of operations, security risks, file creations, and hook/component reuse strategies.
4. Execution and Optimization: Execute the changes step-by-step. Ensure lossless changes (no external features break). Apply linting, format the code, and ensure maximum optimization.
5. Testing and Review: Check that the implementation works using tests if possible. Do a final self-review. Do not ask for clarification; make professional architectural decisions based on the constraints provided.

Task Breakdown and Acceptance Criteria

Phase 1: Global UI Architecture (Modals and Layout)
Unified Global Modal Component:
- Objective: Create a single, reusable, customizable BaseModal wrapper for all configuration, editing, and creation overlays to ensure unified styling and easy maintenance.
- Positioning: Modals must render strictly between the header and the bottom of the screen (reference existing Home page modals).
- Dynamic Sizing: Accept parameters/props for custom width and height.
- Smart Click-Outside Closure: Allow closing the modal by clicking the backdrop only if the modal is not strictly required.
- Dirty State Protection: Implement an interception dialog: if the user has modified/selected data inside the modal and clicks outside to close, a confirmation prompt must appear warning about unsaved changes.

Scrollbar Layout Fix:
- Issue: The recent scrollbar implementation left an unwanted margin on the left side of the page to compensate for shifts.
- Fix: Remove this left margin. If the page needs centering, handle it natively via Flexbox/Grid, or ensure any padding matches the background color perfectly so it is entirely invisible.

Phase 2: Selection Mode and Bin Enhancements
Global Selection Mode Synchronization:
- Unify the logic/hooks between the Home manual section and the Bin section.
- Visual Dimming: On the Home page, when Selection Mode is active and at least one element is selected, all unselected elements must lose saturation (become visually dimmed) to emphasize the selected items. Mimic the Bin behavior.

Bin Section UI Refinements:
- Grid Mode: Remove the background blur and borders that appear when an item is selected. Instead, apply a smooth CSS transform scale to the selected card to bring it into focus, followed by the options appearing.
- List Mode: The options currently appear at the very bottom of the list with mismatched styles. Fix this so options appear immediately below the selected list element using a smooth transition that pushes the elements below it downward. Apply the same visual styling used in Grid mode.

Phase 3: Institution Admin - Settings and Users
Academic Year Timeline Defaults:
- In Admin Settings, allow admin to define exact start/end dates for Ordinary and Extraordinary periods.
- These values must automatically populate as defaults when a new course is created.

Course Hierarchy and Automatic Transfer:
- Build a drag-and-drop UI in Settings showing all unique courses.
- Objective: define the chronological path for students (for example, 1st Primary to 6th Primary to 1st ESO to 2nd Bachillerato).
- Auto-guess logic: pre-sort list intelligently based on common Spanish educational naming conventions.
- Allow admin to save this order to enable automatic academic year transfer.

Global Feature Toggles:
- Add switches in Settings to globally enable/disable specific automatic AI tools across the institution.

User Management Overhaul:
- Deletion: allow admin to permanently delete users from Users tab.
- Avatars: fix profile pictures in user view, fetching and displaying from Firebase Storage.
- Iconography: replace emojis with professional SVGs or React icons.
- History: add Past/Previous Classes section to user view for both teachers and students.

Phase 4: Customization Live Preview 3.0
Fullscreen Layout Fix:
- When preview is toggled fullscreen, app header currently overlaps it.
- Fix z-index/layout hierarchy so preview is truly fullscreen.

Exact Replica Enforcement:
- Current preview fakes inner pages.
- Refactor preview to use exact real components used in live app for Subjects, Topics, Documents, Quizzes, Exams, Study Guides, and Bin.
- Include exact real Header component inside preview layout.

Live Color Mapping and Zone Highlighting:
- When admin changes a color in customization sidebar, reflect instantly in preview.
- UX feature: when a specific color input is active/focused, temporarily highlight preview zones affected by that color using borders/dashed markers.

Initiate protocol. Use the create-plan skill now.
