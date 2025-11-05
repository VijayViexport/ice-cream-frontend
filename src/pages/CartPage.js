import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-blue-50">
        <header className="bg-white/90 backdrop-blur-md shadow-md">
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
                  <p className="text-xs text-gray-500">Shopping Cart</p>
                </div>
              </div>
              <Link
                to="/products"
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                ← Back to Products
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-8xl mb-6 animate-bounce">🛒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Start adding some delicious ice cream products!</p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <span>🍦</span>
              <span>Browse Products</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-blue-50">
      <header className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-40">
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
                <p className="text-xs text-gray-500">Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</p>
              </div>
            </div>
            <Link
              to="/products"
              className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span className="hidden sm:inline">Continue Shopping</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const mainImage = item.images && item.images.length > 0 ? item.images[0] : null;

              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="h-28 w-28 bg-gradient-to-br from-orange-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                        <div className="text-5xl">🍦</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mb-1">{item.sku}</p>
                      <p className="text-sm text-gray-600 mb-2">{item.packSize}</p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-bold text-orange-600">
                          ₹{parseFloat(item.unitPrice).toLocaleString()}
                        </p>
                        <span className="text-sm text-gray-500">per unit</span>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end space-y-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 bg-white rounded-lg hover:bg-orange-500 hover:text-white font-bold transition-all shadow-sm"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-bold text-gray-900 min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 bg-white rounded-lg hover:bg-orange-500 hover:text-white font-bold transition-all shadow-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right bg-orange-50 px-4 py-2 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Subtotal</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ₹{(item.unitPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                      >
                        <span>🗑️</span>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Tiered Pricing Info */}
                  {item.tieredPricing && item.tieredPricing.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <span className="text-lg">💰</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">Volume Discount Available!</p>
                          <p className="text-xs text-blue-700">
                            Order {item.tieredPricing[0].minQuantity}+ units to get ₹{parseFloat(item.tieredPricing[0].price).toLocaleString()}/unit
                            {item.quantity >= item.tieredPricing[0].minQuantity && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold">Applied!</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-orange-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📋</span>
                <span>Order Summary</span>
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Items ({items.length})</span>
                  <span className="font-semibold">₹{getTotal().toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Total Quantity</span>
                  <span className="font-semibold">{items.reduce((sum, item) => sum + item.quantity, 0)} units</span>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-4">
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">₹{getTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium flex items-center space-x-1">
                      <span>📦</span>
                      <span>Delivery</span>
                    </span>
                    <span className="font-bold">FREE</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-300 pt-4 bg-gradient-to-r from-orange-50 to-orange-100 -mx-6 px-6 py-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                      ₹{getTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                🚀 Proceed to Checkout
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-2">
                  <span className="text-xl">ℹ️</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">B2B Platform</p>
                    <p className="text-xs text-blue-700">
                      Payment will be processed offline. You'll upload payment proof after placing the order.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">✓</div>
                  <p className="text-xs text-gray-600 font-medium">Secure</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">🚚</div>
                  <p className="text-xs text-gray-600 font-medium">Free Delivery</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">💯</div>
                  <p className="text-xs text-gray-600 font-medium">Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CartPage;
