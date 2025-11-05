import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((message) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message) => showToast(message, 'info'), [showToast]);
  const warning = useCallback((message) => showToast(message, 'warning'), [showToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, info, warning, showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const { type, message } = toast;

  const styles = {
    success: {
      gradient: 'from-green-500 to-emerald-600',
      icon: '✓',
      iconBg: 'bg-white/20',
      progress: 'bg-green-700',
      border: 'border-green-400'
    },
    error: {
      gradient: 'from-red-500 to-red-600',
      icon: '✕',
      iconBg: 'bg-white/20',
      progress: 'bg-red-700',
      border: 'border-red-400'
    },
    warning: {
      gradient: 'from-yellow-500 to-orange-500',
      icon: '⚠',
      iconBg: 'bg-white/20',
      progress: 'bg-yellow-700',
      border: 'border-yellow-400'
    },
    info: {
      gradient: 'from-blue-500 to-blue-600',
      icon: 'ℹ',
      iconBg: 'bg-white/20',
      progress: 'bg-blue-700',
      border: 'border-blue-400'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`bg-gradient-to-r ${style.gradient} text-white rounded-xl shadow-2xl transform transition-all duration-300 animate-slide-in-right min-w-[320px] max-w-md relative overflow-hidden border-2 ${style.border}`}>
      <div className="px-5 py-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center`}>
              <span className="text-2xl font-bold">{style.icon}</span>
            </div>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-semibold leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div className={`h-full ${style.progress} animate-progress`}></div>
      </div>
    </div>
  );
};

export default Toast;
