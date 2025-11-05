import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import NotificationBell from '../components/NotificationBell';
import ProductCard from '../components/ProductCard';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { addItem, getItemCount } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      const data = response.data || response;
      const productsToSet = Array.isArray(data) ? data : (data.products || []);
      setProducts(productsToSet);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, quantity = 1) => {
    addItem(product, quantity);
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    toast.textContent = `${product.name} added to cart!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = Array.isArray(products) ? products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return parseFloat(a.unitPrice) - parseFloat(b.unitPrice);
      if (sortBy === 'price-high') return parseFloat(b.unitPrice) - parseFloat(a.unitPrice);
      if (sortBy === 'stock') return (b.stock - b.reservedStock) - (a.stock - a.reservedStock);
      return 0;
    }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-blue-50">
      {/* Professional B2B Header with Integrated Search */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        {/* Top Bar - User Info & Quick Actions */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-900">{user?.businessName}</span>
                </span>
                {user?.status === 'APPROVED' && (
                  <span className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <a href="tel:+911234567890" className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-orange-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span className="font-medium">Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/products" className="flex items-center space-x-3 flex-shrink-0 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-2xl">🍦</span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-bold font-display bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  ICE
                </span>
                <span className="text-xs text-gray-500 font-medium">Premium Wholesale</span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products, SKU, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to="/orders"
                className="hidden sm:flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span className="text-sm">Orders</span>
              </Link>

              {/* Notification Bell */}
              <NotificationBell />

              <Link
                to="/cart"
                className="relative flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span className="hidden sm:inline text-sm">Cart</span>
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[1.5rem] h-6 flex items-center justify-center font-bold px-1.5 shadow-lg">
                    {getItemCount()}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all touch-manipulation"
                title="Logout"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden mt-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Pending Approval Banner */}
      {user?.status === 'PENDING' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Account Pending Approval:</span> You can browse products, but ordering is disabled until your account is approved by our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.status === 'BLOCKED' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🚫</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">Account Suspended:</span> Your account has been suspended. Please contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Mobile-Optimized Filters Section */}
        <div className="mb-4 sm:mb-6">
          {/* Desktop: Card Layout */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-gray-900">Products</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 rounded-full text-sm font-semibold">
                  {filteredProducts.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm font-medium text-gray-700 transition-all hover:border-gray-400 cursor-pointer"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="stock">Stock</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: Sticky Horizontal Scroll + Compact Layout */}
          <div className="md:hidden">
            {/* Top Row: Count + Sort */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">{filteredProducts.length}</span>
                <span className="text-xs text-gray-500">Products</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white text-xs font-medium text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock</option>
              </select>
            </div>

            {/* Horizontal Scrolling Category Pills */}
            <div className="relative -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-xs transition-all snap-start touch-manipulation ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-bounce text-6xl mb-4">🍦</div>
            <p className="text-gray-600 text-lg">Loading delicious products...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Premium Ice Cream Collection
                </span>
                <span className="ml-3 text-gray-500 text-lg">({filteredProducts.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={setSelectedProduct}
                  userStatus={user?.status}
                  hasOrderedBefore={false} // TODO: Track this from order history
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6 animate-bounce">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl max-w-full sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <>
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-full h-96 object-cover rounded-xl shadow-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ctext y="50%25" x="50%25" text-anchor="middle" dominant-baseline="middle" font-size="80"%3E🍦%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {selectedProduct.images.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {selectedProduct.images.slice(1).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${selectedProduct.name} ${idx + 2}`}
                              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-orange-100 to-blue-100 rounded-xl flex items-center justify-center text-9xl">
                      🍦
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-3">
                      {selectedProduct.category}
                    </span>
                    <p className="text-gray-600 leading-relaxed">{selectedProduct.description || 'Premium quality ice cream perfect for your business needs.'}</p>
                  </div>

                  <div className="border-t border-b py-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-mono font-semibold">{selectedProduct.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pack Size:</span>
                      <span className="font-semibold">{selectedProduct.packSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Stock:</span>
                      <span className="font-semibold text-green-600">{selectedProduct.stock - selectedProduct.reservedStock} units</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="text-3xl font-bold text-orange-600">₹{parseFloat(selectedProduct.unitPrice).toLocaleString()}</span>
                    </div>
                  </div>

                  {selectedProduct.tieredPricing && selectedProduct.tieredPricing.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                        <span>💰</span>
                        <span>Volume Discounts</span>
                      </h4>
                      <div className="space-y-2">
                        {selectedProduct.tieredPricing.map((tier, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{tier.minQuantity}+ units</span>
                            <span className="text-lg font-bold text-green-600">₹{parseFloat(tier.price).toLocaleString()}/unit</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedProduct.nutrition || selectedProduct.allergens) && (
                    <div className="space-y-3">
                      {selectedProduct.nutrition && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <h4 className="font-bold text-gray-900 mb-2">📊 Nutrition Information</h4>
                          <p className="text-sm text-gray-700">{selectedProduct.nutrition}</p>
                        </div>
                      )}
                      {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                        <div className="bg-red-50 p-4 rounded-xl">
                          <h4 className="font-bold text-red-900 mb-2">⚠️ Allergens</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.allergens.map((allergen, idx) => (
                              <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock - selectedProduct.reservedStock <= 0 || user?.status !== 'APPROVED'}
                    className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedProduct.stock - selectedProduct.reservedStock <= 0 ? '❌ Out of Stock' : user?.status !== 'APPROVED' ? '⏳ Approval Required' : '🛒 Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Enhanced Animations for Product Cards */
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        /* Hide scrollbar for horizontal scroll */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default ProductsPage;
