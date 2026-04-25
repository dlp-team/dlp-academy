# 06 — Content System

> This document describes how academic content is organized, created, and accessed in DLP Academy.

---

## Content Hierarchy

```
Subject (Asignatura)
  ├── [Optional] Folders/Sections (future feature)
  └── Topics (Temas)
        ├── Documents (Documentos)
        └── Quizzes (Cuestionarios)
              └── Quiz Results (per student)
```

---

## Subject (Asignatura)

### What It Is
The top-level academic unit. A subject represents a course, class, or study module. Examples: "Matemáticas I", "Historia Universal", "Inglés B2".

### Who Creates It
- Teachers (if `allowTeacherAutonomousSubjectCreation` policy is enabled)
- Institution Admins (always)

### Key Properties
| Property | Description |
|----------|-------------|
| `name` | Subject name (required) |
| `description` | Optional description |
| `ownerId` | UID of the creating teacher/admin |
| `institutionId` | Institution this subject belongs to |
| `inviteCode` | 8-char code for student self-enrollment |
| `inviteCodeEnabled` | Whether self-enrollment is active |
| `classIds` | Classes linked to this subject (grants class students access) |
| `enrolledStudentUids` | Students who self-enrolled via invite code |
| `topicCount` | Count of topics (auto-incremented) |
| `createdAt` | Creation timestamp |

### Subject Invite Code
- Auto-generated on creation using a safe alphabet (no I, O, 0, 1)
- Stored atomically in `subjectInviteCodes/{code}` to prevent collisions
- Used for student self-enrollment (when enabled)
- Should be rotatable by the teacher

### How Students Get Access
1. **Via class:** Institution admin links subject to a class → all students in the class gain access
2. **Via invite code:** Student manually enters the subject invite code on the home page

---

## Topic (Tema)

### What It Is
A numbered unit within a subject. Topics organize the subject's content into logical segments. Example: "Tema 01 — Álgebra Básica", "Tema 02 — Geometría".

### Who Creates It
- Teachers (in their own subjects)
- Institution Admins (in any subject within their institution)

### Key Properties
| Property | Description |
|----------|-------------|
| `name` | Topic name |
| `number` | Zero-padded number string (e.g., `'01'`, `'02'`) |
| `order` | Integer sort order |
| `subjectId` | Parent subject reference |
| `ownerId` | Creator UID |
| `institutionId` | Institution scope |
| `status` | `'active'` or `'generating'` (if AI-assisted in future) |

### Topic Ordering
Topics must always display in order. When a new topic is created, its `order` and `number` are assigned based on the current count. Reordering is a planned feature.

---

## Document (Documento)

### What It Is
A file resource attached to a topic. Currently supports file uploads (PDFs, etc.). Future support for links, video, and images.

### Who Creates It
- Teachers (in their own topics)

### Key Properties
| Property | Description |
|----------|-------------|
| Stored in | `topics/{topicId}/documents/{docId}` |
| `name` | Display name of the document |
| `url` | Firebase Storage download URL |
| `fileType` | MIME type or file extension |
| `uploadedAt` | Timestamp |
| `uploadedBy` | Teacher UID |

### Storage Location
Files are stored in Firebase Storage. Access is controlled by Storage rules — only authenticated users from the same institution can access the file.

---

## Quiz (Cuestionario)

### What It Is
An assessment attached to a topic. A quiz contains multiple questions. Students take the quiz and their results are recorded.

### Who Creates It
- Teachers (in their own topics)

### Key Properties
| Property | Description |
|----------|-------------|
| Stored in | `topics/{topicId}/quizzes/{quizId}` |
| `title` | Quiz title |
| `questions` | Array of question objects |
| `createdBy` | Teacher UID |
| `createdAt` | Timestamp |

### Question Format
```json
{
  "text": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0
}
```

### Quiz Results
| Property | Description |
|----------|-------------|
| Stored in | `quiz_results/{resultId}` or subcollection |
| `uid` | Student UID |
| `quizId` | Reference to quiz |
| `subjectId` | Reference to subject |
| `score` | Number correct |
| `total` | Total questions |
| `answers` | Array of chosen indices |
| `submittedAt` | Timestamp |

### Quiz Access Rules
- **Students:** Can take the quiz, see their own result
- **Teachers:** Can see all students' results for quizzes in their subjects
- **Students cannot see:** Other students' results

---

## Content Visibility Rules

| Content | Who Can See It |
|---------|---------------|
| Subject | Creator + enrolled students (via class or invite code) + institution admin |
| Topics | Same as subject |
| Documents | Same as subject |
| Quiz | Same as subject |
| Quiz Results | Student sees own; teacher sees all; institution admin sees all |

---

## What Must Always Work

1. **Teacher creates topic → topicCount increments on subject** — must be atomic
2. **Teacher uploads document → file in Storage AND doc in Firestore** — both must succeed or both fail
3. **Student self-enrolls → added to `enrolledStudentUids`** — must be atomic to prevent race conditions
4. **Quiz submission → result saved before UI shows score** — must not show score if save failed
5. **Subject invite code collision → retry with new code** — atomic transaction in `subjectInviteCodes`

---

## What Must NEVER Happen

- A student from Institution A reads a subject from Institution B
- A student edits, deletes, or creates any content document
- A teacher edits another teacher's subject
- A quiz result is shown before the submission is confirmed saved
- Two subjects can have the same invite code simultaneously

---

## Last Updated

*2026-04-23 — Initial creation*
