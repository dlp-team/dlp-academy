import React, { useState } from 'react';
import styles from '../styles/Register.module.css'; 
import { GraduationCap, Mail, Lock, User, Check } from 'lucide-react';

const Register = () => {
    // Estados para el formulario
    const [formData, setFormData] = useState({
        userType: 'student',
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        password: '',
        confirmPassword: ''
    });

    const [strength, setStrength] = useState(0);
    const [loading, setLoading] = useState(false);

    // Calcular fuerza contraseña
    const checkStrength = (pass) => {
        let s = 0;
        if (pass.length >= 8) s++;
        if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) s++;
        if (pass.match(/[0-9]/)) s++;
        if (pass.match(/[^a-zA-Z0-9]/)) s++;
        setStrength(s);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'password') checkStrength(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Aquí iría la lógica de Firebase
        console.log("Datos a enviar:", formData);
        
        setTimeout(() => {
            alert("Registro simulado exitoso");
            setLoading(false);
        }, 1500);
    };

    // Clases dinámicas para la barra de fuerza
    const getStrengthClass = () => {
        if (strength < 2) return styles.strengthWeak; // Rojo
        if (strength < 4) return styles.strengthMedium; // Naranja
        return styles.strengthStrong; // Verde
    };

    return (
        <div className={styles.registerPageWrapper}>
            <div className={styles.registerContainer}>
                
                {/* LADO IZQUIERDO */}
                <div className={styles.registerLeft}>
                    <div className={styles.logoSection}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <GraduationCap size={32} color="#333" />
                            </div>
                            <div className={styles.logoText}>
                                <h1>DLP ACADEMY</h1>
                                <p>Learning Platform</p>
                            </div>
                        </div>
                        
                        <div className={styles.welcomeText}>
                            <h2>Comienza tu Viaje</h2>
                            <p>Únete a miles de estudiantes y docentes transformando su educación con IA.</p>
                        </div>

                        <div className={styles.benefits}>
                            <div className={styles.benefitItem}>
                                <div className={styles.benefitIcon}><Check size={18} /></div>
                                <span>Acceso gratuito de por vida</span>
                            </div>
                            <div className={styles.benefitItem}>
                                <div className={styles.benefitIcon}><Check size={18} /></div>
                                <span>Contenido adaptado a tu nivel</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LADO DERECHO (Formulario) */}
                <div className={styles.registerRight}>
                    <div className={styles.registerHeader}>
                        <h2>Crear Cuenta</h2>
                        <p>Completa el formulario para registrarte</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Tipo de Usuario */}
                        <div className={styles.formGroup}>
                            <label>Tipo de Usuario</label>
                            <div className={styles.userType}>
                                <div className={styles.userTypeOption}>
                                    <input 
                                        type="radio" 
                                        name="userType" 
                                        value="student" 
                                        checked={formData.userType === 'student'}
                                        onChange={handleChange}
                                    />
                                    <label className={styles.userTypeLabel}>
                                        <span className={styles.icon}>👨‍🎓</span>
                                        <span className={styles.title}>Estudiante</span>
                                    </label>
                                </div>
                                <div className={styles.userTypeOption}>
                                    <input 
                                        type="radio" 
                                        name="userType" 
                                        value="teacher"
                                        checked={formData.userType === 'teacher'}
                                        onChange={handleChange}
                                    />
                                    <label className={styles.userTypeLabel}>
                                        <span className={styles.icon}>👨‍🏫</span>
                                        <span className={styles.title}>Docente</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Nombre y Apellidos */}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Nombre</label>
                                <div className={`${styles.inputWrapper} ${styles.noIcon}`}>
                                    <input type="text" name="firstName" placeholder="Juan" onChange={handleChange} required />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Apellidos</label>
                                <div className={`${styles.inputWrapper} ${styles.noIcon}`}>
                                    <input type="text" name="lastName" placeholder="Pérez" onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className={styles.formGroup}>
                            <label>Correo Electrónico</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}><Mail size={18}/></span>
                                <input type="email" name="email" placeholder="tu@email.com" onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className={styles.formGroup}>
                            <label>Contraseña</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}><Lock size={18}/></span>
                                <input type="password" name="password" placeholder="Mínimo 8 caracteres" onChange={handleChange} required />
                            </div>
                            {/* Barra de fuerza */}
                            {formData.password && (
                                <div className={styles.passwordStrength}>
                                    <div className={styles.strengthBar}>
                                        <div 
                                            className={styles.strengthFill} 
                                            style={{ 
                                                width: strength === 0 ? '0%' : strength < 2 ? '33%' : strength < 4 ? '66%' : '100%',
                                                backgroundColor: strength < 2 ? '#fc8181' : strength < 4 ? '#f6ad55' : '#68d391'
                                            }}
                                        ></div>
                                    </div>
                                    <span style={{color: '#718096'}}>
                                        {strength < 2 ? 'Débil' : strength < 4 ? 'Media' : 'Fuerte'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <label className={styles.termsCheckbox}>
                            <input type="checkbox" required />
                            <span>Acepto los <a href="#">Términos y Condiciones</a></span>
                        </label>

                        <button type="submit" className={styles.registerButton} disabled={loading}>
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </button>
                    </form>

                    <div className={styles.loginLink}>
                        ¿Ya tienes cuenta? <a href="#">Inicia sesión aquí</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;