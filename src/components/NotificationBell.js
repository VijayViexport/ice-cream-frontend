import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useSocket } from '../context/SocketContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { unreadCount } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-orange-500" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection indicator dot */}
        <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white"></span>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 z-50">
            <NotificationDropdown onClose={() => setShowDropdown(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
