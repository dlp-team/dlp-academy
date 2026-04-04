// src/services/accessCodeService.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export const validateInstitutionalAccessCode = async ({ verificationCode, email, userType = 'teacher' }) => {
  const callable = httpsCallable(functions, 'validateInstitutionalAccessCode');
  const response = await callable({ verificationCode, email, userType });
  return response?.data || { valid: false, institutionId: null, role: userType };
};

export const getInstitutionalAccessCodePreview = async ({ institutionId, userType = 'teacher', intervalHours, codeVersion = 0 }) => {
  const callable = httpsCallable(functions, 'getInstitutionalAccessCodePreview');
  const response = await callable({ institutionId, userType, intervalHours, codeVersion });
  return response?.data || { code: '------', validUntilMs: null };
};

export const rotateInstitutionalAccessCodeNow = async ({ institutionId, userType = 'teacher' }) => {
  const callable = httpsCallable(functions, 'rotateInstitutionalAccessCodeNow');
  const response = await callable({ institutionId, userType });
  return response?.data || { code: '------', validUntilMs: null, codeVersion: 0 };
};
