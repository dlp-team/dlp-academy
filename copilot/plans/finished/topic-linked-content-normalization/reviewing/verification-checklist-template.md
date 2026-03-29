<!-- copilot/plans/todo/topic-linked-content-normalization/reviewing/verification-checklist-template.md -->
# Verification Checklist Template

Use this template when the plan moves to `inReview`.

## Functional Consistency

- [ ] Topic page loads documents from `documents` by `topicId`.
- [ ] Topic page loads quizzes from `quizzes` by `topicId`.
- [ ] Topic page loads exams from `exams` by `topicId`.
- [ ] Topic status/completion logic does not depend on embedded arrays.

## Data Integrity

- [ ] No active records rely on `topicid` or `topic_id` for app-critical flows.
- [ ] Root content docs include `topicId`, `subjectId`, `ownerId`, `institutionId`.
- [ ] Topic docs do not contain embedded duplicate child arrays.

## Security and Tenant Boundaries

- [ ] `/exams` rules enforce tenant/ownership constraints via topic linkage.
- [ ] Read/write checks are consistent with `documents` and `quizzes` rules.

## Migration Safety

- [ ] Dry-run migration report reviewed.
- [ ] Live migration report reviewed.
- [ ] Rollback procedure documented and tested.

## App Quality Gate

- [ ] `get_errors` clean for all touched files.
- [ ] Smoke tests pass for Topic, Quiz, and Exam navigation.
- [ ] No regression in Home/Subject/Folder organization behavior.
