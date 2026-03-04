📘 DLP Academy: Auth & Onboarding Roadmap
This document explains the multi-tier invitation system and the upcoming email infrastructure.

1. The Verification Logic (Current Implementation)
We moved from a "Search by Email" logic to a "Secure Token" logic to prevent "Email Squatting" (students stealing teacher accounts).

How it works:
Tier 1: Direct Invite (Most Secure)

Action: Admin Dashboard creates a doc in institution_invites.

The "Code": Is the Firestore Document ID.

Validation: The system checks if the Document ID exists AND matches the user's email.

Consumption: Once used, the document is deleted automatically.

Tier 2: Magic Code (Flexible)

Action: An Institution has a magic_code_value in its settings.

Validation: If no direct invite is found, the system checks if the code matches an institution's master code.

Use Case: Bulk onboarding of teachers without pre-registering their emails.

2. Firestore Security Rules
To keep the app secure while allowing registration, your rules must follow the "Get vs. List" principle.

Rule to add in Firebase Console:

JavaScript
// Verification: Users can "GET" a specific invite if they have the ID,
// but they cannot "LIST" (search) all invites.
match /institution_invites/{inviteId} {
  allow get: if true; 
  allow list: if false; 
  allow write: if request.auth != null && request.auth.token.admin == true;
}
3. Future Email Infrastructure (The "Professional" Path)
Since the web browser cannot send emails directly for security reasons, we use a backend trigger.

Recommended Stack:
Provider: Resend.com (Free tier: 3,000 emails/month).

Trigger: Firebase Cloud Functions (Requires Blaze Plan).

Domain: dlpacademy.com (Requires DNS records: SPF, DKIM, DMARC).

The Automation Flow:
Create: You click "Create Institution" in your Dashboard.

Store: Firestore stores the invite document.

Function: A Background Function (Node.js) detects the new document.

Send: The Function calls Resend's API to send the invitation email containing the inviteId.

4. Development Workflow (Phase 2)
When you are ready to move from manual copy-pasting to automated emails, follow these steps:

Upgrade to Blaze Plan: Necessary to allow Firebase to talk to external APIs (like Resend).

Verify Domain: Add the DNS records provided by Resend to your domain registrar.

Deploy Cloud Function:

Initialize functions: firebase init functions.

Install Resend: npm install resend.

Write an onCreate trigger for the institution_invites collection.


4. Technical Checklist for your Domain
When you finally buy your domain (e.g., via Namecheap, Cloudflare, or GoDaddy), you will need to set up these three specific DNS records. You can save this list for that day:

SPF (Sender Policy Framework): Tells servers which IP addresses are allowed to send mail for you.

DKIM (DomainKeys Identified Mail): Adds a digital signature to every email.

DMARC (Domain-based Message Authentication): Tells Gmail/Outlook what to do if SPF or DKIM fails (prevents spoofing).