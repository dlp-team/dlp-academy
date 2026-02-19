import React from 'react';

const MailboxIcon = ({ mailCount = 0, onClick }) => {
  const isEmpty = mailCount === 0;
  const isFew = mailCount > 0 && mailCount < 5;
  const isMany = mailCount >= 5;

  return (
    <button 
      onClick={onClick}
      className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200 cursor-pointer"
      title="Buzón de notificaciones"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-6 h-6"
      >
        {/* Base Mailbox Body */}
        <path d="M4 8.5C4 6.01472 6.01472 4 8.5 4H17C18.6569 4 20 5.34315 20 7V13C20 14.6569 18.6569 16 17 16H8.5C6.01472 16 4 13.9853 4 11.5V8.5Z" />
        <path d="M4 11.5V16" />
        <path d="M4 11.5C4 13.9853 6.01472 16 8.5 16" />
        
        {/* Support Pole */}
        <path d="M12 16V22" />
        <path d="M9 22H15" />

        {/* State 1: Nothing New (Flag Down) */}
        {isEmpty && (
          <path d="M15 10 L19 10 L19 12 L15 12 Z" fill="currentColor" stroke="none" />
        )}

        {/* State 2 & 3: New Mail (Flag Up) */}
        {(isFew || isMany) && (
          <path d="M15 10 L15 5 L17 5 L17 10 Z" fill="#ef4444" stroke="none" />
        )}

        {/* State 3: Overflowing Mail (Cards sticking out of the door) */}
        {isMany && (
          <>
            <path d="M3 8 L6 3 L9 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 11 L8 6 L10 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {/* Optional: Visual badge for exact numbers */}
      {mailCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border border-white dark:border-slate-900">
          {mailCount > 99 ? '99+' : mailCount}
        </span>
      )}
    </button>
  );
};

export default MailboxIcon;