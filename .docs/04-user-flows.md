# 04 — User Flows

> Step-by-step journeys for each role. Each flow describes the expected experience from the user's perspective — what they see, what they do, and what the system does in response.

---

## Flow 1: Institution Setup (Global Admin)

**Actor:** Global Admin  
**Goal:** Provision a new institution and set up its first admin

1. Global admin logs in at `/login`
2. Lands on global admin dashboard
3. Clicks "Nueva Institución" (or equivalent)
4. Fills in institution details: name, domain, type, city, country
5. Submits — institution created in Firestore, appears in list immediately
6. Opens the new institution's detail view
7. Navigates to "Invitar administrador"
8. Enters the institution admin's email address
9. Submits — invite code generated, stored in `institution_invites`
10. Sets an institutional access code for student self-registration (or auto-generated)
11. Shares the access code and invite link with the institution admin via email (outside app)
12. Logs out

---

## Flow 2: Institution Admin Onboarding

**Actor:** Institution Admin (new user)  
**Goal:** Join the institution, configure it, and start inviting staff

1. Receives email from Global Admin with invite code
2. Navigates to `/register`
3. Selects "Administrador" user type
4. Fills in personal data + invite code
5. Submits — Firebase Auth user created, Firestore user doc created
6. Redirected to `/verify-email` — verifies email by clicking link
7. Logs in at `/login`
8. Lands on institution admin dashboard (`/institution-admin-dashboard`)
9. **First action — Branding:** Goes to Personalización tab, sets institution name, primary/secondary colors, uploads logo
10. **Second action — Settings:** Goes to Configuración tab, configures policies (teacher subject creation, academic calendar, automations)
11. **Third action — Invite Teachers:** Goes to Usuarios tab, clicks "Invitar Profesor", enters teacher email, submits
12. Shares invite code with teacher via email (outside app)
13. **Fourth action — Invite more teachers** as needed
14. Dashboard is ready for use

---

## Flow 3: Teacher Onboarding and First Subject

**Actor:** Teacher (new user)  
**Goal:** Join the institution, create a subject, add content

1. Receives email from Institution Admin with invite code
2. Navigates to `/register`
3. Selects "Profesor" user type
4. Fills in personal data + invite code
5. Submits — Firebase Auth user created, Firestore user doc created with `role: 'teacher'`
6. Verifies email
7. Logs in — lands on home page with teacher panel
8. Clicks "Nueva Asignatura" (or equivalent)
9. Fills in: subject name, description (optional), course level
10. Submits — subject created with auto-generated invite code
11. Subject appears on home page as a card
12. Clicks on subject — enters subject view
13. Creates first topic: "Tema 1 — Introducción"
14. Opens the topic
15. Uploads a PDF document
16. Creates a quiz with 5 questions
17. Subject is now ready for students

---

## Flow 4: Student Onboarding via Institutional Code

**Actor:** Student (new user)  
**Goal:** Join the institution and access their subjects

1. Receives institutional access code from teacher/admin (outside app)
2. Navigates to `/register`
3. Selects "Estudiante" user type
4. Fills in personal data + institutional access code
5. Submits — Firebase Auth user created, Firestore user doc with `role: 'student'`, `institutionId` set
6. Verifies email
7. Logs in — lands on home page with student panel
8. Sees message: "No tienes asignaturas aún" (if not in a class yet)
9. Once added to a class by Institution Admin → subjects linked to that class appear
10. Clicks on a subject — enters subject view
11. Sees topics list
12. Opens a topic, views a document
13. Takes a quiz
14. Sees their result

---

## Flow 5: Student Self-Enrollment via Subject Invite Code

**Actor:** Student (already registered at an institution)  
**Goal:** Enroll in an additional subject not assigned via class

1. Receives subject invite code from teacher (outside app)
2. Logs in to the app
3. On home page, finds "Unirse a asignatura" or equivalent button
4. Enters the subject invite code
5. Submits — student added to `subjects/{id}.enrolledStudentUids`
6. Subject now appears in student's home page

---

## Flow 6: Class Setup (Institution Admin)

**Actor:** Institution Admin  
**Goal:** Create a class, assign students, teacher, and subject

1. Logs in to institution admin dashboard
2. Goes to Organization tab
3. Clicks "Nueva Clase"
4. Enters class name (e.g., "1ro Secundaria A")
5. Submits — class created in Firestore
6. Opens class detail
7. Adds students: selects from list of registered students
8. Assigns teacher: selects from list of teachers
9. Links subject: selects from list of subjects in the institution
10. Saves — `classes/{id}.studentIds` updated, subject `classIds` updated
11. Students in the class can now access the linked subject

---

## Flow 7: Student Takes a Quiz

**Actor:** Student (enrolled in a subject)  
**Goal:** Take a quiz in a topic and see their result

1. Logs in — sees subjects on home page
2. Clicks on a subject
3. Sees list of topics
4. Clicks on a topic
5. Sees quiz card in the topic
6. Clicks "Comenzar quiz"
7. Reads each question, selects answers
8. Clicks "Enviar respuestas"
9. Result screen shows: score, correct answers vs total
10. Student can review which questions they got right/wrong
11. Result saved in Firestore `quiz_results` with their UID

---

## Flow 8: Teacher Reviews Student Performance

**Actor:** Teacher  
**Goal:** See which students have taken the quiz and their scores

1. Logs in — sees their subjects on home page
2. Opens a subject
3. Opens a topic that has a quiz
4. Opens the quiz
5. Sees list of students who have taken the quiz with scores
6. Can click on a student to see their individual answers (if implemented)

---

## Flow 9: Institution Admin Views Institution Status

**Actor:** Institution Admin  
**Goal:** Quick status check of the institution

1. Logs in — institution admin dashboard
2. Users tab: sees count of active teachers and students
3. Organization tab: sees classes with student counts
4. Checks no pending invites are old/expired
5. Verifies branding is applied correctly

---

## Last Updated

*2026-04-23 — Initial creation*
