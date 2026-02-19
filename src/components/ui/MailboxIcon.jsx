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
        className="w-7 h-7"
      >
        {/* Base Wooden Post (Always visible) */}
        <path d="M 8 16 V 22 M 5 22 H 11" strokeWidth="2" />

        {/* --- STATE 1 & 2: Door Closed --- */}
        {(isEmpty || isFew) && (
          <>
            {/* Mailbox Body (Rounded Front) */}
            <path d="M 4 16 V 6 H 14 C 17.5 6 20 8 20 11.5 V 16 Z" />
            {/* Door Seam */}
            <path d="M 14 6 V 16" />
            {/* Door Handle */}
            <path d="M 20 10.5 V 12.5" strokeWidth="2" />
          </>
        )}

        {/* --- STATE 3: Door Open (Overflowing) --- */}
        {isMany && (
          <>
            {/* Mailbox Body (Cut straight where door opens) */}
            <path d="M 4 16 V 6 H 14 V 16 Z" />
            {/* Door Dropped Open (Acting as a ramp) */}
            <path d="M 14 16 L 20 17.5" />
            {/* Door Handle on dropped door */}
            <path d="M 19 17 L 19.5 19" />

            {/* Background Letter */}
            <path 
                d="M 10 16 V 8 L 15 9.5 V 13 Z" 
                className="fill-white dark:fill-slate-900" 
                stroke="currentColor" 
                strokeWidth="1.5" 
            />
            {/* Foreground Letter (Sticking out onto the door) */}
            <path 
                d="M 13 16 V 11 L 18 13 V 16.5 Z" 
                className="fill-white dark:fill-slate-900" 
                stroke="currentColor" 
                strokeWidth="1.5" 
            />
            {/* Envelope Flap Detail */}
            <path d="M 13 11 L 15.5 13 L 18 13" strokeWidth="1.5" />
          </>
        )}

        {/* --- FLAG: STATE 1 (Down/Empty) --- */}
        {isEmpty && (
          <>
            {/* Arm laying flat */}
            <path d="M 10 11 H 13" strokeWidth="1.5" />
            {/* Red Flag */}
            <path d="M 13 9 H 16 V 13 H 13 Z" fill="#ef4444" stroke="none" />
          </>
        )}

        {/* --- FLAG: STATE 2 & 3 (Up/New Mail) --- */}
        {(isFew || isMany) && (
          <>
            {/* Arm sticking up */}
            <path d="M 11 11 V 8" strokeWidth="1.5" />
            {/* Red Flag above the box */}
            <path d="M 11 4 H 15 V 8 H 11 Z" fill="#ef4444" stroke="none" />
          </>
        )}
      </svg>

      {/* Red notification dot/number */}
      {mailCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border border-white dark:border-slate-900">
          {mailCount > 99 ? '99+' : mailCount}
        </span>
      )}
    </button>
  );
};

export default MailboxIcon;