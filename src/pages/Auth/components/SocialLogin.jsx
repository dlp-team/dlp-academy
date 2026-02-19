// src/pages/Auth/components/SocialLogin.jsx
import React from 'react';
import { FcGoogle } from 'react-icons/fc'; // Assuming you have react-icons installed

const SocialLogin = ({ onClick, loading }) => {
    return (
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-black text-gray-500">O continúa con</span>
                </div>
            </div>

            <button 
                type="button" 
                onClick={onClick}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 text-gray-700 font-medium cursor-pointer"
            >
                <FcGoogle size={24} />
                <span>Google</span>
            </button>
        </div>
    );
};

export default SocialLogin;