# 01 — Product Vision

> **DLP Academy** — A Learning Management & Study Organization Platform for educational institutions.

---

## What Is DLP Academy?

DLP Academy is a **web-based platform** that enables educational institutions — schools, academies, universities, tutoring centers — to manage their academic content, teachers, students, and courses in one place.

It is designed to be **multi-institution**: every institution operates as its own isolated tenant, with its own teachers, students, subjects, classes, branding, and configuration. No institution can see or access data from another institution.

---

## Mission

> Empower educational institutions to organize, share, and track learning — simply, securely, and without technical overhead.

---

## Core Value Propositions

### For Institution Admins
- Full control over who teaches and who studies at their institution
- Easy onboarding for teachers (invite codes) and students (access codes)
- Customizable branding so the platform feels like their own
- Configuration of policies and permissions to match their workflows

### For Teachers
- Create and organize subjects/courses without institutional IT overhead
- Structure content into topics, upload documents, create quizzes
- Share subjects with students via invite codes
- See which students are enrolled and how they're performing

### For Students
- Access their subjects and study materials in one organized place
- Take quizzes and track their progress
- Clear and simple interface that focuses on learning

---

## Design Philosophy

1. **Multi-tenancy by default** — Every data operation is scoped to an institution. There is no global shared content space.

2. **Role-based simplicity** — Users have exactly one active role at a time. Roles determine what they can see and do. The system never shows elements users don't have permission to use.

3. **Invite-based trust** — No one joins an institution without an invitation. Students use institution access codes. Teachers use direct invite codes. This ensures every user is verified before entering.

4. **Content ownership** — Teachers own their subjects. Students access content but cannot modify it. Institution admins have oversight over all content within their institution.

5. **Progressive disclosure** — The UI shows only what's relevant for the current user role. A student does not see admin controls. A teacher does not see system admin controls.

---

## Who This Is For

### Primary Users
- **Educational institutions** that want a managed, private learning environment
- **Teachers** who want a structured way to share content and evaluate students
- **Students** who want organized access to their course materials

### NOT Designed For
- Open/public course platforms (like Udemy or Coursera) — DLP Academy is institution-gated
- Real-time collaboration (Google Docs style) — it is document-based content delivery
- Social learning networks — there are no public profiles or community feeds

---

## Success Criteria

A DLP Academy deployment is successful when:
- An institution can provision itself end-to-end without technical support
- Teachers can create and publish content within minutes of onboarding
- Students can access their materials and complete quizzes on day one
- Institution admins have full visibility and control over their institution
- No user can access data that isn't theirs

---

## Last Updated

*2026-04-23 — Initial creation*
