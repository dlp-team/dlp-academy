// src/pages/Auth/hooks/useRegister.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, serverTimestamp, where } from 'firebase/firestore';
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
        magicCode: '',
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

            const inviteSnap = await getDocs(
                query(collection(db, 'institution_invites'), where('email', '==', normalizedEmail))
            );

            let resolvedRole = formData.userType;
            let institutionId = null;

            if (!inviteSnap.empty) {
                const inviteDocs = inviteSnap.docs.map(d => d.data());
                const adminInvite = inviteDocs.find(inv => ['admin', 'institutionadmin'].includes(inv.role));

                if (adminInvite?.institutionId) {
                    resolvedRole = 'institutionadmin';
                    institutionId = adminInvite.institutionId;
                } else if (formData.userType === 'teacher') {
                    const teacherInvite = inviteDocs[0];
                    resolvedRole = 'teacher';
                    institutionId = teacherInvite?.institutionId || null;
                }
            } else if (formData.userType === 'teacher') {
                const magicCode = (formData.magicCode || '').trim();

                if (!magicCode) {
                    throw new Error('Código inválido o correo no invitado');
                }

                const magicCodeSnap = await getDocs(
                    query(
                        collection(db, 'institutions'),
                        where('onboarding_settings.magic_code_enabled', '==', true),
                        where('onboarding_settings.magic_code_value', '==', magicCode)
                    )
                );

                if (magicCodeSnap.empty) {
                    throw new Error('Código inválido o correo no invitado');
                }

                resolvedRole = 'teacher';
                institutionId = magicCodeSnap.docs[0].id;
            }

            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                normalizedEmail,
                formData.password
            );
            const user = userCredential.user;
            const displayName = `${(formData.firstName || '').trim()} ${(formData.lastName || '').trim()}`.trim() || normalizedEmail.split('@')[0];
            const country = (formData.country || '').trim() || 'other';

            // 2. Update Display Name
            await updateProfile(user, {
                displayName
            });

            // 3. Create Firestore Document
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

            // 4. Redirect
            navigate('/home');

        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo electrónico ya está registrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else if (err.message === 'Código inválido o correo no invitado') {
                setError('Código inválido o correo no invitado');
            } else if (err.message === 'Debes indicar un correo válido.') {
                setError('Debes indicar un correo válido.');
            } else {
                setError('Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return { formData, strength, loading, error, handleChange, registerUser, setFormData };
};