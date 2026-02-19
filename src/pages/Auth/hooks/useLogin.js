// src/pages/Auth/hooks/useLogin.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    setPersistence, 
    browserLocalPersistence, 
    browserSessionPersistence,
    sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'; 
import { auth, db, provider } from '../../../firebase/config';

export const useLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetSent, setResetSent] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    // Helper to ensure user exists in Firestore (especially for Google Login)
    const saveUserToFirestore = async (user) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // New Google User
            await setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: 'student',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                settings: { theme: 'system', language: 'es', viewMode: 'grid' }
            });
        } else {
            // Existing User - Update login time
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Set Persistence (Remember Me)
            const persistenceType = formData.rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistenceType);

            // 2. Auth Login
            const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            
            // 3. Update Firestore
            await saveUserToFirestore(result.user);

            navigate('/home');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Correo o contraseña incorrectos.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos fallidos. Inténtalo más tarde.');
            } else {
                setError('Error al iniciar sesión. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            await saveUserToFirestore(result.user);
            navigate('/home');
        } catch (err) {
            console.error(err);
            setError('Error al iniciar sesión con Google.');
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            setError('Por favor, escribe tu correo electrónico primero.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, formData.email);
            setResetSent(true);
            setTimeout(() => setResetSent(false), 5000);
        } catch (err) {
            setError('No se pudo enviar el correo de recuperación.');
        }
    };

    return { 
        formData, loading, error, resetSent,
        handleChange, handleLogin, handleGoogleLogin, handleForgotPassword 
    };
};