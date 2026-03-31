// src/services/accessCodeService.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export const validateInstitutionalAccessCode = async ({ verificationCode, email, userType = 'teacher' }) => {
  const callable = httpsCallable(functions, 'validateInstitutionalAccessCode');
  const response = await callable({ verificationCode, email, userType });
  return response?.data || { valid: false, institutionId: null, role: userType };
};

export const getInstitutionalAccessCodePreview = async ({ institutionId, userType = 'teacher', intervalHours }) => {
  const callable = httpsCallable(functions, 'getInstitutionalAccessCodePreview');
  const response = await callable({ institutionId, userType, intervalHours });
  return response?.data || { code: '------', validUntilMs: null };
};
