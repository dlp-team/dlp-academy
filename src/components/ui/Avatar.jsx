// src/components/ui/Avatar.jsx
import React from 'react';

const Avatar = ({ photoURL, name, size = "w-24 h-24", textSize = "text-3xl", className = "" }) => {
  // If we have a valid photo URL, show image
  if (photoURL) {
    return (
      <img 
        src={photoURL} 
        alt={name || "Profile"} 
        className={`${size} rounded-full object-cover border-4 border-indigo-50 shadow-inner ${className}`}
      />
    );
  }

  // Fallback to initials
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white ${textSize} font-bold shadow-inner ${className}`}>
      {(name || "U").charAt(0).toUpperCase()}
    </div>
  );
};

export default Avatar;