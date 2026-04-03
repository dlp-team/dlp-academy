# BasicInfoFields.jsx

## Changelog
### 2026-04-03: Etiquetas de curso con año académico en selector
- Reused shared `courseLabelUtils` formatter for course `<option>` labels.
- Keeps stored value compatibility (`course.name`) while displaying `Nombre (AAAA-AAAA)` to reduce ambiguity when duplicate course names exist across years.

### 2026-03-12: Curso desde Firestore (institución)
- Replaced the `level` + `grade` selector pair with a single `course` selector.
- Added support for `availableCourses`, `coursesLoading`, and `courseSelectRef` props.
- Selector now lists real courses created in Firestore for the current institution.
- Added empty-state helper text when there are no available institution courses.

### 2026-03-09: Inline required validation visuals
- Added support for `validationErrors` and `setValidationErrors` props.
- Added refs for name/level/grade controls to support focused error recovery from parent modal.
- Applies red borders and `Campo obligatorio.` helper text for missing required fields.

## Overview
- **Source file:** `src/pages/Subject/modals/subject-form/BasicInfoFields.jsx`
- **Last documented:** 2026-02-24
- **Role:** Modal/dialog UI used for create, edit, confirm, or detail flows.

## Responsibilities
- Provides structure and behavior required by its page/module context.

## Exports
- `default BasicInfoFields`

## Main Dependencies
- `react`
- `../../../../utils/subjectConstants`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
