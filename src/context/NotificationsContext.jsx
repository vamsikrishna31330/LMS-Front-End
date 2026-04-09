import { createContext, useState, useContext, useCallback } from 'react';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'assignment',
      message: 'New assignment "Build a Todo App" is due Dec 5',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'grade',
      message: 'Your "Component Lifecycle" assignment was graded: A',
      time: '1 day ago',
      read: false,
    },
    {
      id: 3,
      type: 'course',
      message: 'You have been enrolled in React Fundamentals',
      time: '3 days ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((type, message) => {
    const newNotif = {
      id: Date.now(),
      type,
      message,
      time: 'just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const typeIcon = (type) => {
    switch (type) {
      case 'assignment': return '📝';
      case 'grade':      return '🎯';
      case 'course':     return '📚';
      case 'system':     return '⚙️';
      default:           return '🔔';
    }
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      typeIcon,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
