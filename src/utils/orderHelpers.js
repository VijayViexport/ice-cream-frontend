/**
 * Order Helper Utilities
 * Provides payment-method-aware status information and labels
 */

/**
 * Check if payment method is COD
 */
export const isCODOrder = (paymentMethod) => {
  return paymentMethod === 'OFFLINE_CASH';
};

/**
 * Check if payment method is prepaid
 */
export const isPrepaidOrder = (paymentMethod) => {
  return ['OFFLINE_BANK_TRANSFER', 'OFFLINE_CHEQUE'].includes(paymentMethod);
};

/**
 * Get payment method display name
 */
export const getPaymentMethodName = (paymentMethod) => {
  const methodNames = {
    'OFFLINE_CASH': 'Cash on Delivery',
    'OFFLINE_BANK_TRANSFER': 'Bank Transfer',
    'OFFLINE_CHEQUE': 'Cheque Payment'
  };
  return methodNames[paymentMethod] || paymentMethod;
};

/**
 * Get payment method icon
 */
export const getPaymentMethodIcon = (paymentMethod) => {
  const icons = {
    'OFFLINE_CASH': '💵',
    'OFFLINE_BANK_TRANSFER': '🏦',
    'OFFLINE_CHEQUE': '📝'
  };
  return icons[paymentMethod] || '💳';
};

/**
 * Get status information with payment-method-aware labels
 */
export const getStatusInfo = (status, paymentMethod) => {
  const isCOD = isCODOrder(paymentMethod);

  const statusMap = {
    PENDING_PAYMENT: {
      color: isCOD
        ? 'bg-blue-100 text-blue-800 border-blue-300'
        : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: isCOD ? '✓' : '⏳',
      label: isCOD ? 'Order Confirmed' : 'Pending Payment',
      description: isCOD
        ? 'Order confirmed and ready for processing'
        : 'Awaiting payment confirmation',
      action: isCOD ? null : 'Upload payment proof to proceed'
    },
    PAID: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: isCOD ? '📦' : '💳',
      label: isCOD ? 'Processing' : 'Payment Confirmed',
      description: isCOD
        ? 'Order being prepared for shipment'
        : 'Payment verified, preparing for shipment'
    },
    DISPATCHED: {
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '🚚',
      label: 'Dispatched',
      description: isCOD
        ? 'On the way - Payment due on delivery'
        : 'Order shipped and on its way'
    },
    DELIVERED: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '✓',
      label: 'Delivered',
      description: isCOD
        ? 'Order delivered successfully'
        : 'Order delivered successfully'
    },
    CANCELLED: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: '✕',
      label: 'Cancelled',
      description: 'Order has been cancelled'
    }
  };

  return statusMap[status] || statusMap.PENDING_PAYMENT;
};

/**
 * Get payment status badge info
 */
export const getPaymentStatusInfo = (paymentStatus, paymentMethod) => {
  const isCOD = isCODOrder(paymentMethod);

  if (isCOD) {
    // For COD, payment status is different
    const codStatusMap = {
      PENDING: {
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: '💵',
        label: 'Pay on Delivery',
        description: 'Payment will be collected upon delivery'
      },
      PAID: {
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '✓',
        label: 'Payment Collected',
        description: 'Payment received on delivery'
      },
      FAILED: {
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '✕',
        label: 'Payment Failed',
        description: 'Payment not collected'
      }
    };
    return codStatusMap[paymentStatus] || codStatusMap.PENDING;
  } else {
    // For prepaid orders
    const prepaidStatusMap = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '⏳',
        label: 'Payment Pending',
        description: 'Awaiting payment proof upload'
      },
      PAID: {
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '✓',
        label: 'Payment Verified',
        description: 'Payment confirmed by admin'
      },
      FAILED: {
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '✕',
        label: 'Payment Verification Failed',
        description: 'Payment proof rejected'
      }
    };
    return prepaidStatusMap[paymentStatus] || prepaidStatusMap.PENDING;
  }
};

/**
 * Get next action for customer based on order state
 */
export const getCustomerNextAction = (order) => {
  const isCOD = isCODOrder(order.paymentMethod);

  // Cancelled orders have no action
  if (order.status === 'CANCELLED') {
    return {
      action: null,
      message: 'Order has been cancelled'
    };
  }

  // Delivered orders
  if (order.status === 'DELIVERED') {
    return {
      action: 'reorder',
      message: 'Order completed. Want to order again?'
    };
  }

  // Dispatched orders
  if (order.status === 'DISPATCHED') {
    if (isCOD) {
      return {
        action: 'prepare_payment',
        message: 'Keep exact amount ready for delivery',
        amount: order.total
      };
    } else {
      return {
        action: 'track',
        message: 'Track your order delivery'
      };
    }
  }

  // Paid orders (processing)
  if (order.status === 'PAID') {
    return {
      action: 'wait',
      message: 'Order is being prepared for shipment'
    };
  }

  // Pending payment - different for COD vs prepaid
  if (order.status === 'PENDING_PAYMENT') {
    if (isCOD) {
      return {
        action: 'wait',
        message: 'Order confirmed. We will dispatch soon'
      };
    } else {
      if (!order.paymentProofUrl) {
        return {
          action: 'upload_proof',
          message: 'Upload payment proof to proceed',
          urgent: true
        };
      } else {
        return {
          action: 'wait',
          message: 'Payment proof uploaded. Awaiting verification'
        };
      }
    }
  }

  return {
    action: null,
    message: ''
  };
};

/**
 * Calculate order progress percentage
 */
export const getOrderProgress = (order) => {
  const isCOD = isCODOrder(order.paymentMethod);

  if (order.status === 'CANCELLED') return 0;
  if (order.status === 'DELIVERED') return 100;

  if (isCOD) {
    // COD: Placed (20%) → Confirmed (40%) → Dispatched (70%) → Delivered (100%)
    const progressMap = {
      'PENDING_PAYMENT': 40, // Confirmed
      'PAID': 40, // Same as confirmed for COD
      'DISPATCHED': 70,
      'DELIVERED': 100
    };
    return progressMap[order.status] || 20;
  } else {
    // Prepaid: Placed (20%) → Payment (40%) → Dispatched (70%) → Delivered (100%)
    const progressMap = {
      'PENDING_PAYMENT': order.paymentProofUrl ? 30 : 20,
      'PAID': 50,
      'DISPATCHED': 75,
      'DELIVERED': 100
    };
    return progressMap[order.status] || 20;
  }
};

/**
 * Format order amount in Indian format
 */
export const formatAmount = (amount) => {
  return `₹${amount?.toLocaleString('en-IN')}`;
};

/**
 * Format date in readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get estimated delivery date (example: 3-5 days from dispatch)
 */
export const getEstimatedDelivery = (order) => {
  if (order.status === 'DELIVERED') {
    return formatDate(order.deliveredAt);
  }

  if (order.status === 'DISPATCHED' && order.dispatchedAt) {
    const dispatchDate = new Date(order.dispatchedAt);
    const minDate = new Date(dispatchDate);
    const maxDate = new Date(dispatchDate);
    minDate.setDate(minDate.getDate() + 3);
    maxDate.setDate(maxDate.getDate() + 5);

    return `${minDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${maxDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  return 'Will be updated after dispatch';
};
