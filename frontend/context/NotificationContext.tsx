
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Notification, NotificationType, NotificationCategory, ToastMessage, NotificationSettings } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  toasts: ToastMessage[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (title: string, message: string, type?: NotificationType, category?: NotificationCategory, link?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  removeToast: (id: string) => void;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  clearAll: () => void;
}

const defaultSettings: NotificationSettings = {
    email: true,
    push: true,
    sound: true,
    categories: {
        System: true,
        ERP: true,
        CRM: true,
        RH: true,
        Security: true,
        Tasks: true
    }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // -- State --
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  // -- Persistence --
  useEffect(() => {
      const savedNotifs = localStorage.getItem('agronare_notifications');
      const savedSettings = localStorage.getItem('agronare_notification_settings');
      
      if (savedNotifs) {
          try {
              setNotifications(JSON.parse(savedNotifs));
          } catch(e) { console.error("Failed to parse notifications", e); }
      }
      
      if (savedSettings) {
          try {
             setSettings(JSON.parse(savedSettings));
          } catch(e) { console.error("Failed to parse settings", e); }
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('agronare_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
      localStorage.setItem('agronare_notification_settings', JSON.stringify(settings));
  }, [settings]);

  // -- Play Sound --
  const playSound = (type: NotificationType) => {
      if (!settings.sound) return;
      // In a real app, use actual sound files. Using simple beep logic or Web Audio API here is overkill for mock.
      // Simulating by log for now.
      // console.log(`Playing sound for ${type}`);
  };

  // -- Actions --
  const addNotification = useCallback((
      title: string, 
      message: string, 
      type: NotificationType = 'info', 
      category: NotificationCategory = 'System', 
      link?: string
    ) => {
    
    // Check if category is muted
    if (!settings.categories[category]) return;

    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toISOString();

    const newNotification: Notification = {
      id, title, message, type, category, timestamp, read: false, link
    };

    // 1. Add to History
    setNotifications(prev => [newNotification, ...prev]);

    // 2. Trigger Toast (Transient)
    const newToast: ToastMessage = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // 3. Sound
    playSound(type);

  }, [settings]);

  const removeToast = useCallback((id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearAll = useCallback(() => {
      setNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
        notifications, toasts, unreadCount, settings,
        addNotification, markAsRead, markAllAsRead, removeNotification, removeToast, updateSettings, clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
