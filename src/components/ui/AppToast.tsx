// src/components/ui/AppToast.tsx
import React from 'react';
import { Brain } from 'lucide-react';
import NotificationToast from './NotificationToast';

const AppToast = ({ show, message, onClose }: any) => {
    return (
        <NotificationToast
            show={show}
            title="Asistente IA"
            message={message}
            tone="info"
            position="bottom-left"
            icon={<Brain className="h-5 w-5" />}
            onClose={onClose}
        />
    );
};

export default AppToast;