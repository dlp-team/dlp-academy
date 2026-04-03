Here is the optimized, highly structured prompt designed for Copilot. I have integrated your request to use the create-plan skill and clearly separated the complex "audit/research" tasks from the direct executable changes, ensuring Copilot generates the required summary and deep-dive files before touching the core course logic.

Copy and paste the text below into Copilot:

🤖 System Role & Execution Protocol
Role: You are an elite, deeply professional Principal Software Engineer. You are tasked with analyzing, debugging, and refactoring a large-scale, professional educational web application powered by AI.

Execution Protocol:
You must operate strictly under the following phased protocol.

Superficial Codebase Audit: Briefly scan the codebase to understand the architecture, state management, routing, and UI component structures.

Analysis & Dependency Mapping: Analyze all requested changes below. Map out how they connect (e.g., how the new academic year logic affects the UI, routing, and database schemas).

Plan Generation (create-plan skill): You MUST use the create-plan skill to generate a highly detailed execution plan. This plan must log the exact order of operations, security risks, file creations, and hook reuse strategies.

Research & Documentation (Pre-Execution): For the complex Course Lifecycle and Language Audit tasks, you must generate the requested markdown files before implementing their code.

Execution & Optimization: Execute the changes step-by-step. Ensure lossless changes. Apply linting, format the code, and ensure maximum optimization. Do not ask for clarification; make professional architectural decisions based on the constraints provided.

📋 Task Breakdown & Acceptance Criteria
Phase 1: Deep Architectural Audits & Documentation
Before writing code for the following features, you must perform deep analysis and generate specific files.

1. Course Lifecycle & Student Linking Audit:

Context: We need a robust way to link students to courses (e.g., CSV upload vs. manual), transition courses to the next academic year based on hierarchy (e.g., Primary -> ESO -> Bachillerato), and manage visibility states for these transitioned courses.

Action: Do NOT code this yet. Create two files:

course-lifecycle-summary.md: A high-level overview of the proposed architecture.

course-lifecycle-deep-dive.md: A detailed architectural document explaining edge cases, database schema changes (Firestore), automated cron-job/trigger logic for transitions, and the exact flow for CSV/manual student assignment.

2. i18n / Languages Audit:

Context: The app is currently in Spanish. We need to decide whether to implement native i18n (e.g., react-i18next) or rely on browser translation.

Action: Perform an audit of industry standards for professional educational platforms. Log your final recommendation and architectural approach in your plan.

Phase 2: Courses & Academic Year Structure (UI & Logic)
Institution Admin Dashboard - Courses Tab:

Group courses and classes into collapsible sections based on the Academic Year.

Add a start/end Academic Year filter (similar to the home page).

Naming & Linking:

Append the Academic Year to the course name automatically (e.g., 1º Bachillerato (2025-2026)) so it is easily identifiable in dropdowns.

Strict Rule: A Class's academic year must be immutably linked to its parent Course. Remove the ability to edit the academic year at the Class level.

When editing a Subject and assigning a Class, only show classes from that specific academic year.

Phase 3: Institution Admin Settings & Global Config
New Configuration Tab: Create a new "Settings/Configuration" section in the Institution Admin Dashboard.

Move Existing Settings: Move the existing toggles (teachers creating subjects without approval, assigning classes without permission, deleting subjects with students) into this new section.

Academic Year Timeline Config:

Allow admins to define the Start and End dates for the Academic Year.

Include options for "Ordinary" and "Extraordinary" period end dates.

Allow the year to be divided into Trimesters, Quadmesters, or Custom lengths.

Subject End-of-Life Policy:

Add a global setting dictating what happens when a course finishes:

Delete subjects.

Default: Maintain subjects (read-only for all, no new students).

Maintain subjects (read-only for teachers, completely unlinked/hidden for students).

Subject Creation & Lifecycle:

When a teacher creates a subject, making them select the Trimester/Quadmester is now mandatory.

Auto-Archiving Logic: When a subject's period passes, it must be removed from the "Manual" tab for passed students. However, it must remain active for the Teacher and failed students until the "Extraordinary" period concludes.

Add a Trimester/Quadmester filter to the Home page.

Phase 4: Bug Fixes & UI Replicas
Customization Live Preview 2.0:

Fix Fullscreen Bug: When clicking full screen, the screen goes black. Fix this z-index/rendering issue.

Exact Replica Accuracy: The mock preview is currently inaccurate for inner pages. Update the mock data/components so that navigating into a subject shows the exact real-world UI for topics, formulas, exams, and quizzes.

Notifications UI & Logic:

Fix Toggle Bug: Clicking the notification bell opens the dropdown. Clicking it again currently re-opens it instead of closing it. Fix the state toggle.

Dedicated Page: Create a dedicated /notifications route/page.

TTL/Cooldown: Implement an auto-delete mechanism (e.g., 1 week TTL) for standard notifications (new subject shared, study guide generated).

Email Sync: Link notifications to the user's email via an opt-in toggle in User Settings.

Phase 5: Selection Mode UI (Bin & Global)
Bin UI Synchronization: Update the selection mode border in the Bin to use the exact same component/hook as the main "Manual" tab for perfect consistency.

Visual Dimming (Global):

When any item is selected (in the Bin or Home), all unselected items must visually recede.

Constraint: Do NOT use CSS opacity for folders. Use filter: brightness() or filter: saturate() to achieve the dimming effect cleanly without breaking internal element visibility.

Sorting Labels: In the Bin, rename the sorting options explicitly to:

Urgencia: Ascendente

Urgencia: Descendente