import React, { useState } from 'react';
import { ShoppingCartIcon, EyeIcon, SparklesIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Enhanced Product Card Component - 2025 B2B E-commerce Best Practices
 * Research-based design incorporating:
 * - Modern glassmorphism and neumorphism
 * - B2B-specific features (SKU, bulk pricing, reorder indicators)
 * - Food industry trust signals
 * - Mobile-first responsive design
 * - Micro-interactions and smooth animations
 */
const ProductCard = ({ product, onAddToCart, onViewDetails, userStatus, hasOrderedBefore = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const availableStock = product.stock - product.reservedStock;
  const isLowStock = availableStock < product.reorderThreshold;
  const isOutOfStock = availableStock <= 0;
  const stockPercentage = Math.min(100, (availableStock / product.stock) * 100);
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const canOrder = !isOutOfStock && product.isActive && userStatus === 'APPROVED';

  // Calculate savings for bulk orders
  const bulkSavings = product.tieredPricing && product.tieredPricing.length > 0
    ? ((parseFloat(product.unitPrice) - parseFloat(product.tieredPricing[0].price)) / parseFloat(product.unitPrice) * 100).toFixed(0)
    : 0;

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-orange-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Premium Image Container with Advanced Effects */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Product Image */}
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className={`relative z-10 w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ctext y="50%25" x="50%25" text-anchor="middle" dominant-baseline="middle" font-size="80"%3E🍦%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="relative z-10 w-full h-full flex items-center justify-center text-8xl animate-float">
            🍦
          </div>
        )}

        {/* Glassmorphism Overlay - Appears on Hover */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        ></div>

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-30 gap-2">
          <div className="flex flex-col gap-2">
            {/* Featured Badge */}
            {product.featured && (
              <span className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm animate-pulse-slow">
                <SparklesIcon className="w-3 h-3" />
                <span>Featured</span>
              </span>
            )}

            {/* Reorder Badge - B2B Feature */}
            {hasOrderedBefore && (
              <span className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Reorder</span>
              </span>
            )}

            {/* Bulk Savings Badge */}
            {bulkSavings > 0 && (
              <span className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                <span>💰 Save {bulkSavings}%</span>
              </span>
            )}
          </div>

          {/* Stock Status Badge */}
          <div>
            {isOutOfStock && (
              <span className="inline-block px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                Out of Stock
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="inline-block px-3 py-1.5 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                Low Stock
              </span>
            )}
            {!isLowStock && !isOutOfStock && (
              <span className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                <TruckIcon className="w-3 h-3" />
                <span>In Stock</span>
              </span>
            )}
          </div>
        </div>

        {/* Category Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-30">
          <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md text-gray-800 text-xs font-bold rounded-full shadow-lg border border-white/20">
            {product.category}
          </span>
        </div>

        {/* Quick Action Buttons - Bottom Right - Appear on Hover */}
        <div className="absolute bottom-3 right-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={() => onViewDetails(product)}
            className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-white/20"
            title="Quick View"
          >
            <EyeIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4 flex flex-col flex-grow">
        {/* Product Name & SKU */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-mono tracking-wide">SKU: {product.sku}</p>
            {product.images && product.images.length > 1 && (
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>+{product.images.length - 1}</span>
              </span>
            )}
          </div>
        </div>

        {/* Price Section with Modern Design */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                ₹{parseFloat(product.unitPrice).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 font-medium">/unit</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">{product.packSize}</p>
          </div>

          {/* MOQ Badge */}
          {product.minimumOrderQuantity && product.minimumOrderQuantity > 1 && (
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold mb-0.5">MOQ</p>
              <p className="text-sm font-bold text-gray-900">{product.minimumOrderQuantity}</p>
            </div>
          )}
        </div>

        {/* Stock Indicator with Modern Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-600 font-semibold flex items-center space-x-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Available</span>
            </span>
            <span className={`font-bold text-sm ${
              isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
            }`}>
              {availableStock.toLocaleString()} units
            </span>
          </div>

          {/* Glassmorphic Progress Bar */}
          <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                isOutOfStock ? 'bg-gradient-to-r from-red-400 to-red-600' :
                isLowStock ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                'bg-gradient-to-r from-green-400 to-green-600'
              }`}
              style={{
                width: `${stockPercentage}%`,
                boxShadow: isHovered ? '0 0 10px rgba(var(--tw-shadow-color), 0.5)' : 'none'
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Bulk Pricing Teaser - Collapsible on Hover */}
        {product.tieredPricing && product.tieredPricing.length > 0 && (
          <div className="relative overflow-hidden">
            <div
              className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100 transition-all duration-300 ${
                isHovered ? 'max-h-32' : 'max-h-16'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-blue-700 font-bold flex items-center space-x-1">
                  <span>💰</span>
                  <span>Volume Pricing</span>
                </p>
                <svg
                  className={`w-4 h-4 text-blue-600 transition-transform duration-300 ${
                    isHovered ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-600 font-medium">
                    Buy {product.tieredPricing[0].minQuantity}+ units
                  </span>
                  <span className="text-sm font-bold text-blue-700">
                    ₹{parseFloat(product.tieredPricing[0].price).toLocaleString()}
                  </span>
                </div>

                {isHovered && product.tieredPricing.length > 1 && (
                  <div className="space-y-1 pt-1 border-t border-blue-200">
                    {product.tieredPricing.slice(1, 3).map((tier, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs opacity-80">
                        <span className="text-blue-600">{tier.minQuantity}+ units</span>
                        <span className="font-semibold text-blue-700">₹{parseFloat(tier.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Button Section - Always at bottom */}
        <div className="space-y-3 mt-auto">
          {/* Action Button with Premium Design */}
          <button
          onClick={() => onAddToCart(product, 1)}
          disabled={!canOrder}
          className={`
            relative w-full py-3.5 px-4 rounded-xl font-bold text-sm
            transition-all duration-300 transform
            overflow-hidden group/btn
            ${canOrder
              ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-pink-500 text-white hover:from-orange-600 hover:via-orange-700 hover:to-pink-600 shadow-lg hover:shadow-xl active:scale-95 hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {/* Button Shine Effect */}
          {canOrder && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover/btn:translate-x-full transition-transform duration-1000 -translate-x-full"></div>
          )}

          <span className="relative z-10 flex items-center justify-center space-x-2">
            <ShoppingCartIcon className="w-5 h-5" />
            <span>
              {isOutOfStock ? 'Out of Stock' :
               userStatus !== 'APPROVED' ? 'Approval Required' :
               'Add to Cart'}
            </span>
          </span>
        </button>

        {/* Trust Signals - B2B Specific */}
        {canOrder && (
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Quality Assured</span>
            </div>
            <div className="flex items-center space-x-1">
              <TruckIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">Fast Delivery</span>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Corner Accent - Premium Touch */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

export default ProductCard;
