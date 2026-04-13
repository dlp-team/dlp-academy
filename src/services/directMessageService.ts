// src/services/directMessageService.ts
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { buildConversationKey } from '../utils/directMessageUtils';

const MAX_MESSAGE_LENGTH = 700;
const MAX_ATTACHMENT_COUNT = 4;
const MAX_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024;

const DIRECT_MESSAGE_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export const DIRECT_MESSAGE_ATTACHMENT_LIMITS = {
  maxCount: MAX_ATTACHMENT_COUNT,
  maxFileSizeBytes: MAX_ATTACHMENT_SIZE_BYTES,
  allowedMimeTypes: DIRECT_MESSAGE_ALLOWED_MIME_TYPES,
};

const normalizeString = (value: any) => String(value || '').trim();

const normalizeFileName = (fileName: any) => String(fileName || 'archivo').replace(/[^a-zA-Z0-9._-]/g, '_');

const isSupportedAttachmentType = (contentType: string) => (
  contentType.startsWith('image/') || DIRECT_MESSAGE_ALLOWED_MIME_TYPES.includes(contentType)
);

const normalizeSubjectReference = (subjectReference: any) => {
  if (!subjectReference || typeof subjectReference !== 'object') return null;

  const normalizedSubjectId = normalizeString(subjectReference?.subjectId);
  if (!normalizedSubjectId) return null;

  return {
    subjectId: normalizedSubjectId,
    subjectName: normalizeString(subjectReference?.subjectName) || null,
    topicId: normalizeString(subjectReference?.topicId) || null,
    resourceId: normalizeString(subjectReference?.resourceId) || null,
    resourceType: normalizeString(subjectReference?.resourceType) || 'subject',
    resourceName: normalizeString(subjectReference?.resourceName) || null,
    label: normalizeString(subjectReference?.label) || null,
    route: normalizeString(subjectReference?.route) || null,
    selectionSnippet: normalizeString(subjectReference?.selectionSnippet) || null,
    selectionType: normalizeString(subjectReference?.selectionType).toLowerCase() || null,
  };
};

const uploadDirectMessageAttachments = async ({
  attachments,
  senderInstitutionId,
  participants,
}: {
  attachments: any[];
  senderInstitutionId: string;
  participants: string[];
}) => {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];

  if (attachments.length > MAX_ATTACHMENT_COUNT) {
    throw new Error(`Solo puedes adjuntar hasta ${MAX_ATTACHMENT_COUNT} archivos por mensaje.`);
  }

  const sanitizedParticipants = [...participants].map((entry) => normalizeString(entry)).filter(Boolean);
  if (sanitizedParticipants.length !== 2) {
    throw new Error('No se pudo validar la conversación para adjuntar archivos.');
  }

  const uploads = attachments.map(async (attachment: any) => {
    const fileName = normalizeString(attachment?.name);
    const contentType = normalizeString(attachment?.type).toLowerCase() || 'application/octet-stream';
    const fileSize = Number(attachment?.size || 0);

    if (!fileName) {
      throw new Error('Uno de los archivos adjuntos no es válido.');
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new Error(`El archivo "${fileName}" supera el límite de 8 MB.`);
    }

    if (!isSupportedAttachmentType(contentType)) {
      throw new Error(`El tipo de archivo "${fileName}" no es compatible.`);
    }

    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const storagePath = [
      'institutions',
      senderInstitutionId,
      'direct-messages',
      sanitizedParticipants[0],
      sanitizedParticipants[1],
      `${Date.now()}_${randomSuffix}_${normalizeFileName(fileName)}`,
    ].join('/');

    const attachmentStorageRef = storageRef(storage, storagePath);
    await uploadBytes(attachmentStorageRef, attachment, { contentType });
    const url = await getDownloadURL(attachmentStorageRef);

    return {
      name: fileName,
      url,
      path: storagePath,
      size: fileSize,
      contentType,
      kind: contentType.startsWith('image/') ? 'image' : 'file',
    };
  });

  return Promise.all(uploads);
};

export const sendDirectMessage = async ({
  sender,
  recipientUid,
  content,
  subjectId = null,
  subjectName = null,
  attachments = [],
  subjectReference = null,
}: any) => {
  const senderUid = normalizeString(sender?.uid);
  const senderInstitutionId = normalizeString(sender?.institutionId);
  const normalizedRecipientUid = normalizeString(recipientUid);
  const normalizedContent = normalizeString(content);

  if (!senderUid) {
    throw new Error('No se pudo identificar al remitente.');
  }

  if (!senderInstitutionId) {
    throw new Error('No se pudo identificar la institución del remitente.');
  }

  if (!normalizedRecipientUid) {
    throw new Error('Selecciona un destinatario válido.');
  }

  if (normalizedRecipientUid === senderUid) {
    throw new Error('No puedes enviarte mensajes a ti mismo.');
  }

  const recipientRef = doc(db, 'users', normalizedRecipientUid);
  const recipientSnapshot = await getDoc(recipientRef);

  if (!recipientSnapshot.exists()) {
    throw new Error('No se encontró al destinatario seleccionado.');
  }

  const recipientData = recipientSnapshot.data() || {};
  const recipientInstitutionId = normalizeString(recipientData?.institutionId);

  if (!recipientInstitutionId || recipientInstitutionId !== senderInstitutionId) {
    throw new Error('Solo puedes enviar mensajes a usuarios de tu institución.');
  }

  const senderDisplayName = normalizeString(sender?.displayName || sender?.name || sender?.email || 'Usuario');
  const senderEmail = normalizeString(sender?.email).toLowerCase() || null;
  const senderPhotoURL = normalizeString(sender?.photoURL) || null;
  const recipientEmail = normalizeString(recipientData?.email).toLowerCase() || null;
  const recipientDisplayName = normalizeString(recipientData?.displayName || recipientData?.name || recipientEmail || 'Usuario');
  const participants = [senderUid, normalizedRecipientUid].sort();
  const conversationKey = buildConversationKey(senderUid, normalizedRecipientUid);
  const normalizedSubjectReference = normalizeSubjectReference(subjectReference);

  const hasTextContent = normalizedContent.length > 0;
  const normalizedAttachments = Array.isArray(attachments) ? attachments : [];

  if (!hasTextContent && normalizedAttachments.length === 0 && !normalizedSubjectReference) {
    throw new Error('Escribe un mensaje o añade un adjunto antes de enviar.');
  }

  if (hasTextContent && normalizedContent.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`El mensaje supera el límite de ${MAX_MESSAGE_LENGTH} caracteres.`);
  }

  const uploadedAttachments = await uploadDirectMessageAttachments({
    attachments: normalizedAttachments,
    senderInstitutionId,
    participants,
  });

  const fallbackContent = normalizedSubjectReference
    ? `Referencia compartida: ${normalizeString(normalizedSubjectReference?.label || normalizedSubjectReference?.subjectName || 'contenido')}`
    : uploadedAttachments.length > 0
      ? `Archivo adjunto: ${uploadedAttachments[0]?.name || 'archivo'}`
      : '';

  const finalContent = normalizeString(hasTextContent ? normalizedContent : fallbackContent).slice(0, MAX_MESSAGE_LENGTH);

  if (!finalContent) {
    throw new Error('No se pudo construir el contenido del mensaje.');
  }

  const directMessageRef = await addDoc(collection(db, 'directMessages'), {
    institutionId: senderInstitutionId,
    senderUid,
    senderDisplayName,
    senderEmail,
    senderPhotoURL,
    recipientUid: normalizedRecipientUid,
    recipientDisplayName,
    recipientEmail,
    participants,
    conversationKey,
    content: finalContent,
    subjectId: normalizeString(subjectId) || null,
    subjectName: normalizeString(subjectName) || null,
    attachments: uploadedAttachments,
    subjectReference: normalizedSubjectReference,
    readByRecipient: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    directMessageId: directMessageRef.id,
    recipientUid: normalizedRecipientUid,
  };
};
