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
