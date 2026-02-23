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
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );
            const user = userCredential.user;

            // 2. Update Display Name
            await updateProfile(user, {
                displayName: `${formData.firstName} ${formData.lastName}`
            });

            const resolveInstitutionId = async (email) => {
                const normalizedEmail = (email || '').toLowerCase();
                const domain = normalizedEmail.split('@')[1];
                if (!domain) return null;

                const allowedSnap = await getDocs(
                    query(collection(db, 'allowed_teachers'), where('email', '==', normalizedEmail))
                );
                if (!allowedSnap.empty) {
                    return allowedSnap.docs[0].data()?.institutionId || null;
                }

                const domainSnap = await getDocs(
                    query(collection(db, 'institutions'), where('domains', 'array-contains', domain))
                );
                if (!domainSnap.empty) return domainSnap.docs[0].id;

                const singleSnap = await getDocs(
                    query(collection(db, 'institutions'), where('domain', '==', domain))
                );
                if (!singleSnap.empty) return singleSnap.docs[0].id;

                return null;
            };

            const institutionId = await resolveInstitutionId(formData.email);

            // 3. Create Firestore Document
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                displayName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                role: formData.userType,
                country: formData.country,
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
            } else {
                setError('Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return { formData, strength, loading, error, handleChange, registerUser, setFormData };
};