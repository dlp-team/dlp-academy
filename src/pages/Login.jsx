import React, { useState } from 'react';
import styles from '../styles/Login.module.css';
import { auth, provider } from '../firebase/config'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { db } from '../firebase/config';
import { FcGoogle } from 'react-icons/fc';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    setPersistence, 
    browserLocalPersistence, 
    browserSessionPersistence 
} from 'firebase/auth';



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);


    // Iniciar sesión con Email
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            
            await setPersistence(auth, persistence);
            const result = await signInWithEmailAndPassword(auth, email, password); // Capture 'result'
        
            await saveUserToFirestore(result.user); 
        } catch (err) {
            console.error(err);
            if(err.code === 'auth/invalid-credential') setError("Credenciales incorrectas.");
            else setError("Error al iniciar sesión.");
        } finally {
            setLoading(false);
        }
    };

    // Iniciar sesión con Google
    const handleGoogleLogin = async () => {
        setError('');
        try {
            const result = await signInWithPopup(auth, provider); 
            await saveUserToFirestore(result.user);
        } catch (err) {
            console.error(err);
            setError("No se pudo iniciar sesión con Google.");
        }
    };

    const saveUserToFirestore = async (user) => {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            email: user.email,
            lastLogin: serverTimestamp(),
        }, { merge: true });
    };

    return (
        <div className={styles.loginPageWrapper}>
            <div className={styles.loginContainer}>
                
                {/* IZQUIERDA: Branding */}
                <div className={styles.loginLeft}>
                    <div className={styles.logoSection}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap w-8 h-8 text-indigo-600" aria-hidden="true">
                                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z">
                                    </path>
                                    <path d="M22 10v6">
                                    </path>
                                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5">
                                    </path>
                                </svg>
                            </div>
                            <div className={styles.logoText}>
                                <h1>DLP ACADEMY</h1>
                                <p>Plataforma Inteligente</p>
                            </div>
                        </div>
                        
                        <div className={styles.welcomeText}>
                            <h2>Tu Aula Virtual con IA</h2>
                            <p>Genera temarios, tests y material educativo en segundos usando inteligencia artificial.</p>
                        </div>

                        <div className={styles.features}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>🤖</div>
                                <span>Contenido IA</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>☁️</div>
                                <span>Guardado en la Nube</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}>🔒</div>
                                <span>Acceso Seguro</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DERECHA: Formulario */}
                <div className={styles.loginRight}>
                    <div className={styles.loginHeader}>
                        <h2>Iniciar Sesión</h2>
                        <p>Ingresa para gestionar tus asignaturas</p>
                    </div>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Correo Electrónico</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>📧</span>
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder="tu@email.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Contraseña</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>🔒</span>
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className={styles.formOptions}>
                            <label className={styles.rememberMe}>
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe} 
                                    onChange={(e) => setRememberMe(e.target.checked)} 
                                />
                                <span>Recordarme</span>
                            </label>
                            <a href="#" className={styles.forgotPassword}>¿Olvidaste tu contraseña?</a>
                        </div>

                        <button type="submit" className={styles.loginButton} disabled={loading}>
                            {loading ? 'Entrando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>O continúa con</span>
                    </div>

                    <div className={styles.socialLogin}>
                        <button type="button" className={styles.socialButton} onClick={handleGoogleLogin}>
                            <FcGoogle size={32} style={{ width: '30px' }} />
                            <span>Google</span>
                        </button>
                    </div>

                    <div className={styles.registerLink}>
                        ¿No tienes cuenta? <a href="#">Regístrate aquí</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;


