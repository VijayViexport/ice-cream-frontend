import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { ToastProvider } from './components/Toast';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import axios from './api/axios';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminLayout from './components/AdminLayout';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/products" replace />;
  }

  if (!adminOnly && user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

// Public Route (redirect if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/products" replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated, token, updateUser, logout } = useAuthStore();

  // Refresh user data on app mount to get latest status
  useEffect(() => {
    const refreshUserData = async () => {
      if (isAuthenticated && token) {
        try {
          const response = await axios.get('/auth/me');
          updateUser(response.data.user);
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          // If token is invalid, logout
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
    };

    refreshUserData();
  }, [isAuthenticated, token, updateUser, logout]);

  return (
    <ToastProvider>
      <SocketProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff'
                }
              }
            }}
          />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Buyer Routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes with Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminAnalyticsDashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="rfqs" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </SocketProvider>
    </ToastProvider>
  );
}

export default App;
