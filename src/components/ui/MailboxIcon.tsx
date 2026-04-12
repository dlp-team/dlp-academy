// src/components/ui/MailboxIcon.tsx
import React from 'react';
import { Bell, BellRing } from 'lucide-react';

const MailboxIcon = ({ mailCount = 0, onClick, dark = false }: any) => {
  const hasUnread = mailCount > 0;
  const Icon = hasUnread ? BellRing : Bell;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
        dark
          ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
      }`}
      title="Notificaciones"
      aria-label="Abrir notificaciones"
    >
      <Icon className="h-5 w-5" />

      {hasUnread && (
        <span
          className={`absolute -left-1 -top-1 inline-flex min-w-[1.15rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm ${
            dark ? 'ring-2 ring-slate-900' : 'ring-2 ring-white'
          } bg-rose-500`}
        >
          {mailCount > 99 ? '99+' : mailCount}
        </span>
      )}
    </button>
  );
};

export default MailboxIcon;