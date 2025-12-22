
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { NotificationType } from '../../types';

interface ToastProps {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    duration?: number;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, title, message, type, duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for exit animation
        setTimeout(() => onClose(id), 300);
    };

    const config = {
        success: { icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300', iconColor: 'text-emerald-500' },
        error: { icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-300', iconColor: 'text-red-500' },
        warning: { icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', iconColor: 'text-amber-500' },
        info: { icon: Info, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', iconColor: 'text-blue-500' }
    }[type];

    const Icon = config.icon;

    return (
        <div 
            className={`
                w-full max-w-sm rounded-xl border shadow-lg pointer-events-auto flex items-start p-4 gap-3 transition-all duration-300 transform
                ${config.bg} ${config.border}
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1">
                <h4 className={`text-sm font-bold ${config.text}`}>{title}</h4>
                <p className={`text-xs mt-1 opacity-90 ${config.text}`}>{message}</p>
            </div>
            <button onClick={handleClose} className={`p-1 hover:bg-black/5 rounded transition-colors ${config.text}`}>
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
