# Phase 02 - Implementation (In Progress)

## Objective
Ensure all new documents and user records are created with `institutionId` set to the institutions document ID.

## Scope
- User registration and login flows
- Create paths for subjects, folders, shortcuts, classes, courses, allowed_teachers
- Teacher and admin dashboards creating scoped data

## Actions Completed
- Added institution resolution by email (allowed_teachers or domain match) on user register/login.
- Persist `institutionId` on new users and fill missing `institutionId` for existing users.
- Updated teacher dashboard queries to use `institutionId` (previously `schoolId`).

## Remaining Work
- Verify any remaining creation paths that do not stamp `institutionId`.
- Confirm institutionId stamping for topics/materials/quizzes relies on parent subject data.
- Validate onboarding does not overwrite `institutionId`.

## Risks
- Some users may not match any institution by email domain or allowed_teachers.
- Existing users without institutionId will remain unscoped until backfill.
