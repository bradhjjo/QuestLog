import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useNotifications = () => {
    const [permission, setPermission] = useState('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) return false;

        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    };

    const showLocalNotification = (title, options = {}) => {
        if (permission === 'granted') {
            new Notification(title, {
                icon: '/icon.svg',
                badge: '/icon.svg',
                ...options
            });
        }
    };

    // Note: Background Push Notifications require VAPID keys and a backend/Edge Function.
    // This implementation handles the permission and local browser notifications.

    return {
        permission,
        isSupported,
        requestPermission,
        showLocalNotification
    };
};
