import React, { useState } from 'react';
import styles from '../styles/Login.module.css';
import { auth, provider } from '../firebase/config'; 
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Iniciar sesión con Email
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // El observador en AIClassroom detectará el cambio automáticamente
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
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error(err);
            setError("No se pudo iniciar sesión con Google.");
        }
    };

    return (
        <div className={styles.loginPageWrapper}>
            <div className={styles.loginContainer}>
                
                {/* IZQUIERDA: Branding */}
                <div className={styles.loginLeft}>
                    <div className={styles.logoSection}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>🎓</div>
                            <div className={styles.logoText}>
                                <h1>AI CLASSROOM</h1>
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
                                <input type="checkbox" />
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
                            <span>📱</span>
                            <span>Google</span>
                        </button>
                        <button type="button" className={styles.socialButton} onClick={() => alert("Próximamente")}>
                            <span>🔵</span>
                            <span>Microsoft</span>
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