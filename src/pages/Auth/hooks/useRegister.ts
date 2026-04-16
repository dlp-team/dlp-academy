// src/pages/Auth/hooks/useRegister.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/config';
import { validateInstitutionalAccessCode } from '../../../services/accessCodeService';

export const useRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [strength, setStrength] = useState(0);
    
    const [formData, setFormData] = useState({
        userType: 'student',
        firstName: '',
        lastName: '',
        email: '',
        verificationCode: '',
        password: '',
        confirmPassword: '',
        rememberMe: false
    });

    // Password Strength Logic
    const checkStrength = (pass: any) => {
        let s = 0;
        if (pass.length >= 8) s++;
        if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) s++;
        if (pass.match(/[0-9]/)) s++;
        if (pass.match(/[^a-zA-Z0-9]/)) s++;
        setStrength(s);
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        if (name === 'password') checkStrength(val);
        // Clear error when user types
        if (error) setError('');
    };

    const registerUser = async (e: any) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (formData.password !== formData.confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }
        if (strength < 2) {
            return setError('La contraseña es demasiado débil');
        }

        setLoading(true);

        try {
            const normalizedEmail = (formData.email || '').toLowerCase().trim();

            if (!normalizedEmail) {
                throw new Error('Debes indicar un correo válido.');
            }

            let resolvedRole = 'student';
            let institutionId: string | null = null;
            let shouldDeleteInvite = false;
            let directInviteCodeToDelete: string | null = null;

            if (formData.userType === 'teacher' || formData.userType === 'admin' || formData.userType === 'student') {
                const code = (formData.verificationCode || '').trim();
                const normalizedCode = code.toUpperCase();
                console.log("Datos de registro:", { type: formData.userType, code: normalizedCode }); // Para ver qué llega

                if ((formData.userType === 'teacher' || formData.userType === 'admin') && !code) {
                    throw new Error('missing-verification-code');
                }

                if (code) {
                    // 1. ONE SECURE LOOKUP: Buscar solo por ID
                    const inviteRef = doc(db, 'institution_invites', code);
                    let inviteDocSnap = await getDoc(inviteRef);
                    let resolvedInviteCode = code;

                    // Legacy/normalized compatibility for institutional static docs using uppercase IDs.
                    if (!inviteDocSnap.exists() && normalizedCode !== code) {
                        const normalizedInviteRef = doc(db, 'institution_invites', normalizedCode);
                        const normalizedInviteSnap = await getDoc(normalizedInviteRef);
                        if (normalizedInviteSnap.exists()) {
                            inviteDocSnap = normalizedInviteSnap;
                            resolvedInviteCode = normalizedCode;
                        }
                    }

                    if (inviteDocSnap.exists()) {
                        const inviteData = inviteDocSnap.data();

                        // 2. Direct email invites remain Firestore-based and one-time.
                        if (inviteData.type !== 'institutional') {
                            if (inviteData.email.toLowerCase() !== normalizedEmail) {
                                throw new Error('invalid-invite-email');
                            }
                            resolvedRole = inviteData.role || formData.userType || 'teacher';
                            institutionId = inviteData.institutionId;
                            shouldDeleteInvite = true;
                            directInviteCodeToDelete = resolvedInviteCode;
                        } else {
                            // Backward compatibility for legacy institutional invite docs.
                            resolvedRole = formData.userType === 'student' ? 'student' : 'teacher';
                            institutionId = inviteData.institutionId;
                        }
                    } else if (formData.userType === 'teacher' || formData.userType === 'student') {
                        // 3. Institutional role code is validated server-side (deterministic + hidden salt).
                        const validationResult: any = await validateInstitutionalAccessCode({
                            verificationCode: normalizedCode,
                            email: normalizedEmail,
                            userType: formData.userType,
                        });

                        if (!validationResult?.valid || !validationResult?.institutionId) {
                            throw new Error('invalid-verification-code');
                        }

                        // SECURITY: Use server-authoritative role, not client-selected userType
                        resolvedRole = validationResult.role || (formData.userType === 'student' ? 'student' : 'teacher');
                        institutionId = validationResult.institutionId;
                    } else {
                        throw new Error('invalid-verification-code');
                    }
                }
            }

            // SECURITY: Cap resolvedRole to non-privileged values on client-side create.
            // Admin/institutionadmin roles require server-side promotion after profile creation.
            const SAFE_CREATE_ROLES = ['student', 'teacher'];
            const safeRole = SAFE_CREATE_ROLES.includes(resolvedRole) ? resolvedRole : 'teacher';

            // 3. Create Auth User 
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                normalizedEmail,
                formData.password
            );
            const user = userCredential.user;
            const displayName = `${(formData.firstName || '').trim()} ${(formData.lastName || '').trim()}`.trim() || normalizedEmail.split('@')[0];

            // 4. Update Display Name
            await updateProfile(user, { displayName });

            // 5. Create Firestore Document en 'users'
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                displayName,
                email: normalizedEmail,
                role: safeRole,
                institutionId,
                createdAt: serverTimestamp(),
                settings: {
                    theme: 'system',
                    language: 'es',
                    viewMode: 'grid'
                }
            });

            // 6. Borramos la invitación directa de forma no bloqueante para no romper el alta del usuario
            if (shouldDeleteInvite) {
                try {
                    const inviteRef = doc(db, 'institution_invites', directInviteCodeToDelete || (formData.verificationCode || '').trim());
                    await deleteDoc(inviteRef);
                } catch (cleanupError: any) {
                    console.warn('Invite cleanup failed after successful user creation:', cleanupError?.code || cleanupError?.message || cleanupError);
                }
            }

            // 7. Send verification email and redirect to verification page
            try {
                await sendEmailVerification(userCredential.user);
            } catch (verificationErr: any) {
                console.warn('Email verification send failed:', verificationErr?.code || verificationErr?.message);
            }
            navigate('/verify-email?registered=true');

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo electrónico ya está registrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else if (err.message === 'missing-verification-code') {
                setError('Debes ingresar tu Código de Verificación o Código Institucional.');
            } else if (err.message === 'invalid-invite-email') {
                setError('El correo ingresado no coincide con el de la invitación.');
            } else if (err.message === 'invalid-verification-code') {
                setError('Código de verificación inválido o expirado.');
            } else {
                setError('Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return { formData, strength, loading, error, handleChange, registerUser, setFormData };
};