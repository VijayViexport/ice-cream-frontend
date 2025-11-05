import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayments: 0,
    pendingUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/products');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, usersRes] = await Promise.all([
        axios.get('/admin/orders'),
        axios.get('/admin/users')
      ]);

      const ordersData = ordersRes.data || ordersRes;
      const usersData = usersRes.data || usersRes;

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);

      // Calculate stats
      const totalOrders = ordersRes.data.length;
      const pendingPayments = ordersRes.data.filter(o => o.paymentStatus === 'PENDING').length;
      const pendingUsers = usersRes.data.filter(u => u.status === 'PENDING').length;
      const totalRevenue = ordersRes.data
        .filter(o => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({ totalOrders, pendingPayments, pendingUsers, totalRevenue });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await axios.patch(`/admin/users/${userId}/approve`);
      fetchData();
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      await axios.patch(`/admin/orders/${orderId}/mark-paid`);
      fetchData();
    } catch (err) {
      alert('Failed to mark order as paid');
    }
  };

  const handleDispatch = async (orderId) => {
    const trackingNumber = prompt('Enter tracking number:');
    if (!trackingNumber) return;

    try {
      await axios.patch(`/admin/orders/${orderId}/dispatch`, { trackingNumber });
      fetchData();
    } catch (err) {
      alert('Failed to dispatch order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      DISPATCHED: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍦</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🍦</div>
              <h1 className="text-2xl font-bold text-gray-900">ICE - Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Users</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingUsers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({users.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No orders yet</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-500">
                            {order.user?.businessName} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold ml-2">₹{order.total?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment:</span>
                          <span className={`ml-2 font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Items:</span>
                          <span className="font-semibold ml-2">{order.items?.length || 0}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {order.paymentStatus === 'PENDING' && order.paymentProofUrl && (
                          <button
                            onClick={() => handleMarkPaid(order.id)}
                            className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                          >
                            Mark as Paid
                          </button>
                        )}
                        {order.status === 'PAID' && (
                          <button
                            onClick={() => handleDispatch(order.id)}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                          >
                            Mark as Dispatched
                          </button>
                        )}
                        {order.paymentProofUrl && (
                          <a
                            href={order.paymentProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                          >
                            View Payment Proof
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No users yet</p>
                ) : (
                  users.map((u) => (
                    <div key={u.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{u.businessName}</h3>
                          <p className="text-sm text-gray-600">{u.primaryContactName}</p>
                          <p className="text-sm text-gray-500">{u.email} • {u.phone}</p>
                          <p className="text-sm text-gray-500">{u.businessType?.replace('_', ' ')}</p>
                          {u.gstin && <p className="text-sm text-gray-500">GSTIN: {u.gstin}</p>}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            u.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {u.status}
                          </span>
                          {u.status === 'PENDING' && (
                            <button
                              onClick={() => handleApproveUser(u.id)}
                              className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                            >
                              Approve User
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
