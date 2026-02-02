import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Header = ({ user }) => {
  const navigate = useNavigate();

  return (
    // 👇 CAMBIO 1: Añadimos 'h-20' para forzar la altura a 80px (estándar)
    <header className="fixed top-0 w-full h-20 bg-white shadow-sm border-b border-gray-200 z-50">
      
      {/* 👇 CAMBIO 2: Añadimos 'h-full' y quitamos 'py-3' para que el contenido se centre perfecto */}
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo Minimalista Izquierda */}
        <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/home')}
        >
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">AI Classroom</h1>
        </div>
        
        {/* Perfil Derecha */}
        <div 
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/profile')} 
        >
            <div className="text-right hidden sm:block">
                <h2 className="font-semibold text-sm text-gray-900">
                    {user?.displayName || "Usuario"}
                </h2>
                <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* AVATAR */}
            <div className="relative group">
                {user?.photoURL ? (
                    <img 
                        src={user.photoURL} 
                        alt="Perfil" 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-indigo-100 object-cover" 
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                )}
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;