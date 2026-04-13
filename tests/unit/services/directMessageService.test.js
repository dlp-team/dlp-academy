// tests/unit/services/directMessageService.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendDirectMessage } from '../../../src/services/directMessageService';

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ __type: 'serverTimestamp' })),
  dbRef: { __type: 'db' },
}));

const storageMocks = vi.hoisted(() => ({
  getDownloadURL: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  storageRef: { __type: 'storage' },
}));

vi.mock('../../../src/firebase/config', () => ({
  db: firestoreMocks.dbRef,
  storage: storageMocks.storageRef,
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
  };
});

vi.mock('firebase/storage', async () => {
  const actual = await vi.importActual('firebase/storage');
  return {
    ...actual,
    getDownloadURL: storageMocks.getDownloadURL,
    ref: storageMocks.ref,
    uploadBytes: storageMocks.uploadBytes,
  };
});

describe('directMessageService.sendDirectMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    firestoreMocks.collection.mockReturnValue({ __type: 'collection', path: 'directMessages' });
    firestoreMocks.doc.mockImplementation((_db, path, id) => ({ __type: 'doc', path, id }));
    firestoreMocks.addDoc.mockResolvedValue({ id: 'dm-1' });
    storageMocks.ref.mockImplementation((_storage, path) => ({ __type: 'storage-ref', path }));
    storageMocks.uploadBytes.mockResolvedValue({});
    storageMocks.getDownloadURL.mockResolvedValue('https://example.com/attachment.pdf');

    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        institutionId: 'inst-1',
        displayName: 'Profesor Uno',
        email: 'teacher@dlp.dev',
      }),
    });
  });

  it('creates direct message payload with participants metadata when users share institution', async () => {
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
    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'directMessages' }),
      expect.objectContaining({
        institutionId: 'inst-1',
        senderUid: 'student-1',
        recipientUid: 'teacher-1',
        participants: ['student-1', 'teacher-1'],
        conversationKey: 'student-1__teacher-1',
        content: 'Profe, tengo una duda sobre la tarea.',
      })
    );
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
    ).rejects.toThrow('Escribe un mensaje o añade un adjunto antes de enviar.');

    expect(firestoreMocks.getDoc).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.addDoc).not.toHaveBeenCalled();
  });

  it('uploads attachments and stores subject reference metadata', async () => {
    const attachment = {
      name: 'resumen.pdf',
      size: 1024,
      type: 'application/pdf',
    };

    await sendDirectMessage({
      sender: {
        uid: 'student-1',
        institutionId: 'inst-1',
        displayName: 'Alumno Uno',
      },
      recipientUid: 'teacher-1',
      content: '',
      attachments: [attachment],
      subjectReference: {
        subjectId: 'subject-1',
        topicId: 'topic-1',
        resourceId: 'doc-1',
        resourceType: 'resource',
        label: 'PDF de apoyo',
        route: '/home/subject/subject-1/topic/topic-1/resource/doc-1',
      },
    });

    expect(storageMocks.uploadBytes).toHaveBeenCalledTimes(1);
    expect(storageMocks.getDownloadURL).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'directMessages' }),
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            name: 'resumen.pdf',
            url: 'https://example.com/attachment.pdf',
            kind: 'file',
          }),
        ],
        subjectReference: expect.objectContaining({
          subjectId: 'subject-1',
          resourceType: 'resource',
          resourceId: 'doc-1',
        }),
      })
    );
  });
});
