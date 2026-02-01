import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Header = ({ user }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Logo Minimalista Izquierda */}
        {/* Le he añadido onClick para que si clicas en el logo te lleve a Home también */}
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
                {/* NOMBRE: Si existe, lo muestra. Si no, pone 'Usuario' */}
                <h2 className="font-semibold text-sm text-gray-900">
                    {user?.displayName || "Usuario"}
                </h2>
                {/* EMAIL */}
                <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* AVATAR: Foto de Google o Inicial */}
            <div className="relative group">
                {user?.photoURL ? (
                    <img 
                        src={user.photoURL} 
                        alt="Perfil" 
                        className="w-10 h-10 rounded-full border-2 border-indigo-100 object-cover" 
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {/* Primera letra del nombre en mayúscula */}
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