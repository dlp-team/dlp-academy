// tests/unit/services/directMessageService.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendDirectMessage } from '../../../src/services/directMessageService';

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ __type: 'serverTimestamp' })),
  setDoc: vi.fn(),
  dbRef: { __type: 'db' },
}));

vi.mock('../../../src/firebase/config', () => ({
  db: firestoreMocks.dbRef,
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    addDoc: firestoreMocks.addDoc,
    collection: firestoreMocks.collection,
    doc: firestoreMocks.doc,
    getDoc: firestoreMocks.getDoc,
    serverTimestamp: firestoreMocks.serverTimestamp,
    setDoc: firestoreMocks.setDoc,
  };
});

describe('directMessageService.sendDirectMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    firestoreMocks.collection.mockReturnValue({ __type: 'collection', path: 'directMessages' });
    firestoreMocks.doc.mockImplementation((_db, path, id) => ({ __type: 'doc', path, id }));
    firestoreMocks.addDoc.mockResolvedValue({ id: 'dm-1' });
    firestoreMocks.setDoc.mockResolvedValue(undefined);

    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        institutionId: 'inst-1',
        displayName: 'Profesor Uno',
        email: 'teacher@dlp.dev',
      }),
    });
  });

  it('creates direct message and notification when users share institution', async () => {
    const sender = {
      uid: 'student-1',
      institutionId: 'inst-1',
      displayName: 'Alumno Uno',
      email: 'student@dlp.dev',
      photoURL: 'https://example.com/student.jpg',
    };

    const result = await sendDirectMessage({
      sender,
      recipientUid: 'teacher-1',
      content: 'Profe, tengo una duda sobre la tarea.',
      subjectId: 'subject-1',
      subjectName: 'Matemáticas',
    });

    expect(firestoreMocks.getDoc).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.addDoc).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.setDoc).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      directMessageId: 'dm-1',
      recipientUid: 'teacher-1',
    });
  });

  it('rejects when recipient belongs to another institution', async () => {
    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        institutionId: 'inst-2',
        displayName: 'Profesor Externo',
      }),
    });

    await expect(
      sendDirectMessage({
        sender: {
          uid: 'student-1',
          institutionId: 'inst-1',
          displayName: 'Alumno Uno',
        },
        recipientUid: 'teacher-2',
        content: 'Hola',
      })
    ).rejects.toThrow('Solo puedes enviar mensajes a usuarios de tu institución.');

    expect(firestoreMocks.addDoc).not.toHaveBeenCalled();
    expect(firestoreMocks.setDoc).not.toHaveBeenCalled();
  });

  it('rejects empty message content', async () => {
    await expect(
      sendDirectMessage({
        sender: {
          uid: 'student-1',
          institutionId: 'inst-1',
        },
        recipientUid: 'teacher-1',
        content: '   ',
      })
    ).rejects.toThrow('Escribe un mensaje antes de enviar.');

    expect(firestoreMocks.getDoc).not.toHaveBeenCalled();
  });
});
