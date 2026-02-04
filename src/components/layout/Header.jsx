import React from 'react';
import { useNavigate } from 'react-router-dom';
// Added 'Settings' to imports
import { GraduationCap, LogOut, User as UserIcon, Settings } from 'lucide-react';

const Header = ({ user }) => {
  const navigate = useNavigate();

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
  };

  const displayName = getDisplayName();
  const initials = getInitials();

  return (
    <header className="fixed top-0 w-full h-20 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* --- LEFT: LOGO --- */}
        <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/home')}
        >
          <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            DLP Academy
          </h1>
        </div>
        
        {/* --- RIGHT: ACTIONS & PROFILE --- */}
        <div className="flex items-center gap-2">

            {/* 1. SETTINGS BUTTON */}
            <button 
                onClick={() => navigate('/settings')}
                className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200"
                title="Configuración"
            >
                <Settings size={20} />
            </button>

            {/* 2. USER PROFILE (Clickable Area) */}
            <div 
                className="flex items-center gap-4 pl-4 border-l border-gray-200 ml-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/profile')} 
            >
                {/* Text Info */}
                <div className="text-right hidden sm:block">
                    <h2 className="font-bold text-sm text-gray-800 leading-tight">
                        {displayName}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                        {user?.email}
                    </p>
                </div>

                {/* AVATAR */}
                <div className="relative">
                    {user?.photoURL ? (
                        <img 
                            src={user.photoURL} 
                            alt={displayName} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover hover:scale-105 transition-transform"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform">
                            {initials}
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;