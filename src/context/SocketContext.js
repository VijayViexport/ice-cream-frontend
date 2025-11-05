import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize Socket.io connection
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    // Create Socket.io connection
    const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket.io connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
      setConnected(false);
    });

    // Listen for new notifications
    socketInstance.on('new_notification', (notification) => {
      console.log('🔔 New notification received:', notification);

      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);

      // Increment unread count
      setUnreadCount(prev => prev + 1);

      // Show toast notification
      showToastNotification(notification);
    });

    // Listen for notification updates
    socketInstance.on('notification_read', (notificationId) => {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    socketInstance.on('all_notifications_read', () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Show toast notification based on priority
  const showToastNotification = useCallback((notification) => {
    const { title, message, priority, type } = notification;

    const toastOptions = {
      duration: priority === 'URGENT' || priority === 'HIGH' ? 6000 : 4000,
      position: 'top-right',
      style: {
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '400px'
      }
    };

    // Color coding based on notification type
    if (type === 'PAYMENT_CONFIRMATION' || type === 'ACCOUNT_APPROVED' || type === 'ORDER_STATUS_CHANGE') {
      toast.success(`${title}\n${message}`, toastOptions);
    } else if (type === 'PAYMENT_REJECTED' || type === 'ACCOUNT_REJECTED') {
      toast.error(`${title}\n${message}`, toastOptions);
    } else {
      toast(`${title}\n${message}`, {
        ...toastOptions,
        icon: '🔔'
      });
    }
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications?limit=20`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/read-all`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
