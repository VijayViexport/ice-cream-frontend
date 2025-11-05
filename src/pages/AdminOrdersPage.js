import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import OrderTimeline from '../components/OrderTimeline';
import { getStatusInfo, isCODOrder, getPaymentMethodName, getPaymentMethodIcon } from '../utils/orderHelpers';
import ConfirmModal from '../components/ConfirmModal';
import InputModal from '../components/InputModal';
import SuccessModal from '../components/SuccessModal';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal states
  const [showConfirmDelivered, setShowConfirmDelivered] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/products');
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/admin/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      await axios.patch(`/admin/orders/${orderId}/mark-paid`);
      fetchOrders();
      setModalMessage('Order marked as paid successfully');
      setShowSuccessModal(true);
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to mark order as paid');
      setShowErrorModal(true);
    }
  };

  const handleDispatch = async (trackingNumber) => {
    if (!pendingOrderId) return;

    try {
      // Allow dispatching without tracking number (it's optional)
      const payload = trackingNumber && trackingNumber.trim()
        ? { trackingNumber: trackingNumber.trim() }
        : {};

      await axios.patch(`/admin/orders/${pendingOrderId}/dispatch`, payload);
      fetchOrders();

      if (trackingNumber && trackingNumber.trim()) {
        setModalMessage('Order dispatched successfully with tracking number: ' + trackingNumber);
      } else {
        setModalMessage('Order dispatched successfully. You can add tracking number later if needed.');
      }

      setShowSuccessModal(true);
      setPendingOrderId(null);
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to dispatch order');
      setShowErrorModal(true);
    }
  };

  const handleMarkDelivered = async () => {
    if (!pendingOrderId) return;

    try {
      await axios.patch(`/admin/orders/${pendingOrderId}/deliver`);
      fetchOrders();
      setModalMessage('Order marked as delivered successfully');
      setShowSuccessModal(true);
      setPendingOrderId(null);
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to mark as delivered');
      setShowErrorModal(true);
    }
  };

  const handleCancelOrder = async (reason) => {
    if (!reason || !pendingOrderId) return;

    try {
      await axios.patch(`/admin/orders/${pendingOrderId}/cancel`, { reason });
      fetchOrders();
      setModalMessage('Order cancelled successfully');
      setShowSuccessModal(true);
      setPendingOrderId(null);
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to cancel order');
      setShowErrorModal(true);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      PAID: 'bg-green-100 text-green-800 border-green-300',
      DISPATCHED: 'bg-blue-100 text-blue-800 border-blue-300',
      DELIVERED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Parse shipping address from JSON string to object
  const parseShippingAddress = (address) => {
    if (!address) return null;
    if (typeof address === 'object') return address;
    try {
      return JSON.parse(address);
    } catch (e) {
      // Handle plain text strings (legacy data format)
      if (typeof address === 'string') {
        console.log('Using plain text address:', address);
        return {
          street: address,
          city: '',
          state: '',
          pincode: '',
          label: 'Address'
        };
      }
      console.error('Failed to parse shipping address:', e);
      return null;
    }
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING_PAYMENT', 'PAID', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all touch-manipulation ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {status.replace('_', ' ')}
                <span className="ml-2 text-xs opacity-75">
                  ({status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">
                {filterStatus === 'ALL'
                  ? 'No orders have been placed yet'
                  : `No orders with status: ${filterStatus.replace('_', ' ')}`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Customer:</span> {order.user?.businessName || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-semibold">Contact:</span> {order.user?.primaryContactName}
                      </div>
                      <div>
                        <span className="font-semibold">Email:</span> {order.user?.email}
                      </div>
                      <div>
                        <span className="font-semibold">Phone:</span> {order.user?.phone}
                      </div>
                      <div>
                        <span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Items:</span> {order.items?.length || 0} products
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-semibold">Payment Method:</span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                          isCODOrder(order.paymentMethod)
                            ? 'bg-orange-100 text-orange-800 border border-orange-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {getPaymentMethodIcon(order.paymentMethod)} {getPaymentMethodName(order.paymentMethod)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">₹{order.total?.toLocaleString()}</div>
                    <div className={`text-sm font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.paymentStatus}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.product?.name || 'Unknown Product'} × {item.quantity}
                          </span>
                          <span className="font-semibold text-gray-900">₹{item.subtotal?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {order.shippingAddress && (() => {
                  const address = parseShippingAddress(order.shippingAddress);
                  return address ? (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm">
                      <h4 className="font-semibold text-gray-900 mb-1">📍 Shipping Address:</h4>
                      <p className="text-gray-700">
                        <span className="font-medium">{address.label || 'Delivery Address'}</span><br />
                        {address.street}, {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4 text-sm">
                    <h4 className="font-semibold text-gray-900 mb-1">🚚 Tracking Number:</h4>
                    <p className="font-mono text-green-700">{order.trackingNumber}</p>
                  </div>
                )}

                {/* Action Buttons - COD-Aware Workflow */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {/* Prepaid Orders: Show payment verification */}
                  {!isCODOrder(order.paymentMethod) && order.paymentStatus === 'PENDING' && order.paymentProofUrl && (
                    <>
                      <button
                        onClick={() => handleMarkPaid(order.id)}
                        className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors touch-manipulation"
                      >
                        ✓ Mark as Paid
                      </button>
                      <a
                        href={order.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors touch-manipulation inline-block"
                      >
                        👁 View Payment Proof
                      </a>
                    </>
                  )}

                  {/* COD Orders: Can dispatch directly from PENDING_PAYMENT */}
                  {/* Prepaid Orders: Can dispatch only after PAID */}
                  {((isCODOrder(order.paymentMethod) && order.status === 'PENDING_PAYMENT') ||
                    order.status === 'PAID') && (
                    <button
                      onClick={() => {
                        setPendingOrderId(order.id);
                        setShowDispatchModal(true);
                      }}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors touch-manipulation"
                    >
                      🚚 Mark as Dispatched
                    </button>
                  )}

                  {order.status === 'DISPATCHED' && (
                    <button
                      onClick={() => {
                        setPendingOrderId(order.id);
                        setShowConfirmDelivered(true);
                      }}
                      className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors touch-manipulation"
                    >
                      {isCODOrder(order.paymentMethod)
                        ? '✓ Mark Delivered & Payment Received'
                        : '✓ Mark as Delivered'}
                    </button>
                  )}

                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <button
                      onClick={() => {
                        setPendingOrderId(order.id);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors touch-manipulation"
                    >
                      ✕ Cancel Order
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors touch-manipulation"
                  >
                    👁 View Full Details & Timeline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-full sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Order Details - #{selectedOrder.orderNumber}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Order Timeline */}
              <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>📍</span>
                  <span>Order Tracking Timeline</span>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                    isCODOrder(selectedOrder.paymentMethod)
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {getPaymentMethodIcon(selectedOrder.paymentMethod)} {getPaymentMethodName(selectedOrder.paymentMethod)}
                  </span>
                </h3>
                <OrderTimeline order={selectedOrder} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Customer Information</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold">Business:</span> {selectedOrder.user?.businessName}</p>
                    <p><span className="font-semibold">Contact:</span> {selectedOrder.user?.primaryContactName}</p>
                    <p><span className="font-semibold">Email:</span> {selectedOrder.user?.email}</p>
                    <p><span className="font-semibold">Phone:</span> {selectedOrder.user?.phone}</p>
                    {selectedOrder.user?.gstin && (
                      <p><span className="font-semibold">GSTIN:</span> {selectedOrder.user.gstin}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Order Information</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold">Status:</span> {selectedOrder.status}</p>
                    <p><span className="font-semibold">Payment:</span> {selectedOrder.paymentStatus}</p>
                    <p><span className="font-semibold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p><span className="font-semibold">Total:</span> ₹{selectedOrder.total?.toLocaleString()}</p>
                    {selectedOrder.trackingNumber && (
                      <p><span className="font-semibold">Tracking:</span> {selectedOrder.trackingNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">📍 Shipping Address</h3>
                {(() => {
                  const address = parseShippingAddress(selectedOrder.shippingAddress);
                  return address ? (
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold text-blue-900">{address.label || 'Delivery Address'}</p>
                      <p className="mt-1">{address.street}</p>
                      <p>{address.city}, {address.state}</p>
                      <p className="font-mono">{address.pincode}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">No shipping address available</p>
                  );
                })()}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="font-semibold text-gray-900">{item.product?.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ₹{item.unitPrice?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{item.subtotal?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      <InputModal
        isOpen={showDispatchModal}
        onClose={() => {
          setShowDispatchModal(false);
          setPendingOrderId(null);
        }}
        onSubmit={handleDispatch}
        title="Mark Order as Dispatched"
        message="You can add a tracking number now or skip and add it later when available."
        placeholder="Enter tracking number (optional)"
        submitText="Dispatch Order"
        cancelText="Cancel"
        icon="🚚"
        type="info"
        required={false}
        maxLength={100}
      />

      {/* Confirm Delivered Modal */}
      <ConfirmModal
        isOpen={showConfirmDelivered}
        onClose={() => {
          setShowConfirmDelivered(false);
          setPendingOrderId(null);
        }}
        onConfirm={handleMarkDelivered}
        title="Mark Order as Delivered"
        message="Are you sure you want to mark this order as delivered? This action confirms that the customer has received their order."
        confirmText="Mark as Delivered"
        type="success"
        icon="✓"
      />

      {/* Cancel Order Modal */}
      <InputModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setPendingOrderId(null);
        }}
        onSubmit={handleCancelOrder}
        title="Cancel Order"
        message="Please provide a detailed reason for cancelling this order. This will be visible to the customer."
        placeholder="Enter cancellation reason..."
        submitText="Cancel Order"
        inputType="textarea"
        icon="✕"
        type="warning"
        maxLength={500}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message={modalMessage}
        type="success"
      />

      {/* Error Modal */}
      <SuccessModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={modalMessage}
        type="error"
      />
    </div>
  );
}

export default AdminOrdersPage;
