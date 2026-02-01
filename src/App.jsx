import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home'; // O AIClassroom si lo llamaste así
import Register from './pages/Register';
import Profile from './pages/Profile';

// 👇 IMPORTACIONES DE FIREBASE (Necesarias para saber quién eres)
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👂 EL JEFE ESCUCHA: ¿Hay alguien logueado?
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Usuario detectado en App:", currentUser?.email);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center">Cargando aplicación...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto: Si no hay usuario -> Login, si hay -> Home */}
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 👇 AQUÍ ESTÁ LA CLAVE: Le pasamos 'user' a las páginas */}
        <Route path="/home" element={user ? <Home user={user} /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;