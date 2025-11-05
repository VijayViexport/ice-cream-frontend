import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useSocket();
  const navigate = useNavigate();

  // Get icon based on notification type
  const getNotificationIcon = (type, priority) => {
    const iconClass = "h-5 w-5 flex-shrink-0";

    if (type === 'PAYMENT_CONFIRMATION' || type === 'ACCOUNT_APPROVED') {
      return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
    } else if (type === 'PAYMENT_REJECTED' || type === 'ACCOUNT_REJECTED') {
      return <XMarkIcon className={`${iconClass} text-red-500`} />;
    } else if (type === 'ORDER_STATUS_CHANGE') {
      return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    } else if (priority === 'URGENT' || priority === 'HIGH') {
      return <ExclamationTriangleIcon className={`${iconClass} text-orange-500`} />;
    } else {
      return <InformationCircleIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  // Get background color based on priority
  const getBackgroundColor = (isRead, priority) => {
    if (isRead) return 'bg-white';
    if (priority === 'URGENT') return 'bg-red-50';
    if (priority === 'HIGH') return 'bg-orange-50';
    return 'bg-blue-50';
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'ORDER_STATUS_CHANGE' && notification.data?.orderId) {
      navigate(`/orders/${notification.data.orderId}`);
      onClose();
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-white/90">{unreadCount} unread</p>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-medium text-white/90 hover:text-white flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <CheckIcon className="h-3 w-3" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[500px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
              <InformationCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No notifications</p>
            <p className="text-xs text-gray-500 mt-1">
              You're all caught up! We'll notify you when something happens.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative group ${getBackgroundColor(notification.isRead, notification.priority)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                    aria-label="Delete notification"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Priority indicator bar */}
                {(notification.priority === 'URGENT' || notification.priority === 'HIGH') && !notification.isRead && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${notification.priority === 'URGENT' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="w-full text-center text-xs font-medium text-gray-600 hover:text-orange-600 transition-colors py-1"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
