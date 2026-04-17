# Phase 4 — Sign-In Email Verification

## Status: TODO

## Objective
Enforce email verification before a new user can access the web app. After registration, the user must verify their email address before the account is created/activated and before they can log in.

## Behavior Expected
1. User registers → Firebase sends verification email
2. User is NOT given access until they verify
3. If user tries to log in without verifying → show clear message prompting them to verify
4. Verified users: no change, login works normally
5. Resend verification email option should be available

## Risk Notes
- **High-risk change**: wrong implementation could lock out existing or new users
- Must preserve existing verified user login flow
- Must handle edge case: existing unverified users (should prompt to verify, not crash)
- Test thoroughly with emulator before considering done

## Files Likely Touched
- `src/firebase/auth.ts` or auth helper
- `src/pages/Auth/` — sign-in, register, email verification pages
- `src/App.tsx` or router guard — conditional route access
- Possibly Firebase Functions if server-side verification is needed

## Acceptance Criteria
- [ ] New user registration triggers email verification email
- [ ] Unverified users cannot access the app; they see a verification prompt
- [ ] Resend verification email button available
- [ ] Verified users experience no change
- [ ] No lockout of existing users

## Validation
- [ ] Test with Firebase emulator using new account
- [ ] Test with existing verified account — must still work
- [ ] Test resend verification flow
- [ ] `npm run test` passes (including auth-related tests)
- [ ] Edge case: user navigates directly to protected route unverified → redirected

## Commits Required (minimum)
1. `feat(auth): Add email verification gate on registration`
2. `feat(auth): Block app access for unverified emails with prompt`
3. `feat(auth): Add resend verification email option`
