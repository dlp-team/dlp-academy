// src/pages/Home/components/HomeShortcutFeedback.tsx
import React from 'react';
import { Copy } from 'lucide-react';
import NotificationToast from '../../../components/ui/NotificationToast';

type HomeShortcutFeedbackProps = {
    message: string;
    mutedTextClass: string;
};

const HomeShortcutFeedback = ({ message, mutedTextClass }: HomeShortcutFeedbackProps) => {
    void mutedTextClass;

    return (
        <NotificationToast
            show={Boolean(message)}
            title="Atajo de teclado"
            message={message}
            tone="info"
            position="bottom-left"
            icon={<Copy className="h-4 w-4" />}
            offset={0}
        />
    );
};

export default HomeShortcutFeedback;
