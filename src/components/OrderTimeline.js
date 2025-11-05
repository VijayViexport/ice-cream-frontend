import React from 'react';

/**
 * Dynamic Order Timeline Component
 * Adapts timeline steps based on payment method (COD vs Prepaid)
 */
function OrderTimeline({ order }) {
  const isCOD = order.paymentMethod === 'OFFLINE_CASH';
  const isPrepaid = ['OFFLINE_BANK_TRANSFER', 'OFFLINE_CHEQUE'].includes(order.paymentMethod);

  // Define timeline steps based on payment method
  const getTimelineSteps = () => {
    if (isCOD) {
      // COD: No upfront payment confirmation needed
      return [
        {
          id: 'placed',
          label: 'Order Placed',
          icon: '📝',
          description: 'Your order has been received',
          completedWhen: ['PENDING_PAYMENT', 'PAID', 'DISPATCHED', 'DELIVERED'],
          timestamp: order.createdAt
        },
        {
          id: 'confirmed',
          label: 'Order Confirmed',
          icon: '✓',
          description: 'Order verified and ready for processing',
          completedWhen: ['PAID', 'DISPATCHED', 'DELIVERED'],
          timestamp: order.paymentStatus === 'PAID' ? order.paymentReceivedAt : null
        },
        {
          id: 'processing',
          label: 'Processing',
          icon: '📦',
          description: 'Preparing your order for shipment',
          completedWhen: ['DISPATCHED', 'DELIVERED'],
          timestamp: null
        },
        {
          id: 'dispatched',
          label: 'Dispatched',
          icon: '🚚',
          description: 'Order is on its way',
          completedWhen: ['DISPATCHED', 'DELIVERED'],
          timestamp: order.dispatchedAt,
          trackingInfo: order.trackingNumber ? {
            courier: order.courier,
            trackingNumber: order.trackingNumber
          } : null
        },
        {
          id: 'payment_delivery',
          label: 'Payment on Delivery',
          icon: '💵',
          description: 'Pay when you receive your order',
          completedWhen: ['DELIVERED'],
          timestamp: order.deliveredAt,
          highlight: true // Special highlight for COD payment step
        },
        {
          id: 'delivered',
          label: 'Delivered',
          icon: '🎉',
          description: 'Order successfully delivered',
          completedWhen: ['DELIVERED'],
          timestamp: order.deliveredAt
        }
      ];
    } else {
      // Prepaid: Requires payment confirmation first
      return [
        {
          id: 'placed',
          label: 'Order Placed',
          icon: '📝',
          description: 'Your order has been received',
          completedWhen: ['PENDING_PAYMENT', 'PAID', 'DISPATCHED', 'DELIVERED'],
          timestamp: order.createdAt
        },
        {
          id: 'payment_pending',
          label: 'Payment Pending',
          icon: '⏳',
          description: isPrepaid ? 'Awaiting payment proof upload' : 'Waiting for payment',
          completedWhen: ['PAID', 'DISPATCHED', 'DELIVERED'],
          timestamp: null,
          warning: order.status === 'PENDING_PAYMENT'
        },
        {
          id: 'payment_confirmed',
          label: 'Payment Confirmed',
          icon: '💳',
          description: 'Payment verified successfully',
          completedWhen: ['PAID', 'DISPATCHED', 'DELIVERED'],
          timestamp: order.paymentReceivedAt
        },
        {
          id: 'processing',
          label: 'Processing',
          icon: '📦',
          description: 'Preparing your order for shipment',
          completedWhen: ['DISPATCHED', 'DELIVERED'],
          timestamp: null
        },
        {
          id: 'dispatched',
          label: 'Dispatched',
          icon: '🚚',
          description: 'Order is on its way',
          completedWhen: ['DISPATCHED', 'DELIVERED'],
          timestamp: order.dispatchedAt,
          trackingInfo: order.trackingNumber ? {
            courier: order.courier,
            trackingNumber: order.trackingNumber
          } : null
        },
        {
          id: 'delivered',
          label: 'Delivered',
          icon: '🎉',
          description: 'Order successfully delivered',
          completedWhen: ['DELIVERED'],
          timestamp: order.deliveredAt
        }
      ];
    }
  };

  const steps = getTimelineSteps();

  // Check if step is completed
  const isStepCompleted = (step) => {
    return step.completedWhen.includes(order.status);
  };

  // Check if step is current/active
  const isStepCurrent = (step, index) => {
    const isCompleted = isStepCompleted(step);
    const nextStep = steps[index + 1];
    const isNextCompleted = nextStep ? isStepCompleted(nextStep) : false;
    return isCompleted && !isNextCompleted;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-1">
      {/* Payment Method Badge */}
      <div className="mb-6">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${
          isCOD
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300'
            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-300'
        }`}>
          <span className="text-lg">
            {isCOD ? '💵' : order.paymentMethod === 'OFFLINE_CHEQUE' ? '📝' : '🏦'}
          </span>
          <span>
            {isCOD ? 'Cash on Delivery' : order.paymentMethod === 'OFFLINE_CHEQUE' ? 'Cheque Payment' : 'Bank Transfer'}
          </span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step);
          const isCurrent = isStepCurrent(step, index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative pb-8">
              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-full ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{ marginTop: '-0.5rem' }}
                />
              )}

              {/* Step Container */}
              <div className="relative flex items-start space-x-4">
                {/* Step Icon Circle */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                  isCompleted
                    ? 'bg-green-500 border-green-200 shadow-lg shadow-green-200'
                    : isCurrent
                    ? 'bg-white border-orange-400 shadow-lg shadow-orange-200 animate-pulse'
                    : step.warning
                    ? 'bg-yellow-100 border-yellow-400'
                    : 'bg-gray-100 border-gray-300'
                }`}>
                  <span className="text-2xl">
                    {isCompleted ? '✓' : step.icon}
                  </span>
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className={`rounded-xl p-4 ${
                    isCompleted
                      ? 'bg-green-50 border-2 border-green-200'
                      : isCurrent
                      ? step.highlight
                        ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 shadow-lg'
                        : 'bg-blue-50 border-2 border-blue-300 shadow-lg'
                      : step.warning
                      ? 'bg-yellow-50 border-2 border-yellow-200'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-lg font-bold ${
                        isCompleted
                          ? 'text-green-900'
                          : isCurrent
                          ? step.highlight ? 'text-orange-900' : 'text-blue-900'
                          : step.warning
                          ? 'text-yellow-900'
                          : 'text-gray-500'
                      }`}>
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          step.highlight
                            ? 'bg-orange-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}>
                          Current
                        </span>
                      )}
                    </div>

                    {/* Step Description */}
                    <p className={`text-sm mb-2 ${
                      isCompleted
                        ? 'text-green-700'
                        : isCurrent
                        ? 'text-gray-700 font-medium'
                        : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>

                    {/* Timestamp */}
                    {step.timestamp && (
                      <p className="text-xs text-gray-600 flex items-center space-x-1">
                        <span>🕐</span>
                        <span>{formatTimestamp(step.timestamp)}</span>
                      </p>
                    )}

                    {/* Tracking Info */}
                    {step.trackingInfo && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Tracking Details:</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {step.trackingInfo.courier} - {step.trackingInfo.trackingNumber}
                        </p>
                      </div>
                    )}

                    {/* COD Special Note */}
                    {step.highlight && isCurrent && (
                      <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                        <p className="text-xs text-orange-900 font-semibold flex items-center space-x-1">
                          <span>💡</span>
                          <span>Keep exact amount ready for faster delivery</span>
                        </p>
                      </div>
                    )}

                    {/* Payment Warning */}
                    {step.warning && isCurrent && (
                      <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                        <p className="text-xs text-yellow-900 font-semibold flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>Please upload payment proof to proceed</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Cancelled State */}
      {order.status === 'CANCELLED' && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">✕</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-900">Order Cancelled</h4>
              <p className="text-sm text-red-700">
                This order has been cancelled
                {order.cancelledAt && ` on ${formatTimestamp(order.cancelledAt)}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTimeline;
