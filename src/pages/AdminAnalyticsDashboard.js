import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';

function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    pendingUsers: 0,
    deliveredOrders: 0,
    activeUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/products');
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        axios.get('/admin/orders'),
        axios.get('/admin/users'),
        axios.get('/products')
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products || []);

      // Calculate stats
      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

      const calculatedStats = {
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: users.length,
        totalProducts: products.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING_PAYMENT').length,
        pendingUsers: users.filter(u => u.status === 'PENDING').length,
        deliveredOrders: orders.filter(o => o.status === 'DELIVERED').length,
        activeUsers: users.filter(u => u.status === 'APPROVED').length,
      };

      setStats(calculatedStats);

      // Recent orders (last 5)
      const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));

      // Top products by order count
      const productCounts = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          const productId = item.product?.id;
          const productName = item.product?.name || 'Unknown Product';
          if (productId) {
            if (!productCounts[productId]) {
              productCounts[productId] = { name: productName, count: 0, revenue: 0 };
            }
            productCounts[productId].count += item.quantity || 0;
            productCounts[productId].revenue += parseFloat(item.subtotal) || 0;
          }
        });
      });

      const topProductsArray = Object.entries(productCounts)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProducts(topProductsArray);

      // Revenue by month (last 6 months)
      const monthlyRevenue = {};
      orders.forEach(order => {
        if (order.paymentStatus === 'PAID') {
          const date = new Date(order.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (parseFloat(order.total) || 0);
        }
      });

      const revenueArray = Object.entries(monthlyRevenue)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([month, revenue]) => ({ month, revenue }));

      setRevenueByMonth(revenueArray);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="text-5xl">💰</div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">Revenue</div>
            </div>
            <div className="text-4xl font-bold mb-1">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-green-100 text-sm">Total earnings</div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="text-5xl">📦</div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">Orders</div>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalOrders}</div>
            <div className="text-blue-100 text-sm">{stats.deliveredOrders} delivered • {stats.pendingOrders} pending</div>
          </div>

          {/* Total Users */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="text-5xl">👥</div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">Users</div>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalUsers}</div>
            <div className="text-purple-100 text-sm">{stats.activeUsers} active • {stats.pendingUsers} pending</div>
          </div>

          {/* Total Products */}
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="text-5xl">🍦</div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">Products</div>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalProducts}</div>
            <div className="text-orange-100 text-sm">In catalog</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                Recent Orders
              </h2>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">#{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">{order.user?.businessName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-gray-900">₹{order.total?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                Top Products
              </h2>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No product data yet</p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.count} units sold</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">₹{product.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        {revenueByMonth.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">📈</span>
              Revenue Trend (Last 6 Months)
            </h2>
            <div className="flex items-end justify-between space-x-2 h-64">
              {revenueByMonth.map((item, index) => {
                const maxRevenue = Math.max(...revenueByMonth.map(r => r.revenue));
                const height = (item.revenue / maxRevenue) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col justify-end h-56 mb-2">
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-pink-500 rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{item.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🍦</div>
            <h3 className="font-bold text-gray-900 mb-1">Manage Products</h3>
            <p className="text-sm text-gray-600">Add, edit or delete products</p>
          </button>

          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
            <h3 className="font-bold text-gray-900 mb-1">View Orders</h3>
            <p className="text-sm text-gray-600">Process and track orders</p>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="font-bold text-gray-900 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-600">Approve and manage customers</p>
          </button>

          <button
            onClick={() => navigate('/admin/rfqs')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="font-bold text-gray-900 mb-1">View RFQs</h3>
            <p className="text-sm text-gray-600">Review quote requests</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsDashboard;
