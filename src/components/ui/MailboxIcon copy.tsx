import React from 'react';

const MailboxIcon = ({ mailCount = 0, onClick }) => {
  const isEmpty = mailCount === 0;
  const isFew = mailCount > 0 && mailCount < 5;
  const isMany = mailCount >= 5;

  return (
    <button 
      onClick={onClick}
      className="relative p-2 text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-300 cursor-pointer group"
      title="Buzón de notificaciones"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 32 32" 
        className="w-8 h-8 transition-transform group-hover:scale-105"
      >
        {/* --- 1. GRASS & WOODEN POST (Always visible, matching photo) --- */}
        <path 
            d="M 17 30 l 1 -3 l 1.5 3 l 1.5 -4 l 1.5 4 l 1 -2 l 1 2" 
            className="stroke-green-500 dark:stroke-green-400" 
            fill="none" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path 
            d="M 20 18 V 30" 
            className="stroke-amber-700 dark:stroke-amber-600" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
        />

        {/* --- 2. MAILBOX BODY (Silver/Metallic) --- */}
        <path 
            d="M 8 18 H 26 A 3 3 0 0 0 29 15 V 10 A 4 4 0 0 0 25 6 H 12 A 4 4 0 0 0 8 10 V 18 Z" 
            className="fill-slate-200 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500" 
            strokeWidth="1.5" 
        />

        {/* --- 3. STATE 1 & 2: Door Closed --- */}
        {(isEmpty || isFew) && (
          <>
            {/* Front Arch Seam */}
            <line x1="12" y1="6" x2="12" y2="18" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" />
            {/* Door Handle */}
            <path d="M 6 10 V 14" className="stroke-slate-400 dark:stroke-slate-300" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* --- 4. STATE 3: Door Open (Overflowing) --- */}
        {isMany && (
          <>
            {/* Dark Inside Hole */}
            <path d="M 8 18 H 12 V 6 A 4 4 0 0 0 8 10 V 18 Z" className="fill-slate-800 dark:fill-slate-900" />
            
            {/* Dropped Door (Acting as a ramp like the photo) */}
            <path d="M 8 18 L 2 16.5 L 3.5 13 L 8 14 Z" className="fill-slate-300 dark:fill-slate-600 stroke-slate-400" strokeWidth="1" strokeLinejoin="round" />
            {/* Handle on dropped door */}
            <line x1="2" y1="15" x2="4" y2="11" className="stroke-slate-400 dark:stroke-slate-300" strokeWidth="2" strokeLinecap="round" />

            {/* Envelope 1 (Back) */}
            <path d="M 4 13 L 11 11 V 16 L 4 15 Z" className="fill-white dark:fill-slate-200 stroke-slate-400" strokeWidth="1" />
            {/* Envelope 2 (Front, sticking out) */}
            <path d="M 1 15 L 9 13 V 17 L 1 16 Z" className="fill-white dark:fill-slate-100 stroke-slate-400" strokeWidth="1" />
            {/* Envelope Flap Detail */}
            <path d="M 1 15 L 5 15.5 L 9 13" className="stroke-slate-400" fill="none" strokeWidth="1" />
          </>
        )}

        {/* --- 5. FLAG --- */}
        {isEmpty ? (
            /* STATE 1: Flag Down (Resting backward) */
            <>
                <line x1="22" y1="14" x2="28" y2="14" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 25 14 V 11 L 26 10 H 30 V 14 Z" className="fill-red-500 dark:fill-red-600" />
            </>
        ) : (
            /* STATE 2 & 3: Flag Up (Pointing forward, matching photo precisely) */
            <>
                <line x1="22" y1="14" x2="22" y2="3" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 22 3 H 17 L 16 4 V 8 H 22 Z" className="fill-red-500 dark:fill-red-600" />
            </>
        )}

        {/* Pivot Bolt for Flag */}
        <circle cx="22" cy="14" r="1.5" className="fill-slate-600 dark:fill-slate-300" />
      </svg>

      {/* Red notification dot/number */}
      {mailCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
          {mailCount > 99 ? '99+' : mailCount}
        </span>
      )}
    </button>
  );
};

export default MailboxIcon;