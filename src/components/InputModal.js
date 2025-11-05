import React, { useState, useEffect, useRef } from 'react';

/**
 * Reusable Input Modal Component
 * Professional replacement for window.prompt()
 */
function InputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  placeholder = '',
  initialValue = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  type = 'info', // 'info', 'warning', 'success'
  icon = '✏️',
  inputType = 'text', // 'text', 'textarea'
  required = true,
  maxLength = 500
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const typeStyles = {
    info: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    warning: {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      button: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
    },
    success: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      button: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (required && !value.trim()) return;
    onSubmit(value);
    onClose();
    setValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputType === 'text' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className={`${style.bg} border-l-4 ${style.border} p-4 rounded`}>
              <p className={`text-sm ${style.text}`}>
                {message}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {placeholder || 'Enter value'} {required && <span className="text-red-500">*</span>}
            </label>
            {inputType === 'textarea' ? (
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                maxLength={maxLength}
              />
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={maxLength}
              />
            )}
            {maxLength && (
              <p className="mt-1 text-xs text-gray-500">
                {value.length}/{maxLength} characters
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setValue('');
              }}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={required && !value.trim()}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${style.button} text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputModal;
