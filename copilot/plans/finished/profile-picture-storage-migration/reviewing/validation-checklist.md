// copilot/plans/todo/profile-picture-storage-migration/reviewing/validation-checklist.md

# Validation Checklist: Profile Picture Storage Migration

## Upload Logic
- [ ] File size limit enforced (2MB)
- [ ] Spanish error/info text shown near upload element
- [ ] No browser alerts used
- [ ] Upload to Firebase Storage succeeds

## Firestore Update
- [ ] Download URL saved in Firestore
- [ ] No image data stored in Firestore

## Display Logic
- [ ] Profile picture displays from Storage URL
- [ ] Fallback to initials if no image

## Validation
- [ ] All flows tested for Admin, Institution Admin, Teacher, Student
- [ ] Edge cases (oversized file, upload failure) handled gracefully

## Documentation
- [ ] Codebase explanations updated
- [ ] Lossless report created
