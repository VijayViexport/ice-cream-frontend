import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { getStatusInfo as getPaymentAwareStatusInfo } from '../utils/orderHelpers';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders');
      const data = response.data || response;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReorder = (order) => {
    // Add all items from this order to cart
    order.items?.forEach(item => {
      if (item.product && item.product.isActive) {
        addItem({
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          unitPrice: item.product.unitPrice,
          images: item.product.images,
          packSize: item.product.packSize,
          stock: item.product.stock,
          reservedStock: item.product.reservedStock,
          tieredPricing: item.product.tieredPricing
        }, item.quantity);
      }
    });
    navigate('/cart');
  };

  // Use payment-aware status info (COD vs Prepaid)
  const getStatusInfo = (status, paymentMethod) => {
    return getPaymentAwareStatusInfo(status, paymentMethod);
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusFilters = [
    { value: 'ALL', label: 'All Orders', icon: '📋' },
    { value: 'PENDING_PAYMENT', label: 'Pending', icon: '⏳' },
    { value: 'PAID', label: 'Paid', icon: '💵' },
    { value: 'DISPATCHED', label: 'Dispatched', icon: '📦' },
    { value: 'DELIVERED', label: 'Delivered', icon: '✓' }
  ];

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🍦
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  ICE Premium
                </h1>
                <p className="text-xs text-gray-500">Order Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/products"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                <span>🍦</span>
                <span>Browse Products</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-bounce">
              <div className="text-8xl mb-6">🍦</div>
            </div>
            <p className="text-xl text-gray-600 font-semibold">Loading your orders...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your order history</p>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-8 rounded-2xl flex items-start space-x-4 shadow-lg">
              <span className="text-4xl">⚠️</span>
              <div>
                <p className="font-bold text-lg mb-2">Error Loading Orders</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchOrders}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-orange-100">
              <div className="text-8xl mb-6 animate-bounce">📦</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Start your wholesale journey by placing your first order!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span>🍦</span>
                <span>Browse Products</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                    <span>📋</span>
                    <span>My Orders</span>
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
                  </p>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterStatus(filter.value)}
                      className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all touch-manipulation ${
                        filterStatus === filter.value
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-1">{filter.icon}</span>
                      <span className="hidden sm:inline">{filter.label}</span>
                      <span className="sm:hidden">{filter.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status, order.paymentMethod);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-orange-200"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                            <span className="mr-1">{statusInfo.icon}</span>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <span>📅</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <span>📦</span>
                            <span>{order.items?.length || 0} items</span>
                          </span>
                          {order.trackingNumber && (
                            <>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <span>🔍</span>
                                <span className="font-mono">{order.trackingNumber}</span>
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{statusInfo.description}</p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                            ₹{order.total?.toLocaleString() || 0}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                          Payment: {order.paymentStatus || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Shipping Address */}
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-xl">📍</span>
                          <p className="text-sm font-bold text-blue-900">Delivery Address</p>
                        </div>
                        {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                          <div className="text-sm text-blue-800">
                            <p className="font-semibold">{order.shippingAddress.label || 'Shipping Address'}</p>
                            <p className="mt-1">{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                            <p className="font-mono">{order.shippingAddress.pincode}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-blue-800">{order.shippingAddress}</p>
                        )}
                      </div>

                      {/* Payment Method */}
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-xl">💳</span>
                          <p className="text-sm font-bold text-green-900">Payment Method</p>
                        </div>
                        <p className="text-sm text-green-800 font-semibold">
                          {order.paymentMethod?.replace(/_/g, ' ') || 'Not specified'}
                        </p>
                        {order.paymentProofUrl && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-green-700">
                            <span>✓</span>
                            <span>Payment proof uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xl">🛒</span>
                        <p className="text-sm font-bold text-gray-900">Order Items</p>
                      </div>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => {
                          const mainImage = item.product?.images && item.product.images.length > 0
                            ? item.product.images[0]
                            : null;

                          return (
                            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                              <div className="h-14 w-14 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {mainImage ? (
                                  <img
                                    src={mainImage}
                                    alt={item.product?.name || 'Product'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ctext y="50%25" x="50%25" text-anchor="middle" dominant-baseline="middle" font-size="80"%3E🍦%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                ) : (
                                  <div className="text-2xl">🍦</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {item.product?.name || 'Product'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ₹{item.unitPrice?.toLocaleString() || 0} × {item.quantity} units
                                </p>
                              </div>
                              <p className="font-bold text-orange-600 text-lg">
                                ₹{item.lineTotal?.toLocaleString() || 0}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="flex-1 min-w-[200px] sm:flex-none px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold shadow-md hover:shadow-lg transition-all text-center touch-manipulation"
                      >
                        View Details →
                      </Link>

                      {order.status === 'DELIVERED' && (
                        <button
                          onClick={() => handleQuickReorder(order)}
                          className="flex-1 min-w-[140px] sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 touch-manipulation"
                        >
                          <span>🔄</span>
                          <span>Reorder</span>
                        </button>
                      )}

                      {order.status === 'PENDING_PAYMENT' && !order.paymentProofUrl && (
                        <Link
                          to={`/orders/${order.id}`}
                          className="flex-1 min-w-[200px] sm:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-semibold shadow-md hover:shadow-lg transition-all text-center touch-manipulation"
                        >
                          Upload Payment Proof
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredOrders.length === 0 && filterStatus !== 'ALL' && (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 inline-block">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-600 mb-4">
                    No orders match the selected filter
                  </p>
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-all"
                  >
                    Show All Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default OrdersPage;
