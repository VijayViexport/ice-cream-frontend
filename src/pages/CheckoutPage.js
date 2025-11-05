import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    label: 'Primary',
    street: user?.businessAddress?.street || '',
    city: user?.businessAddress?.city || '',
    state: user?.businessAddress?.state || '',
    pincode: user?.businessAddress?.pincode || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('OFFLINE_BANK_TRANSFER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const steps = [
    { number: 1, name: 'Shipping', icon: '📦' },
    { number: 2, name: 'Payment', icon: '💳' },
    { number: 3, name: 'Review', icon: '✓' }
  ];

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateShippingAddress = () => {
    const errors = {};
    if (!shippingAddress.street.trim()) errors.street = 'Street address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateShippingAddress()) return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        shippingAddress,
        paymentMethod
      };

      const response = await axios.post('/orders', orderData);
      clearCart();
      navigate(`/orders/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodOptions = [
    {
      value: 'OFFLINE_BANK_TRANSFER',
      icon: '🏦',
      title: 'Bank Transfer (Recommended)',
      description: 'Direct transfer to our business account',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500'
    },
    {
      value: 'OFFLINE_CASH',
      icon: '💵',
      title: 'Cash on Delivery',
      description: 'Pay with cash when order arrives',
      badge: 'Instant',
      badgeColor: 'bg-green-500'
    },
    {
      value: 'OFFLINE_CHEQUE',
      icon: '📝',
      title: 'Business Cheque',
      description: 'Pay via company cheque',
      badge: 'Secure',
      badgeColor: 'bg-purple-500'
    }
  ];

  if (items.length === 0) {
    navigate('/products');
    return null;
  }

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
                <p className="text-xs text-gray-500">Secure Checkout</p>
              </div>
            </div>
            <Link
              to="/cart"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back to Cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? '✓' : step.icon}
                  </div>
                  <span
                    className={`mt-2 text-sm font-semibold ${
                      currentStep >= step.number ? 'text-orange-600' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 rounded-full bg-gray-200 relative -top-5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentStep > step.number
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 w-full'
                          : 'bg-gray-200 w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start space-x-3 shadow-md animate-shake">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Order Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 transform transition-all duration-300 animate-fadeIn">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Shipping Address</h3>
                    <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Label
                    </label>
                    <input
                      type="text"
                      name="label"
                      value={shippingAddress.label}
                      onChange={handleAddressChange}
                      placeholder="e.g., Main Warehouse, Distribution Center"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Optional: Give this address a memorable name</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                      placeholder="Building number, street name, area"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        validationErrors.street ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {validationErrors.street && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠️</span>
                        <span>{validationErrors.street}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        placeholder="Enter city"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          validationErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {validationErrors.city && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{validationErrors.city}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        placeholder="Enter state"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          validationErrors.state ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {validationErrors.state && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{validationErrors.state}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength="6"
                      value={shippingAddress.pincode}
                      onChange={handleAddressChange}
                      placeholder="6-digit pincode"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        validationErrors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {validationErrors.pincode && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠️</span>
                        <span>{validationErrors.pincode}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Delivery Information</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Free delivery on all B2B orders. Estimated delivery: 3-5 business days after payment verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Continue to Payment</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 transform transition-all duration-300 animate-fadeIn">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
                    💳
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Payment Method</h3>
                    <p className="text-sm text-gray-600">Choose how you'd like to pay</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentMethodOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        paymentMethod === option.value
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={paymentMethod === option.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 h-5 w-5 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{option.icon}</span>
                            <div>
                              <div className="font-bold text-gray-900">{option.title}</div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 ${option.badgeColor} text-white text-xs font-bold rounded-full`}>
                            {option.badge}
                          </span>
                        </div>
                      </div>
                      {paymentMethod === option.value && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                          ✓
                        </div>
                      )}
                    </label>
                  ))}
                </div>

                <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="font-bold text-gray-900 mb-2">Secure B2B Payment Process</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          <span>Place your order now and pay within 24 hours</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          <span>Upload payment proof in the order details page</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          <span>Our team verifies payment and processes your order</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          <span>Track your order status in real-time</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold text-lg transition-all flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Review Order</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                {/* Shipping Address Review */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📦</span>
                      <h4 className="font-bold text-gray-900 text-lg">Shipping Address</h4>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">{shippingAddress.label}</p>
                    <p className="text-gray-700 mt-1">{shippingAddress.street}</p>
                    <p className="text-gray-700">
                      {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                    </p>
                  </div>
                </div>

                {/* Payment Method Review */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💳</span>
                      <h4 className="font-bold text-gray-900 text-lg">Payment Method</h4>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">
                      {paymentMethodOptions.find(opt => opt.value === paymentMethod)?.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {paymentMethodOptions.find(opt => opt.value === paymentMethod)?.description}
                    </p>
                  </div>
                </div>

                {/* Order Items Review */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">🛒</span>
                    <h4 className="font-bold text-gray-900 text-lg">Order Items ({items.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const mainImage = item.images && item.images.length > 0 ? item.images[0] : null;
                      return (
                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className="h-16 w-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ctext y="50%25" x="50%25" text-anchor="middle" dominant-baseline="middle" font-size="80"%3E🍦%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="text-3xl">🍦</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              ₹{parseFloat(item.unitPrice).toLocaleString()} × {item.quantity} units
                            </p>
                          </div>
                          <p className="font-bold text-orange-600 text-lg">
                            ₹{(item.unitPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-6 border-2 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <p className="font-bold text-gray-900 mb-2">Terms & Conditions</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>All prices are exclusive of applicable taxes</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Stock is reserved for 24 hours after order placement</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Orders are processed after payment verification</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Free delivery on all wholesale orders across India</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold text-lg transition-all flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>Confirm & Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-[180px] border-2 border-orange-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>💰</span>
                <span>Order Summary</span>
              </h3>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm pb-3 border-b border-gray-100">
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        ₹{parseFloat(item.unitPrice).toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₹{(item.unitPrice * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">₹{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium flex items-center space-x-1">
                    <span>🚚</span>
                    <span>Delivery</span>
                  </span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 bg-gradient-to-r from-orange-50 to-orange-100 -mx-6 px-6 py-4 rounded-xl">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                      ₹{getTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-2xl mb-1">🔒</div>
                  <p className="text-xs text-gray-700 font-semibold">Secure</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-2xl mb-1">✓</div>
                  <p className="text-xs text-gray-700 font-semibold">Verified</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <div className="text-2xl mb-1">🚚</div>
                  <p className="text-xs text-gray-700 font-semibold">Free Shipping</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-xl">
                  <div className="text-2xl mb-1">💯</div>
                  <p className="text-xs text-gray-700 font-semibold">Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default CheckoutPage;
