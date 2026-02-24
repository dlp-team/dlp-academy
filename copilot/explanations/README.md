# Explanations Directory Organization Strategy

## 1. Purpose
This folder contains automated, AI-generated explanations of the codebase's evolution. It acts as living documentation for the Learning Management & Study Organization Platform.

## 2. Dual-Architecture Strategy

### A. The `codebase/` Directory (Permanent Mirror)
This directory must **strictly mirror** the actual project file tree (e.g., `src/pages/`, `src/hooks/`, `src/components/`).
* **Naming:** Files are the `.md` equivalents of the actual code files (e.g., modifying `src/pages/AdminDashboard/AdminDashboard.jsx` requires updating `copilot/explanations/codebase/src/pages/AdminDashboard/AdminDashboard.md`).
* **Updating Rules:** Do not overwrite the file. Update the relevant sections to reflect the current state of the file, and append a changelog entry at the bottom with the date and what was modified. This file should always represent the *current* state of the code.

### B. The `temporal/` Directory (Session-Based Workspace)
This directory holds short-lived, domain-driven explanations for the current working session. 
* **Organization:** Grouped by Domain/Feature (e.g., `/temporal/admin/`, `/temporal/study-content/`).
* **Naming:** Named after the specific task or feature update (e.g., `temporal/admin/adding-pagination-and-filters.md`).
* **Lifecycle:** These files contain the immediate "Previous State vs. New State" breakdown. They are ephemeral. Copilot is instructed to ask the user to delete old files here when starting a new session or topic.

## 3. Content Requirements
When writing to these files, ensure you:
* Reference specific custom hooks (`/src/hooks/...`).
* Explain Firebase query updates (e.g., `limit()`, `startAfter()`) and their impact on database reads.
* Clearly specify the relative paths for where the explanation is being saved.

## 4. Document Updating Rules
If modifying a feature that already has an explanation file in this directory, **do not overwrite the file**. Instead, append a new section at the top of the file with the current date, the change made, and the Mode 3 In-Depth explanation. 

**Format for Appending:**
```markdown
## [YYYY-MM-DD] Feature Update: [Brief Title]
### Context & Architecture
...
### Previous State
...
### New State & Logic
...
---