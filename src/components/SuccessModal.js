import React from 'react';

/**
 * Reusable Success/Info Modal Component
 * Professional replacement for alert() - for informational messages
 */
function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  type = 'success', // 'success', 'error', 'info'
  icon,
  autoClose = false,
  autoCloseDelay = 2000
}) {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      icon: icon || '✓',
      defaultTitle: 'Success!'
    },
    error: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      icon: icon || '✕',
      defaultTitle: 'Error'
    },
    info: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      icon: icon || 'ℹ',
      defaultTitle: 'Information'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4 rounded-t-lg`}>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="text-3xl mr-3">{config.icon}</span>
            {title || config.defaultTitle}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className={`${config.bg} border-l-4 ${config.border} p-4 rounded`}>
            <p className={`text-sm ${config.text} whitespace-pre-line`}>
              {message}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
