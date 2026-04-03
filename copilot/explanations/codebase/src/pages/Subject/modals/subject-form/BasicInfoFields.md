# BasicInfoFields.tsx

## Changelog
### 2026-04-03: Selector de curso con `courseId` y compatibilidad legacy
- El `<select>` ahora usa `course.id` como valor interno para eliminar ambigüedad cuando existen nombres de curso repetidos en distintos años académicos.
- Al cambiar de opción, sincroniza ambos campos en `formData`: `courseId` (id) y `course` (nombre visible).
- Si el curso guardado ya no existe en la institución, renderiza una opción deshabilitada `(curso no disponible)` para mantener contexto sin romper la edición.

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
- **Source file:** `src/pages/Subject/modals/subject-form/BasicInfoFields.tsx`
- **Last documented:** 2026-02-24
- **Role:** Modal/dialog UI used for create, edit, confirm, or detail flows.

## Responsibilities
- Provides structure and behavior required by its page/module context.

## Exports
- `default BasicInfoFields`

## Main Dependencies
- `react`
- `../../../../utils/courseLabelUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
