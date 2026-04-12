// tests/unit/utils/directMessageUtils.test.js
import { describe, expect, it } from 'vitest';
import {
  buildConversationKey,
  isUserLinkedToSubject,
  resolveConversationParticipantUid,
} from '../../../src/utils/directMessageUtils';

describe('directMessageUtils', () => {
  it('builds deterministic conversation keys', () => {
    expect(buildConversationKey('user-b', 'user-a')).toBe('user-a__user-b');
    expect(buildConversationKey('user-a', 'user-b')).toBe('user-a__user-b');
  });

  it('resolves participant uid from message perspective', () => {
    const message = {
      senderUid: 'teacher-1',
      recipientUid: 'student-1',
    };

    expect(resolveConversationParticipantUid(message, 'teacher-1')).toBe('student-1');
    expect(resolveConversationParticipantUid(message, 'student-1')).toBe('teacher-1');
  });

  it('detects subject linkage through owner or shared arrays', () => {
    const subjectData = {
      ownerId: 'teacher-1',
      sharedWithUids: ['student-1'],
      enrolledStudentUids: ['student-2'],
    };

    expect(isUserLinkedToSubject(subjectData, 'teacher-1')).toBe(true);
    expect(isUserLinkedToSubject(subjectData, 'student-1')).toBe(true);
    expect(isUserLinkedToSubject(subjectData, 'student-2')).toBe(true);
    expect(isUserLinkedToSubject(subjectData, 'student-3')).toBe(false);
  });
});
