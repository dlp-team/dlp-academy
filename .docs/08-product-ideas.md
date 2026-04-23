# 08 — Product Ideas & Future Roadmap

> This is the "dream list" — ideas for features and improvements that could make DLP Academy significantly better. Items here are not committed or planned. They are captured so we don't forget them.

---

## High-Impact Feature Ideas

### 1. Student Progress Dashboard
**Problem:** Students have no way to see their overall progress across all subjects at once.  
**Idea:** A dedicated "Mi Progreso" page that shows:
- Topics completed vs total per subject
- Quiz scores and trends over time
- Documents viewed
- Overall engagement score

### 2. Grade Book for Teachers
**Problem:** Teachers can see individual quiz results but have no aggregate view.  
**Idea:** A "Calificaciones" page showing a grid of students vs quizzes with scores. Exportable as CSV.

### 3. Attendance Tracking
**Problem:** No way to mark or track student attendance.  
**Idea:** Teachers can take attendance per class session. Students see their own attendance record.

### 4. Notifications System
**Problem:** Users aren't notified of new content, quiz availability, or grades.  
**Idea:** In-app notification bell + optional email notifications for:
- New topic published
- New quiz available
- Quiz result available
- New student joined subject (teacher)
- New teacher added (admin)

### 5. Quiz Retry Policy
**Problem:** Students can't retry a quiz after submitting.  
**Idea:** Teachers can configure: max attempts, cooldown period between attempts, whether to show previous answers.

### 6. Bulk Student Import
**Problem:** Adding 30 students to a class one-by-one is painful.  
**Idea:** CSV import in the Organization tab — upload a CSV of emails, they get added to the class automatically.

### 7. Academic Calendar Integration
**Problem:** The academic calendar settings tab exists but has no effect.  
**Idea:** Academic calendar controls when content is "active". Topics outside the current period are dimmed/locked for students.

### 8. Content Types Expansion
**Problem:** Only PDF files and quizzes are supported.  
**Idea:** Support for:
- YouTube/video embed links
- External reading links (URL)
- Image galleries
- Audio files
- Slideshows (in-browser presentation viewer)

### 9. Subject Archive / Academic Year Management
**Problem:** At end of year, subjects are either kept active or deleted — no middle ground.  
**Idea:** Archive subjects at end of academic period. Archived subjects are frozen (read-only) but accessible for reference. New year = duplicate subject and start fresh.

### 10. Student Notes
**Problem:** Students have no way to take notes while viewing content.  
**Idea:** Per-topic private notes that students can write and save. Only visible to the student.

---

## Institution Admin Feature Ideas

### 11. User Export
Export all teachers/students in CSV format with: name, email, role, join date, last active.

### 12. Audit Log
A timestamped log of admin actions: who invited whom, settings changes, user removals, access code regenerations.

### 13. Institution Analytics Dashboard
- Active users this week/month
- Most-used subjects
- Quiz completion rates
- Student engagement metrics

### 14. Multi-Language Support
Allow institution admins to configure the interface language. Priority: English, Spanish, Portuguese.

### 15. Custom Domain / SSO
Allow institutions to configure their own subdomain (e.g., `mi-escuela.dlpacademy.com`) and optionally integrate SSO via Google Workspace or Microsoft Azure AD.

---

## Teacher Feature Ideas

### 16. AI Content Generation
**Idea:** A teacher can provide a topic name and a document/text, and the platform uses AI to generate:
- A structured topic summary
- 5–10 quiz questions with answers

### 17. Lesson Planning Calendar
A calendar view where teachers plan when each topic is to be covered. Students can see what's coming up.

### 18. Discussion Boards
Per-topic discussion threads where students can ask questions and teachers can answer. Moderated.

### 19. Peer Review Quizzes
Teachers can create open-ended questions that students answer in text form, then peer-review each other's answers (rubric-based).

---

## Student Feature Ideas

### 20. Subject Discovery
Students can browse other subjects available in their institution and request enrollment (teacher must approve).

### 21. Study Mode
A "Study Mode" that hides navigation and shows just the topic content fullscreen, minimizing distractions.

### 22. Bookmarks
Students can bookmark specific topics or documents for quick access.

### 23. Quiz Review Mode
After a quiz, students can review each question with the correct answer highlighted and an optional explanation from the teacher.

---

## Platform / Infrastructure Ideas

### 24. Mobile App (React Native)
A native mobile app for students to access content and take quizzes offline.

### 25. White-Label Customization
Full white-label support: custom domain, logo, colors, and removal of "DLP Academy" branding for institutional clients.

### 26. API for Integration
A REST or GraphQL API that institutions can use to integrate DLP Academy with their existing SIS (Student Information Systems) or HR tools.

### 27. LMS Integration (LTI)
Support for LTI (Learning Tools Interoperability) standard to integrate with Canvas, Moodle, or Blackboard.

---

## Ideas Under Consideration (Near-Term)

These are closer to being planned:

| Idea | Priority | Notes |
|------|----------|-------|
| Regenerate institutional access code | HIGH | Basic security hygiene |
| Cancel pending teacher invite | HIGH | Admin usability |
| Subject invite code enable/disable | HIGH | Teacher control |
| Student-facing branding application | HIGH | Customization should extend to students |
| Quiz result shown to student after submission | HIGH | Currently unclear if implemented |
| Remove user from institution | MEDIUM | Admin control |
| Topic reordering | MEDIUM | Teacher UX |
| Class roster view | MEDIUM | Admin visibility |
| PDF in-browser preview | MEDIUM | Student UX |

---

## Last Updated

*2026-04-23 — Initial creation*
