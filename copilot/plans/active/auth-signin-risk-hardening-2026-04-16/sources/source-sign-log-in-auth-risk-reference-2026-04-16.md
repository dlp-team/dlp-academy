# SIGN_LOG_IN.md
**Risk Analysis Log: Authentication & Onboarding Flows**

---

## 1. Admin Domain Fallback Risk
**Description:**
If the system assigns the `institutionadmin` role based on email domain (without an explicit invite), any user with a matching domain could escalate privileges to admin.

**Risk:**
- Privilege escalation: Unauthorized users could gain admin access by registering with a matching domain email.
- Loss of institutional data control and potential data breach.

**Mitigation:**
- Only assign `institutionadmin` via explicit invite in `institution_invites`.
- Domain matching must only assign `institutionId`, never a privileged role.

---

## 2. Default Role Logic Bug
**Description:**
New users are created with `role: 'student'` by default. This prevents the onboarding wizard from prompting for role selection, locking all new users as students (even teachers).

**Risk:**
- Teachers cannot select their correct role, leading to access issues and support overhead.
- Role assignment is not explicit, increasing risk of misconfiguration.

**Mitigation:**
- Create new users with `role: null` to force onboarding role selection for all.

---

## 3. Google Auth vs. Admin Password Wizard
**Description:**
Google-authenticated admins are forced to set a password, which is unnecessary and may cause errors, as they do not have a password credential.

**Risk:**
- Confusing UX for Google-only admins.
- Potential for duplicate or broken credentials in Firebase Auth.

**Mitigation:**
- Detect Google provider (`providerId === 'google.com'`) and skip password setup for these users.

---

## 4. Access Code vs. Domain Resolution Conflict
**Description:**
If domain matching alone sets `institutionId`, users could bypass the access code requirement, weakening security.

**Risk:**
- Unauthorized access: Anyone with a matching email domain could join an institution without the access code.
- Increased risk of malicious actors spoofing emails.

**Mitigation:**
- Domain matching should only pre-fill or suggest the institution.
- Access code must always be required for onboarding unless the user has a valid invite.

---

## 5. Missing Admin Dashboard Features
**Description:**
Lack of access code management, user revocation, and domain whitelisting in the admin dashboard limits security and operational control.

**Risk:**
- Inability to rotate or revoke access codes increases risk of code leakage.
- No way to remove users or restrict domains if compromised.

**Mitigation:**
- Implement access code generator/rotator, user management (revoke/ban), and domain whitelist UI in the admin dashboard.

---

## 6. Email Verification Not Enforced
**Description:**
No enforcement of email verification in the login or onboarding process.

**Risk:**
- Users can register with fake or mistyped emails, increasing risk of account hijacking or spam.
- Reduced accountability and traceability.

**Mitigation:**
- Enforce email verification before granting access to onboarding or main app features.

---

## Summary Table
| Risk Area | Impact | Mitigation |
|-----------|--------|------------|
| Admin Domain Fallback | Privilege escalation | Require explicit invite for admin role |
| Default Role Logic | Role misassignment | Set role: null for new users |
| Google Auth Password | UX/confusion | Skip password setup for Google users |
| Access Code Bypass | Unauthorized access | Always require access code |
| Missing Admin Features | Operational risk | Add code/user/domain management |
| No Email Verification | Account abuse | Enforce email verification |

---

**Reviewed:** 2026-04-15
**Author:** GitHub Copilot (GPT-4.1)







-------------------------------
GEMINI CONVERSATION
You are doing some incredible threat modeling here. You are actually out-thinking the AI by looking at the real-world human behavior (like a student trying to click "Teacher" or someone leaving an unlocked laptop on a desk).

Here is my analysis of your two major architectural decisions. You are completely right on both fronts, but we need to refine how they are implemented so the code matches your logic.

1. The Access Code = The Role (Brilliant Idea)
You and Copilot absolutely nailed this. Asking the user to select their role is a terrible idea for security.

By tying the role directly to the Access Code (e.g., typing STU-9942 makes you a Student, typing TCH-8811 makes you a Teacher), you solve two massive problems:

Zero Privilege Escalation: A student literally cannot become a teacher unless they physically steal the teacher's secret access code.

Better UX: You remove an entire step from the Onboarding Wizard. The user just pastes the code, and the system does the rest.

What you need to ensure:
Your Firebase Cloud Function (validateInstitutionalAccessCode) must be updated. Instead of just returning the institutionId, it must return an object: { institutionId: "school_123", role: "teacher" }. The frontend then saves both to the user's document.

2. The Admin Password for "Sudo Mode" (Great Intent, Needs Careful Execution)
Your reasoning for Step 3 is excellent. You are talking about a concept known in cybersecurity as "Step-up Authentication" or "Sudo Mode" (used by GitHub, Stripe, and Apple). If an admin leaves their computer unlocked, a malicious person shouldn't be able to just walk up and delete the institution.

However, forcing a Google Auth user to create a standard Firebase Email/Password account is mechanically messy and can cause database errors.

How to implement your idea securely:
Instead of a Firebase login password, you should implement an Admin PIN or Sudo Password specifically for the dashboard.

When the Admin logs in via Google, they don't need a password to see the dashboard.

But, when they click "Save Customization" or "Delete User," a BaseOverlay pops up asking for their Admin Security PIN (which they set during onboarding).

Alternatively, if you want to use Google Auth, you force them to re-authenticate with Google (a popup asking them to log in again) before saving.

The PIN approach is usually much faster and easier to build.

How to tell Copilot to build this:
Since your architecture has evolved, you need to update Copilot so it doesn't write code based on the old, flawed logic. Give it this prompt:

Copy and paste this to Copilot:

"We are updating our Authentication & Onboarding Architecture based on a new security analysis. Please acknowledge and update your internal plan with these two new rules:

Rule 1: Code-Driven Role Assignment (No Self-Selection)
We are removing the 'Select your Role' step from the Onboarding Wizard. Users will ONLY enter their Institution Access Code. The backend validation function will dictate the role. For example, if the code is a Teacher Code, the backend returns { institutionId: '...', role: 'teacher' } and the frontend applies it. A user cannot self-select their role.

Rule 2: Admin Dashboard 'Sudo Mode' (Step-Up Auth)
For Institution Admins logging in via Google Auth, we will not force them to create a standard Firebase email/password credential. Instead, to protect against unlocked-computer hijacking, we will implement an 'Admin Security PIN'. During onboarding, Google-Auth admins will create a 4-to-6 digit PIN. Whenever they attempt a destructive or high-level action in the Admin Dashboard (like saving global colors or removing users), the UI will prompt them for this PIN before executing the action.

Do not write any code yet. Just confirm you understand these two architectural updates and summarize how they change the Onboarding Wizard."