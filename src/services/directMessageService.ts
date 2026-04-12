// src/services/directMessageService.ts
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const MAX_MESSAGE_LENGTH = 700;

const normalizeString = (value: any) => String(value || '').trim();

const truncatePreview = (value: string, maxLength = 120) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
};

export const sendDirectMessage = async ({
  sender,
  recipientUid,
  content,
  subjectId = null,
  subjectName = null,
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

  if (!normalizedContent) {
    throw new Error('Escribe un mensaje antes de enviar.');
  }

  if (normalizedContent.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`El mensaje supera el límite de ${MAX_MESSAGE_LENGTH} caracteres.`);
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

  const directMessageRef = await addDoc(collection(db, 'directMessages'), {
    institutionId: senderInstitutionId,
    senderUid,
    senderDisplayName,
    senderEmail,
    senderPhotoURL,
    recipientUid: normalizedRecipientUid,
    recipientDisplayName,
    recipientEmail,
    content: normalizedContent,
    subjectId: normalizeString(subjectId) || null,
    subjectName: normalizeString(subjectName) || null,
    readByRecipient: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const notificationId = `direct_message_${normalizedRecipientUid}_${directMessageRef.id}`;
  const subjectLabel = normalizeString(subjectName);
  const notificationMessagePrefix = subjectLabel
    ? `En ${subjectLabel}: `
    : '';

  await setDoc(doc(db, 'notifications', notificationId), {
    userId: normalizedRecipientUid,
    institutionId: senderInstitutionId,
    type: 'direct_message',
    read: false,
    title: `Mensaje de ${senderDisplayName}`,
    message: `${notificationMessagePrefix}${truncatePreview(normalizedContent)}`,
    senderUid,
    senderDisplayName,
    senderEmail,
    senderPhotoURL,
    directMessageId: directMessageRef.id,
    subjectId: normalizeString(subjectId) || null,
    subjectName: subjectLabel || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return {
    directMessageId: directMessageRef.id,
    recipientUid: normalizedRecipientUid,
  };
};
