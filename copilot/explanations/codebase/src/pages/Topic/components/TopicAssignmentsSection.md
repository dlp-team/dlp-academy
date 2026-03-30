// copilot/explanations/codebase/src/pages/Topic/components/TopicAssignmentsSection.md

# TopicAssignmentsSection.jsx

## Overview
- Source file: `src/pages/Topic/components/TopicAssignmentsSection.jsx`
- Role: Topic tab section for creating/managing assignments and student delivery status.

## Responsibilities
- Creates assignment documents in `topicAssignments`.
- Uploads and stores instruction attachments for each assignment.
- Updates assignment visibility and late-delivery flags.
- Tracks and writes per-student deliveries in `topicAssignmentSubmissions`.
- Supports student delivery attachments and optional delivery comments.
- Shows role-aware UI: management controls for editors, delivery toggle for students.

## Changelog
- 2026-03-29: Added assignment-instruction file attachments (multi-file upload to Storage with metadata persisted in `instructionFiles`).
- 2026-03-29: Added student delivery files + optional note (`submissionFiles`, `note`) with per-assignment upload UI and delivered-file links.
- 2026-03-29: Added client-side attachment constraints (max 5 files, max 20MB each) and clear rejection feedback.
- 2026-03-29: Added institution resolution fallback (user -> subject -> topic) before assignment creation to avoid permission-denied writes when `user.institutionId` is missing.
- 2026-03-29: Assignment create payload now includes stable metadata (`institutionId`, `ownerId`, `createdBy`) aligned with root-collection Firestore rules.
- 2026-03-29: Submission payload now includes `institutionId` for consistent downstream reads/analytics.
