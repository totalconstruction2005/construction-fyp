import React, { useCallback, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 max-w-sm pointer-events-none">
      <div className="space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const styles = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      titleColor: 'text-emerald-900',
      messageColor: 'text-emerald-700',
      closeColor: 'text-emerald-600 hover:text-emerald-900',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      closeColor: 'text-red-600 hover:text-red-900',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      titleColor: 'text-amber-900',
      messageColor: 'text-amber-700',
      closeColor: 'text-amber-600 hover:text-amber-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      closeColor: 'text-blue-600 hover:text-blue-900',
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={`
        ${style.bg} border ${style.border} rounded-lg p-4 shadow-lg pointer-events-auto
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{style.icon}</div>

        <div className="flex-1 min-w-0">
          {toast.title && (
            <h3 className={`font-semibold ${style.titleColor} text-sm`}>
              {toast.title}
            </h3>
          )}
          <p className={`${style.messageColor} text-sm ${toast.title ? 'mt-1' : ''}`}>
            {toast.message}
          </p>

          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                handleClose();
              }}
              className={`text-sm font-semibold mt-2 ${style.titleColor} hover:opacity-75 transition`}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-1 rounded transition ${style.closeColor}`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
