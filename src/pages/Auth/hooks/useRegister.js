// src/pages/Auth/hooks/useRegister.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, serverTimestamp, where, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/config';

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
        country: '',
        password: '',
        confirmPassword: '',
        rememberMe: false
    });

    // Password Strength Logic
    const checkStrength = (pass) => {
        let s = 0;
        if (pass.length >= 8) s++;
        if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) s++;
        if (pass.match(/[0-9]/)) s++;
        if (pass.match(/[^a-zA-Z0-9]/)) s++;
        setStrength(s);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        if (name === 'password') checkStrength(val);
        // Clear error when user types
        if (error) setError('');
    };

    const registerUser = async (e) => {
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
            let institutionId = null;
            let shouldDeleteInvite = false;

            if (formData.userType === 'teacher' || formData.userType === 'admin') {
                const code = (formData.verificationCode || '').trim().toUpperCase();
                console.log("Datos de registro:", { type: formData.userType, code: code }); // Para ver qué llega

                if ((formData.userType === 'teacher' || formData.userType === 'admin') && !code) {
                    throw new Error('missing-verification-code');
                }

                // 1. ONE SECURE LOOKUP: Buscar solo por ID
                const inviteRef = doc(db, 'institution_invites', code);
                const inviteDocSnap = await getDoc(inviteRef);

                if (!inviteDocSnap.exists()) {
                    throw new Error('invalid-verification-code');
                }

                const inviteData = inviteDocSnap.data();

                // 2. BEHAVIOR BASED ON TYPE
                if (inviteData.type === 'institutional') {
                    resolvedRole = 'teacher'; 
                    institutionId = inviteData.institutionId;
                } else {
                    if (inviteData.email.toLowerCase() !== normalizedEmail) {
                        throw new Error('invalid-invite-email');
                    }
                    resolvedRole = inviteData.role || 'teacher';
                    institutionId = inviteData.institutionId;
                    
                    shouldDeleteInvite = true;
                }
            }

            // 3. Create Auth User 
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                normalizedEmail,
                formData.password
            );
            const user = userCredential.user;
            const displayName = `${(formData.firstName || '').trim()} ${(formData.lastName || '').trim()}`.trim() || normalizedEmail.split('@')[0];
            const country = (formData.country || '').trim() || 'other';

            // 4. Update Display Name
            await updateProfile(user, { displayName });

            // 5. Borramos la invitación directa porque ya estamos logueados
            if (shouldDeleteInvite) {
                const code = (formData.verificationCode || '').trim().toUpperCase();
                const inviteRef = doc(db, 'institution_invites', code);
                await deleteDoc(inviteRef);
            }

            // 6. Create Firestore Document en 'users'
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                displayName,
                email: normalizedEmail,
                role: resolvedRole,
                country,
                institutionId,
                createdAt: serverTimestamp(),
                settings: {
                    theme: 'system',
                    language: 'es',
                    viewMode: 'grid'
                }
            });

            // 7. Redirect
            navigate('/home');

        } catch (err) {
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