import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ReactNode } from 'react';

export interface Notification {
    id: string;
    title: string;
    type: 'success' | 'error' | 'info' | 'warning' | 'download';
    message?: string;
    progress?: number; // 0-100
    status?: 'pending' | 'completed' | 'failed';
    timestamp: number;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
    updateNotification: (id: string, updates: Partial<Notification>) => void;
    removeNotification: (id: string) => void;
    startFlyingAnimation: (startRect: DOMRect, iconClass?: string) => void;
    flyingElement: FlyingElementData | null;
    isNotificationPanelOpen: boolean;
    closeNotificationPanel: () => void;
    toggleNotificationPanel: () => void;
}

interface FlyingElementData {
    startRect: DOMRect;
    iconClass?: string;
    id: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [flyingElement, setFlyingElement] = useState<FlyingElementData | null>(null);

    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const id = uuidv4();
        setNotifications(prev => [{ ...notification, id, timestamp: Date.now() }, ...prev]);
        return id;
    }, []);

    const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const startFlyingAnimation = useCallback((startRect: DOMRect, iconClass?: string) => {
        const id = uuidv4();
        setFlyingElement({ startRect, iconClass, id });
        // Animation duration is 800ms in FlyingElement, let's wait a bit more then open panel
        setTimeout(() => {
            setFlyingElement(null);
            setIsNotificationPanelOpen(true); // Open panel after fly
        }, 900);
    }, []);

    const closeNotificationPanel = useCallback(() => setIsNotificationPanelOpen(false), []);
    const toggleNotificationPanel = useCallback(() => setIsNotificationPanelOpen(prev => !prev), []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            updateNotification,
            removeNotification,
            startFlyingAnimation,
            flyingElement,
            isNotificationPanelOpen,
            closeNotificationPanel,
            toggleNotificationPanel
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
