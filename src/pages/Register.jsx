// Boton.jsx
import styles from '../styles/Register.module.css'; // Importación clave

export const Boton = ({ texto, esActivo }) => {
  return (
    // Accedemos a la clase como propiedad del objeto 'styles'
    <div className={styles.contenedor}>
      <button 
        className={`${styles.boton} ${esActivo ? styles['boton-activo'] : ''}`}
      >
        {texto}
      </button>
    </div>
  );
};