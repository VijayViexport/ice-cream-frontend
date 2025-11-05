import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useCartStore from '../store/cartStore';
import { useToast } from '../components/Toast';
import PaymentInstructions from '../components/PaymentInstructions';
import OrderTimeline from '../components/OrderTimeline';

function OrderDetailPage() {
  const { orderId} = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toast = useToast();

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/orders/${orderId}`);
      const data = response.data || response;
      setOrder(data);
    } catch (err) {
      console.error('Fetch order error:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setPaymentProof(e.target.files[0]);
  };

  const handleUploadProof = async () => {
    if (!paymentProof) {
      toast.warning('Please select a file to upload');
      return;
    }

    setUploadingProof(true);
    const formData = new FormData();
    formData.append('paymentProof', paymentProof);

    try {
      const response = await axios.post(`/orders/${orderId}/payment-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchOrder();
      setPaymentProof(null);
      // Clear the file input
      document.getElementById('payment-proof-upload').value = '';
      toast.success('Payment proof uploaded successfully! We will verify it within 24 hours.');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload payment proof');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleQuickReorder = () => {
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

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING_PAYMENT: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '⏳',
        label: 'Pending Payment',
        description: 'Awaiting payment confirmation'
      },
      PAID: {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: '💵',
        label: 'Paid',
        description: 'Payment received, processing order'
      },
      DISPATCHED: {
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: '📦',
        label: 'Dispatched',
        description: 'Order shipped and on its way'
      },
      DELIVERED: {
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '✓',
        label: 'Delivered',
        description: 'Order successfully delivered'
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '✕',
        label: 'Cancelled',
        description: 'Order has been cancelled'
      }
    };
    return statusMap[status] || {
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: '•',
      label: status,
      description: ''
    };
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-bounce">
            <div className="text-8xl mb-6">🍦</div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Loading order details...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-8 rounded-2xl flex items-start space-x-4 shadow-lg">
            <span className="text-4xl">⚠️</span>
            <div>
              <p className="font-bold text-lg mb-2">Error</p>
              <p className="text-sm">{error || 'Order not found'}</p>
            </div>
          </div>
          <Link
            to="/orders"
            className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold shadow-lg transition-all"
          >
            <span>←</span>
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

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
                <p className="text-xs text-gray-500">Order #{order.orderNumber}</p>
              </div>
            </div>
            <Link
              to="/orders"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back to Orders</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-orange-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <span className={`px-4 py-2 rounded-full text-sm font-bold border ${statusInfo.color}`}>
                  <span className="mr-1">{statusInfo.icon}</span>
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
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
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                ₹{order.total?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Order Tracking Timeline - Dynamic based on payment method */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-orange-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <span>📍</span>
            <span>Order Tracking</span>
          </h3>
          <OrderTimeline order={order} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🛒</span>
                <span>Order Items</span>
              </h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const mainImage = item.product?.images && item.product.images.length > 0
                    ? item.product.images[0]
                    : null;

                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl hover:shadow-md transition-all">
                      <div className="h-20 w-20 bg-gradient-to-br from-orange-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                          <div className="text-4xl">🍦</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{item.product?.name || 'Product'}</h4>
                        <p className="text-sm text-gray-500 font-mono">{item.product?.sku}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          ₹{item.unitPrice?.toLocaleString()} × {item.quantity} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">₹{item.lineTotal?.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Proof Upload */}
            {order.status === 'PENDING_PAYMENT' && order.paymentStatus === 'PENDING' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>💳</span>
                  <span>Upload Payment Proof</span>
                </h3>
                <div className="space-y-4">
                  <div className="p-5 bg-white rounded-xl shadow-sm border border-blue-100">
                    <p className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <span>🏦</span>
                      <span>Bank Transfer Details:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Bank Name</p>
                        <p className="font-semibold text-gray-900">ICICI Bank</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Account Name</p>
                        <p className="font-semibold text-gray-900">ICE Cream Factory</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-xs">Account Number</p>
                        <p className="font-semibold text-gray-900 font-mono">1234567890</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-xs">IFSC Code</p>
                        <p className="font-semibold text-gray-900 font-mono">ICIC0001234</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Upload Payment Receipt (Image/PDF)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer file:transition-all"
                    />
                    {paymentProof && (
                      <p className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                        <span>✓</span>
                        <span>File selected: {paymentProof.name}</span>
                      </p>
                    )}
                  </div>

                  {paymentProof && (
                    <button
                      onClick={handleUploadProof}
                      disabled={uploadingProof}
                      className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 touch-manipulation"
                    >
                      {uploadingProof ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <span>📤</span>
                          <span>Upload Payment Proof</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-800 flex items-start space-x-2">
                      <span className="text-lg">💡</span>
                      <span>Your order will be processed within 24 hours after payment verification by our team.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.paymentProofUrl && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>✓</span>
                  <span>Payment Proof Uploaded</span>
                </h3>
                <div className="p-5 bg-white rounded-xl">
                  <p className="text-sm text-green-600 mb-3 flex items-center space-x-2">
                    <span className="text-xl">✓</span>
                    <span className="font-semibold">Payment proof uploaded successfully</span>
                  </p>
                  <a
                    href={order.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                  >
                    <span>View Payment Proof</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-200 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>💰</span>
                <span>Order Summary</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">₹{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium flex items-center space-x-1">
                    <span>🚚</span>
                    <span>Delivery</span>
                  </span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 bg-gradient-to-r from-orange-50 to-orange-100 -mx-6 px-6 py-4 rounded-xl">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                      ₹{order.total?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {order.status === 'DELIVERED' && (
                <button
                  onClick={handleQuickReorder}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>🔄</span>
                  <span>Reorder</span>
                </button>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span>📍</span>
                <span>Shipping Address</span>
              </h3>
              {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="font-semibold text-blue-900">{order.shippingAddress.label || 'Delivery Address'}</p>
                  <p className="text-sm text-blue-800 mt-2">{order.shippingAddress.street}</p>
                  <p className="text-sm text-blue-800">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p className="text-sm text-blue-800 font-mono font-semibold">{order.shippingAddress.pincode}</p>
                </div>
              ) : (
                <p className="text-gray-700">{order.shippingAddress}</p>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span>💳</span>
                <span>Payment Info</span>
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">{order.paymentMethod?.replace(/_/g, ' ') || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Payment Status</p>
                  <p className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderDetailPage;
