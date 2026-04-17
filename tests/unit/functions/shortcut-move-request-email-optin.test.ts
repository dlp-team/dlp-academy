// tests/unit/functions/shortcut-move-request-email-optin.test.js
import { describe, expect, it } from 'vitest';
import {
  isEmailNotificationEnabled,
  shouldQueueShortcutMoveOwnerMail,
  shouldQueueShortcutMoveRequesterMail,
} from '../../../functions/security/shortcutMoveRequestEmailUtils.js';

describe('shortcut move request email opt-in utils', () => {
  it('treats notifications.email=false as opt-out and defaults to enabled otherwise', () => {
    expect(isEmailNotificationEnabled({ notifications: { email: false } })).toBe(false);
    expect(isEmailNotificationEnabled({ notifications: { email: true } })).toBe(true);
    expect(isEmailNotificationEnabled({ notifications: {} })).toBe(true);
    expect(isEmailNotificationEnabled({})).toBe(true);
  });

  it('queues owner mail only when owner has an email and email notifications enabled', () => {
    expect(shouldQueueShortcutMoveOwnerMail({
      ownerEmail: 'owner@example.com',
      ownerData: { notifications: { email: true } },
    })).toBe(true);

    expect(shouldQueueShortcutMoveOwnerMail({
      ownerEmail: 'owner@example.com',
      ownerData: { notifications: { email: false } },
    })).toBe(false);

    expect(shouldQueueShortcutMoveOwnerMail({
      ownerEmail: '',
      ownerData: { notifications: { email: true } },
    })).toBe(false);
  });

  it('queues requester mail when requester email exists and profile is missing (legacy fallback)', () => {
    expect(shouldQueueShortcutMoveRequesterMail({
      requesterEmail: 'requester@example.com',
      requesterData: null,
    })).toBe(true);
  });

  it('respects requester opt-out when profile exists and notifications.email is false', () => {
    expect(shouldQueueShortcutMoveRequesterMail({
      requesterEmail: 'requester@example.com',
      requesterData: { notifications: { email: false } },
    })).toBe(false);

    expect(shouldQueueShortcutMoveRequesterMail({
      requesterEmail: 'requester@example.com',
      requesterData: { notifications: { email: true } },
    })).toBe(true);
  });
});
