import React from 'react';

/**
 * Reusable Confirmation Modal Component
 * Professional replacement for window.confirm()
 */
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'success', 'info'
  icon = '⚠️'
}) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      button: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
    },
    danger: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      button: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    },
    success: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      button: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    },
    info: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    }
  };

  const style = typeStyles[type] || typeStyles.warning;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className={`bg-gradient-to-r ${style.gradient} px-6 py-4 rounded-t-lg`}>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="text-3xl mr-3">{icon}</span>
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className={`${style.bg} border-l-4 ${style.border} p-4 rounded`}>
            <p className={`text-sm ${style.text}`}>
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${style.button} text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
