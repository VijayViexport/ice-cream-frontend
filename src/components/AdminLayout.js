import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      path: '/admin/products',
      icon: '🍦',
      label: 'Products',
      description: 'Manage Products'
    },
    {
      path: '/admin/orders',
      icon: '📦',
      label: 'Orders',
      description: 'Manage Orders'
    },
    {
      path: '/admin/users',
      icon: '👥',
      label: 'Users',
      description: 'Manage Customers'
    },
    {
      path: '/admin/rfqs',
      icon: '📋',
      label: 'RFQs',
      description: 'Quote Requests'
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} hidden lg:flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 flex-col shadow-2xl`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <div className="text-4xl">🍦</div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent font-display">
                    ICE Admin
                  </h1>
                  <p className="text-xs text-gray-400">Management Portal</p>
                </div>
              </div>
            ) : (
              <div className="text-3xl mx-auto">🍦</div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? '⬅' : '➡'}
            </button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="px-6 py-4 bg-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.email}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`
              }
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && (
                <div className="ml-4">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all`}
          >
            <span className="text-xl">🏠</span>
            {sidebarOpen && <span className="ml-4 font-medium">View Website</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all`}
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="ml-4 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transform transition-transform duration-300 lg:hidden ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col shadow-2xl`}>
        {/* Logo Section with Close Button */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🍦</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent font-display">
                  ICE Admin
                </h1>
                <p className="text-xs text-gray-400">Management Portal</p>
              </div>
            </div>
            <button
              onClick={closeMobileSidebar}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`
              }
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="ml-4">
                <div className="font-semibold">{item.label}</div>
                <div className="text-xs opacity-75">{item.description}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={() => {
              navigate('/');
              closeMobileSidebar();
            }}
            className="w-full flex items-center px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
          >
            <span className="text-xl">🏠</span>
            <span className="ml-4 font-medium">View Website</span>
          </button>
          <button
            onClick={() => {
              handleLogout();
              closeMobileSidebar();
            }}
            className="w-full flex items-center px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className="ml-4 font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden lg:block">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900">Admin Portal</h2>
              <p className="text-sm text-gray-600">Manage your B2B ice cream business</p>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notification Bell */}
              <NotificationBell />

              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.businessName || 'Admin User'}</p>
                <p className="text-xs text-gray-500 hidden md:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
