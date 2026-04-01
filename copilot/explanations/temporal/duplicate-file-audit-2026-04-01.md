# Duplicate File Audit - 2026-04-01

## Summary
- JSX/TSX duplicate basename pairs: 41
- JS/TS duplicate basename pairs: 6
- New or added duplicate files currently present in git state: 47

## New or Added Duplicate Files (47)
- src/components/layout/Header.jsx -> src/components/layout/Header.tsx
- src/components/modals/CreateContentModal.jsx -> src/components/modals/CreateContentModal.tsx
- src/components/modals/FolderTreeModal.jsx -> src/components/modals/FolderTreeModal.tsx
- src/components/modules/FolderCard/FolderCardBody.jsx -> src/components/modules/FolderCard/FolderCardBody.tsx
- src/components/modules/FolderCard/useFolderCardLogic.js -> src/components/modules/FolderCard/useFolderCardLogic.ts
- src/components/modules/ListItems/FolderListItem.jsx -> src/components/modules/ListItems/FolderListItem.tsx
- src/components/modules/ListItems/SubjectListItem.jsx -> src/components/modules/ListItems/SubjectListItem.tsx
- src/components/modules/QuizEngine/QuizCommon.jsx -> src/components/modules/QuizEngine/QuizCommon.tsx
- src/components/modules/QuizEngine/QuizFeedback.jsx -> src/components/modules/QuizEngine/QuizFeedback.tsx
- src/components/modules/SubjectCard/SubjectCardFront.jsx -> src/components/modules/SubjectCard/SubjectCardFront.tsx
- src/components/modules/TopicCard/TopicCard.jsx -> src/components/modules/TopicCard/TopicCard.tsx
- src/components/ui/FutureMailBox.jsx -> src/components/ui/FutureMailBox.tsx
- src/components/ui/MailboxIcon.jsx -> src/components/ui/MailboxIcon.tsx
- src/firebase/config.js -> src/firebase/config.ts
- src/pages/Auth/Login.jsx -> src/pages/Auth/Login.tsx
- src/pages/Content/Exam.jsx -> src/pages/Content/Exam.tsx
- src/pages/Content/StudyGuide.jsx -> src/pages/Content/StudyGuide.tsx
- src/pages/Content/StudyGuideEditor.jsx -> src/pages/Content/StudyGuideEditor.tsx
- src/pages/Home/components/HomeContent.jsx -> src/pages/Home/components/HomeContent.tsx
- src/pages/Home/components/HomeControls.jsx -> src/pages/Home/components/HomeControls.tsx
- src/pages/Home/components/HomeSelectionToolbar.jsx -> src/pages/Home/components/HomeSelectionToolbar.tsx
- src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.jsx -> src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx
- src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.jsx -> src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.tsx
- src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.js -> src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts
- src/pages/InstitutionAdminDashboard/hooks/useCustomization.js -> src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts
- src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx -> src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx
- src/pages/Onboarding/components/OnboardingWizard.jsx -> src/pages/Onboarding/components/OnboardingWizard.tsx
- src/pages/Profile/components/FinalGrades.jsx -> src/pages/Profile/components/FinalGrades.tsx
- src/pages/Profile/components/MiniStatsChart.jsx -> src/pages/Profile/components/MiniStatsChart.tsx
- src/pages/Profile/components/Notas.jsx -> src/pages/Profile/components/Notas.tsx
- src/pages/Quizzes/hooks/useQuizzesLogic.js -> src/pages/Quizzes/hooks/useQuizzesLogic.ts
- src/pages/Quizzes/QuizRepaso.jsx -> src/pages/Quizzes/QuizRepaso.tsx
- src/pages/Quizzes/Quizzes.jsx -> src/pages/Quizzes/Quizzes.tsx
- src/pages/Settings/components/AppearanceSection.jsx -> src/pages/Settings/components/AppearanceSection.tsx
- src/pages/Subject/components/SubjectHeader.jsx -> src/pages/Subject/components/SubjectHeader.tsx
- src/pages/Subject/components/TopicGrid.jsx -> src/pages/Subject/components/TopicGrid.tsx
- src/pages/Subject/modals/EditTopicModal.jsx -> src/pages/Subject/modals/EditTopicModal.tsx
- src/pages/Subject/modals/PositionModal.jsx -> src/pages/Subject/modals/PositionModal.tsx
- src/pages/Subject/modals/SubjectFormModal.jsx -> src/pages/Subject/modals/SubjectFormModal.tsx
- src/pages/Subject/modals/SubjectTestModal.jsx -> src/pages/Subject/modals/SubjectTestModal.tsx
- src/pages/Subject/modals/TopicFormModal.jsx -> src/pages/Subject/modals/TopicFormModal.tsx
- src/pages/TeacherDashboard/components/ExamCorrectionTool.jsx -> src/pages/TeacherDashboard/components/ExamCorrectionTool.tsx
- src/pages/Topic/components/QuizClassResultsModal.jsx -> src/pages/Topic/components/QuizClassResultsModal.tsx
- src/pages/Topic/components/TopicContent.jsx -> src/pages/Topic/components/TopicContent.tsx
- src/pages/Topic/ExamCard/ExamCard.jsx -> src/pages/Topic/ExamCard/ExamCard.tsx
- src/pages/Topic/FileCard/FileCard.jsx -> src/pages/Topic/FileCard/FileCard.tsx
- src/utils/subjectConstants.js -> src/utils/subjectConstants.ts

## Explicit Import Collision Risk (evidence)
- src/main.tsx imports App with explicit .jsx extension.
- src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx imports multiple explicit .js and .jsx modules.

These explicit extension imports force duplicate JS/JSX resolution paths even when TS/TSX counterparts exist.
